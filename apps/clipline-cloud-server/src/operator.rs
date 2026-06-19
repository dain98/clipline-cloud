use std::{env, fs, path::PathBuf};

use anyhow::{bail, Context};
use clipline_cloud_db::{Database, NewAuditLogEntry, Repositories, User};
use serde_json::json;
use sqlx::types::Json;

use crate::{auth, config::Config};

const RESET_PASSWORD_ENV: &str = "CLIPLINE_ADMIN_RESET_PASSWORD";
const RESET_PASSWORD_FILE_ENV: &str = "CLIPLINE_ADMIN_RESET_PASSWORD_FILE";

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) enum Invocation {
    Server,
    Help,
    ResetPassword(ResetPasswordCommand),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct ResetPasswordCommand {
    username: Option<String>,
    password_source: PasswordSource,
    keep_disabled: bool,
}

#[derive(Debug, Clone, PartialEq, Eq)]
enum PasswordSource {
    Auto,
    Generate,
    Value(String),
    File(PathBuf),
}

struct ResolvedPassword {
    password: String,
    generated: bool,
}

pub(crate) fn print_help() {
    println!(
        "\
Clipline Cloud

Usage:
  clipline-cloud-server
  clipline-cloud-server admin reset-password [username] [options]

Commands:
  admin reset-password    Reset the owner password, or a named user's password.

Reset options:
  --password <value>      Use this password.
  --password-file <path>  Read the password from a file.
  --generate             Generate and print a one-time password.
  --keep-disabled        Do not re-enable the user if the account is disabled.
  -h, --help             Show this help.

If no username is provided, the configured owner account is reset.
If no password option or {RESET_PASSWORD_ENV}[_FILE] is provided, a
one-time password is generated and printed once."
    );
}

pub(crate) fn parse_invocation<I, S>(args: I) -> anyhow::Result<Invocation>
where
    I: IntoIterator<Item = S>,
    S: Into<String>,
{
    let args = args.into_iter().map(Into::into).collect::<Vec<_>>();
    if args.is_empty() {
        return Ok(Invocation::Server);
    }

    if args.len() == 1 && matches!(args[0].as_str(), "-h" | "--help" | "help") {
        return Ok(Invocation::Help);
    }

    if args.first().map(String::as_str) != Some("admin") {
        bail!("unknown command {:?}; run with --help for usage", args[0]);
    }
    if args.get(1).map(String::as_str) != Some("reset-password") {
        bail!("unknown admin command; run with --help for usage");
    }

    parse_reset_password(&args[2..])
}

pub(crate) async fn reset_password(
    command: ResetPasswordCommand,
    config: &Config,
) -> anyhow::Result<()> {
    let database = Database::connect_and_migrate(&config.database_url)
        .await
        .context("failed to connect database and run migrations")?;
    let repositories = Repositories::new(database);
    let target = load_target_user(&repositories, command.username.as_deref()).await?;
    let resolved = resolve_password(&command.password_source)?;
    auth::validate_new_password(&resolved.password)
        .map_err(|error| anyhow::anyhow!("{}", error.message()))?;
    let password_hash = auth::hash_password(&resolved.password)
        .map_err(|error| anyhow::anyhow!("{}", error.message()))?;

    repositories
        .users
        .update_password_hash(&target.id, &password_hash)
        .await?;

    println!("Password reset for user: {}", target.username);
    if resolved.generated {
        println!("One-time password: {}", resolved.password);
        println!("Save this password now. It will not be shown again.");
    }

    if target.is_disabled && !command.keep_disabled {
        repositories.users.set_disabled(&target.id, false).await?;
    }
    repositories.sessions.revoke_for_user(&target.id).await?;
    repositories
        .device_tokens
        .revoke_all_for_user(&target.id)
        .await?;
    repositories
        .reset_password_tokens
        .delete_for_user(&target.id)
        .await?;

    let mut audit = NewAuditLogEntry::new("user.password_operator_reset");
    audit.target_type = Some("user".to_string());
    audit.target_id = Some(target.id.clone());
    audit.metadata_json = Some(Json(json!({
        "username": target.username,
        "re_enabled": target.is_disabled && !command.keep_disabled,
    })));
    repositories.audit_log.create(&audit).await?;

    if target.is_disabled && command.keep_disabled {
        println!("Account remains disabled because --keep-disabled was set.");
    } else if target.is_disabled {
        println!("Account was disabled and has been re-enabled.");
    }
    println!("Existing browser sessions, device tokens, and reset links were revoked.");

    Ok(())
}

fn parse_reset_password(args: &[String]) -> anyhow::Result<Invocation> {
    let mut username = None;
    let mut password_source = PasswordSource::Auto;
    let mut keep_disabled = false;
    let mut index = 0;

    while index < args.len() {
        let arg = &args[index];
        match arg.as_str() {
            "-h" | "--help" => return Ok(Invocation::Help),
            "--generate" => {
                set_password_source(&mut password_source, PasswordSource::Generate)?;
            }
            "--keep-disabled" => {
                keep_disabled = true;
            }
            "--password" => {
                index += 1;
                let Some(value) = args.get(index) else {
                    bail!("--password requires a value");
                };
                set_password_source(&mut password_source, PasswordSource::Value(value.clone()))?;
            }
            "--password-file" => {
                index += 1;
                let Some(value) = args.get(index) else {
                    bail!("--password-file requires a path");
                };
                set_password_source(
                    &mut password_source,
                    PasswordSource::File(PathBuf::from(value)),
                )?;
            }
            value if value.starts_with("--password=") => {
                let value = value
                    .strip_prefix("--password=")
                    .expect("prefix was checked")
                    .to_string();
                set_password_source(&mut password_source, PasswordSource::Value(value))?;
            }
            value if value.starts_with("--password-file=") => {
                let value = value
                    .strip_prefix("--password-file=")
                    .expect("prefix was checked");
                set_password_source(
                    &mut password_source,
                    PasswordSource::File(PathBuf::from(value)),
                )?;
            }
            value if value.starts_with('-') => {
                bail!("unknown reset-password option {value:?}");
            }
            value => {
                if username.replace(value.to_string()).is_some() {
                    bail!("reset-password accepts at most one username");
                }
            }
        }
        index += 1;
    }

    Ok(Invocation::ResetPassword(ResetPasswordCommand {
        username,
        password_source,
        keep_disabled,
    }))
}

fn set_password_source(current: &mut PasswordSource, next: PasswordSource) -> anyhow::Result<()> {
    if !matches!(current, PasswordSource::Auto) {
        bail!("only one password source may be provided");
    }
    *current = next;
    Ok(())
}

async fn load_target_user(
    repositories: &Repositories,
    username: Option<&str>,
) -> anyhow::Result<User> {
    if let Some(username) = username {
        return repositories
            .users
            .get_by_username(username)
            .await?
            .with_context(|| format!("user {username:?} was not found"));
    }

    let settings = repositories.settings.get().await?;
    if let Some(owner_user_id) = settings.owner_user_id.as_deref() {
        return repositories
            .users
            .get(owner_user_id)
            .await?
            .with_context(|| format!("configured owner user {owner_user_id:?} was not found"));
    }

    repositories
        .users
        .first_admin()
        .await?
        .context("no configured owner or active admin user was found")
}

fn resolve_password(source: &PasswordSource) -> anyhow::Result<ResolvedPassword> {
    match source {
        PasswordSource::Auto => resolve_auto_password(),
        PasswordSource::Generate => Ok(generated_password()),
        PasswordSource::Value(value) => Ok(ResolvedPassword {
            password: value.clone(),
            generated: false,
        }),
        PasswordSource::File(path) => Ok(ResolvedPassword {
            password: read_password_file(path.clone())?,
            generated: false,
        }),
    }
}

fn resolve_auto_password() -> anyhow::Result<ResolvedPassword> {
    if let Some(path) = env::var_os(RESET_PASSWORD_FILE_ENV) {
        return Ok(ResolvedPassword {
            password: read_password_file(PathBuf::from(path))?,
            generated: false,
        });
    }
    if let Ok(password) = env::var(RESET_PASSWORD_ENV) {
        if !password.is_empty() {
            return Ok(ResolvedPassword {
                password,
                generated: false,
            });
        }
    }
    Ok(generated_password())
}

fn generated_password() -> ResolvedPassword {
    ResolvedPassword {
        password: auth::generate_one_time_password(),
        generated: true,
    }
}

fn read_password_file(path: PathBuf) -> anyhow::Result<String> {
    fs::read_to_string(&path)
        .with_context(|| format!("failed to read password file {}", path.display()))
        .map(|value| value.trim_end_matches(['\r', '\n']).to_string())
}

#[cfg(test)]
mod tests {
    use clipline_cloud_db::NewUser;

    use super::*;

    #[test]
    fn parse_empty_invocation_runs_server() {
        assert_eq!(
            parse_invocation(Vec::<String>::new()).expect("parse"),
            Invocation::Server
        );
    }

    #[test]
    fn parse_reset_password_defaults_to_owner_and_auto_password() {
        assert_eq!(
            parse_invocation(["admin", "reset-password"]).expect("parse"),
            Invocation::ResetPassword(ResetPasswordCommand {
                username: None,
                password_source: PasswordSource::Auto,
                keep_disabled: false,
            })
        );
    }

    #[test]
    fn parse_reset_password_accepts_username_and_flags() {
        assert_eq!(
            parse_invocation([
                "admin",
                "reset-password",
                "dain",
                "--password-file",
                "/run/secrets/admin_password",
                "--keep-disabled",
            ])
            .expect("parse"),
            Invocation::ResetPassword(ResetPasswordCommand {
                username: Some("dain".to_string()),
                password_source: PasswordSource::File(PathBuf::from("/run/secrets/admin_password")),
                keep_disabled: true,
            })
        );
    }

    #[test]
    fn parse_reset_password_rejects_multiple_password_sources() {
        let error = parse_invocation([
            "admin",
            "reset-password",
            "--password",
            "secret-password",
            "--generate",
        ])
        .expect_err("multiple password sources should fail");
        assert!(error.to_string().contains("only one password source"));
    }

    #[tokio::test]
    async fn reset_password_updates_owner_and_reenables_account() {
        let temp_dir = tempfile::tempdir().expect("temp dir");
        let database_url = format!("sqlite://{}", temp_dir.path().join("clipline.db").display());
        let config = Config::for_tests(&database_url, temp_dir.path());
        let database = Database::connect_and_migrate(&config.database_url)
            .await
            .expect("migrate");
        let repositories = Repositories::new(database);
        let mut owner = NewUser::new(
            "admin",
            auth::hash_password("old-password").expect("hash"),
            "admin",
        );
        owner.is_disabled = true;
        let owner = repositories
            .users
            .create(&owner)
            .await
            .expect("create user");
        repositories
            .settings
            .set_owner_user_id(&owner.id)
            .await
            .expect("set owner");

        reset_password(
            ResetPasswordCommand {
                username: None,
                password_source: PasswordSource::Value("new-password".to_string()),
                keep_disabled: false,
            },
            &config,
        )
        .await
        .expect("reset password");

        let updated = repositories
            .users
            .get(&owner.id)
            .await
            .expect("get user")
            .expect("user exists");
        assert!(!updated.is_disabled);
        auth::require_reauth(&updated, "new-password").expect("new password verifies");
    }
}
