use anyhow::{anyhow, Context, Result};
use chrono::{DateTime, Utc};
use clipline_cloud_db::AppSettings;
use lettre::{
    message::Mailbox, transport::smtp::authentication::Credentials, AsyncSmtpTransport,
    AsyncTransport, Message, Tokio1Executor,
};
use url::Url;

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct InviteEmail {
    pub(crate) to_email: String,
    pub(crate) invite_url: String,
    pub(crate) expires_at: DateTime<Utc>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct SmtpInviteConfig {
    pub(crate) host: String,
    pub(crate) port: u16,
    pub(crate) tls_mode: String,
    pub(crate) username: Option<String>,
    pub(crate) password: Option<String>,
    pub(crate) from_email: String,
    pub(crate) from_name: Option<String>,
}

impl SmtpInviteConfig {
    pub(crate) fn from_settings(settings: &AppSettings) -> Result<Option<Self>> {
        if !settings.smtp_enabled {
            return Ok(None);
        }
        let host = required_setting(settings.smtp_host.as_deref(), "SMTP host")?;
        let from_email = required_setting(settings.smtp_from_email.as_deref(), "SMTP from email")?;
        let port = u16::try_from(settings.smtp_port).context("SMTP port is out of range")?;
        if port == 0 {
            return Err(anyhow!("SMTP port is out of range"));
        }
        match settings.smtp_tls_mode.as_str() {
            "starttls" | "tls" | "none" => {}
            _ => return Err(anyhow!("SMTP TLS mode is invalid")),
        }
        Ok(Some(Self {
            host,
            port,
            tls_mode: settings.smtp_tls_mode.clone(),
            username: non_empty(settings.smtp_username.as_deref()),
            password: non_empty(settings.smtp_password.as_deref()),
            from_email,
            from_name: non_empty(settings.smtp_from_name.as_deref()),
        }))
    }
}

pub(crate) async fn send_invite(config: &SmtpInviteConfig, invite: InviteEmail) -> Result<()> {
    let from: Mailbox = match config.from_name.as_deref() {
        Some(name) => format!("{name} <{}>", config.from_email).parse(),
        None => config.from_email.parse(),
    }
    .context("SMTP from address is invalid")?;
    let to: Mailbox = invite.to_email.parse().context("invite email is invalid")?;
    let message = Message::builder()
        .from(from)
        .to(to)
        .subject("Your Clipline Cloud invite")
        .body(invite_body(&invite.invite_url, invite.expires_at))
        .context("failed to build invite email")?;

    let mut builder = match config.tls_mode.as_str() {
        "tls" => AsyncSmtpTransport::<Tokio1Executor>::relay(&config.host)
            .context("failed to configure SMTP TLS relay")?,
        "starttls" => AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(&config.host)
            .context("failed to configure SMTP STARTTLS relay")?,
        "none" => AsyncSmtpTransport::<Tokio1Executor>::builder_dangerous(&config.host),
        _ => return Err(anyhow!("SMTP TLS mode is invalid")),
    }
    .port(config.port);

    if let Some(username) = &config.username {
        builder = builder.credentials(Credentials::new(
            username.clone(),
            config.password.clone().unwrap_or_default(),
        ));
    }

    builder
        .build()
        .send(message)
        .await
        .context("SMTP invite send failed")?;
    Ok(())
}

pub(crate) fn reset_url(public_url: &Url, reset_token: &str) -> Result<Url> {
    let mut url = public_url
        .join("reset-password")
        .context("failed to build reset URL")?;
    url.query_pairs_mut().append_pair("token", reset_token);
    Ok(url)
}

pub(crate) fn invite_url(public_url: &Url, invite_token: &str) -> Result<Url> {
    let mut url = reset_url(public_url, invite_token)?;
    url.query_pairs_mut().append_pair("invite", "1");
    Ok(url)
}

fn invite_body(invite_url: &str, expires_at: DateTime<Utc>) -> String {
    format!(
        "You have been invited to Clipline Cloud.\n\nSet up your account: {invite_url}\n\nThis invite link can be opened once and expires at {expires_at}.\nIf you did not expect this invite, you can ignore this email.\n"
    )
}

fn required_setting(value: Option<&str>, label: &str) -> Result<String> {
    non_empty(value).ok_or_else(|| anyhow!("{label} is required when SMTP is enabled"))
}

fn non_empty(value: Option<&str>) -> Option<String> {
    value
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToOwned::to_owned)
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::TimeZone;
    #[test]
    fn reset_url_builds_from_public_url() {
        let public_url = Url::parse("https://clips.example.com/base/").expect("url");
        let url = reset_url(&public_url, "clp_rst_token").expect("reset URL");
        assert_eq!(
            url.as_str(),
            "https://clips.example.com/base/reset-password?token=clp_rst_token"
        );
    }

    #[test]
    fn invite_url_marks_invite_claim() {
        let public_url = Url::parse("https://clips.example.com/base/").expect("url");
        let url = invite_url(&public_url, "clp_inv_token").expect("invite URL");
        assert_eq!(
            url.as_str(),
            "https://clips.example.com/base/reset-password?token=clp_inv_token&invite=1"
        );
    }

    #[test]
    fn invite_body_contains_setup_context_without_username() {
        let expires_at = Utc.with_ymd_and_hms(2026, 6, 19, 12, 0, 0).unwrap();
        let url = "https://clips.example.com/reset-password?token=abc&invite=1";
        let body = invite_body(url, expires_at);
        assert!(body.contains(url));
        assert!(body.contains("Set up your account"));
        assert!(body.contains("expires at"));
        assert!(!body.contains("Username:"));
    }
}
