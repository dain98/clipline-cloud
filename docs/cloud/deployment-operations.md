# Clipline Cloud Deployment Operations

This runbook covers the v1 Docker Compose profiles, operational limits, backup/restore, and
failure-mode checks. For step-by-step first-time setup of each profile, start with the
[deployment guide](deployment-guide.md); this document is the deeper operations reference.

## Compose Profiles

Run commands from `deploy/compose/`.

| File | Purpose |
|------|---------|
| `docker-compose.yml` | SQLite + local disk. Local smoke-test profile. |
| `docker-compose.standalone.yml` | SQLite + local disk with relative bind mounts and file-backed secrets. |
| `docker-compose.caddy.yml` | SQLite + local disk behind Caddy automatic HTTPS. |
| `docker-compose.postgres.yml` | Postgres metadata DB + local disk media. |
| `docker-compose.s3.yml` | SQLite metadata DB + external S3-compatible media storage. |
| `docker-compose.minio.yml` | SQLite metadata DB + bundled MinIO for local S3 testing. |

The default and MinIO profiles run with local-test defaults:

```sh
docker compose -f docker-compose.yml up -d
docker compose -f docker-compose.minio.yml up -d
```

Both local-test profiles generate stable local secrets into a named `clipline_secrets` volume on
first start. Removing that volume signs out browser sessions and invalidates outstanding CSRF
tokens. The MinIO profile is for local S3 testing only: MinIO ports bind to `127.0.0.1`, credentials
are generated into the local secrets volume, and operators should use `docker-compose.s3.yml` with a
real private bucket for production object storage.

For production-style local disk deployments without a git clone, prefer
`docker-compose.standalone.yml`. It avoids the `clipline-secrets` helper container and reads the
session secret from `./secrets/session_secret.txt`.

The first boot creates the initial owner account. If no bootstrap password is configured, read the
generated one-time password from logs:

```sh
docker compose -f docker-compose.yml logs clipline-cloud
```

Rotate the bootstrap owner password after first login, especially when using a fixed
`admin_password.txt` secret.

If the owner password is lost after first boot, reset it with the operator command. Run the command
against the same Compose file/profile that normally starts the app. With the standalone file, run it
from `/opt/cl-cloud`:

```sh
docker compose run --rm clipline-cloud admin reset-password
```

With a cloned profile file, include the profile file:

```sh
docker compose -f docker-compose.yml run --rm clipline-cloud admin reset-password
```

The command defaults to the configured owner account, generates and prints a one-time password when
no password is provided, re-enables a disabled target account unless `--keep-disabled` is set, and
revokes existing browser sessions, device tokens, and outstanding reset links. To reset a named user
or provide a fixed password:

```sh
docker compose run --rm clipline-cloud admin reset-password admin
docker compose run --rm -e CLIPLINE_ADMIN_RESET_PASSWORD='replace-with-temporary-password' \
  clipline-cloud admin reset-password admin
```

The Caddy, Postgres, and external-S3 profiles expect operator-provided files in
`deploy/compose/secrets/`. That directory is ignored except for its `.gitignore`.

Expected secret files:

```text
admin_password.txt
session_secret.txt
postgres_password.txt
database_url.txt
s3_access_key_id.txt
s3_secret_access_key.txt
```

The `clipline-cloud` container runs as UID `10001`. Secret files read by that
container (`admin_password.txt`, `session_secret.txt`, `database_url.txt`, and the
S3 credential files) must be readable by UID `10001`, for example with
`chown 10001:10001 <file>` and `chmod 400 <file>`.

For automated verification, the Compose secret file paths can be overridden without touching the
ignored `secrets/` directory:

```sh
CLIPLINE_COMPOSE_ADMIN_PASSWORD_FILE=/tmp/admin_password.txt \
CLIPLINE_COMPOSE_SESSION_SECRET_FILE=/tmp/session_secret.txt \
docker compose -f docker-compose.caddy.yml config
```

For the Postgres profile, `database_url.txt` should contain a full DSN matching the Postgres
password, for example:

```text
postgres://clipline:replace-with-postgres-password@postgres:5432/clipline
```

## Process Roles And Workers

The server supports three process roles:

| Role | HTTP server | Job runner | Use |
|------|-------------|------------|-----|
| `all` | yes | yes | Default single-container deployment. |
| `web` | yes | no | HTTP/API container when a separate worker is enabled. |
| `worker` | no | yes | Dedicated durable-job runner container. |

All Compose profiles default the `clipline-cloud` service to `all`. When enabling the `worker`
profile, also set the web service role to `web` so there is exactly one job runner container:

```sh
CLIPLINE_WEB_PROCESS_ROLE=web docker compose --profile worker up -d
```

With an explicit profile file:

```sh
CLIPLINE_WEB_PROCESS_ROLE=web \
docker compose -f docker-compose.postgres.yml --profile worker up -d
```

The worker starts after `clipline-cloud` is healthy, then runs cleanup, validation, thumbnail,
poster, and probe jobs from the shared `jobs` table. Atomic job claiming and stale-lock recovery
allow multiple workers, but start with one. Do not leave `CLIPLINE_WEB_PROCESS_ROLE` unset when
using `--profile worker`; the default `all` web container would also run a job loop, which is
unnecessary and can race while seeding recurring cleanup sweep jobs.

Prefer Postgres for production worker-split deployments. SQLite split mode works only when both
containers share the same host-local Docker volume; SQLite serializes writers and should not be run
from NFS/SMB or another network-backed volume.

## Smoke Verification

The repository includes a Docker-only smoke runner for repeatable operations checks:

```sh
deploy/compose/smoke.sh
```

By default it builds a local `clipline-cloud:ops-smoke` image, validates all six Compose files,
starts the default, MinIO, and Postgres profiles with temporary secrets, checks `/readyz`, creates an
admin device token, opens admin diagnostics, verifies SQLite/local and Postgres/local backup and
restore, exercises the MinIO direct-S3 upload path, and confirms that stopping MinIO/Postgres flips
`/readyz` to storage/database not-ready.

Useful variants:

```sh
CONFIG_ONLY=1 BUILD_IMAGE=0 deploy/compose/smoke.sh
BUILD_IMAGE=0 CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.36 deploy/compose/smoke.sh
RUN_PROFILES="default minio" deploy/compose/smoke.sh
RUN_DIRECT_S3=0 RUN_PROFILES=minio deploy/compose/smoke.sh
RUN_VIDEO_OPTIMIZATION=1 RUN_PROFILES="default minio" deploy/compose/smoke.sh
RUN_CADDY=1 RUN_PROFILES="" deploy/compose/smoke.sh
```

`RUN_VIDEO_OPTIMIZATION=1` turns on video optimization with smoke-specific CRF/max-width/min-savings
settings. It uploads a compressible fixture, waits for optimized `source.mp4` to become smaller,
checks owner range playback, and waits for regenerated thumbnail/poster JPEGs. Include both
`default` and `minio` profiles when you want local-disk plus S3-compatible coverage.

External S3 is intentionally opt-in because it writes to a real bucket. Use a disposable bucket or a
smoke/test prefix:

```sh
BUILD_IMAGE=0 \
RUN_PROFILES=s3 \
RUN_EXTERNAL_S3=1 \
CLIPLINE_HTTP_PORT=18080 \
CLIPLINE_S3_ENDPOINT=https://s3.example.com \
CLIPLINE_S3_BUCKET=clipline \
CLIPLINE_S3_REGION=us-east-1 \
CLIPLINE_S3_FORCE_PATH_STYLE=false \
CLIPLINE_S3_PREFIX=clipline-smoke/$(date +%Y%m%d%H%M%S) \
CLIPLINE_SMOKE_S3_ACCESS_KEY_ID=... \
CLIPLINE_SMOKE_S3_SECRET_ACCESS_KEY=... \
deploy/compose/smoke.sh
```

The external S3 smoke starts `docker-compose.s3.yml`, verifies `/readyz`, uploads a generated MP4
through the normal server-proxy path, waits for the clip to reach `ready`, checks owner media range
reads, waits for generated thumbnail/poster JPEGs, verifies public share data, and follows the
public media path. It soft-deletes the smoke clip at the end, but object cleanup is asynchronous, so
keep the prefix easy to remove after failed or interrupted runs. The command refuses to run the S3
profile unless `RUN_EXTERNAL_S3=1` and real S3 credentials are supplied through
`CLIPLINE_SMOKE_S3_*` values or the `CLIPLINE_COMPOSE_S3_*_FILE` secret-file variables.

`RUN_CADDY=1` checks localhost TLS plus secure headers through Caddy on host ports `8081`/`8443` by
default. Override `CLIPLINE_CADDY_HTTP_PORT` and `CLIPLINE_CADDY_HTTPS_PORT` when those ports are
busy or when rehearsing production-style `80`/`443` bindings. If Docker reports that the Caddy
network pool overlaps with an existing host network, override the Caddy subnet and matching static
IPs:

```sh
CLIPLINE_CADDY_SUBNET=172.31.250.0/24 \
CLIPLINE_CADDY_IP=172.31.250.2 \
CLIPLINE_APP_IP=172.31.250.10 \
RUN_CADDY=1 RUN_PROFILES="" deploy/compose/smoke.sh
```

Use the production HTTPS command below with a real DNS name for the ACME-backed deployment check.
If a smoke check fails, the active Compose project is left in place for `docker compose logs` and
manual inspection; remove it with `docker compose -p <project> -f <profile-file> down -v`.

## Production HTTPS

Use `docker-compose.caddy.yml` for the single-host HTTPS path:

```sh
CLIPLINE_DOMAIN=clips.example.com CLIPLINE_ACME_EMAIL=ops@example.com \
  docker compose -f docker-compose.caddy.yml up -d
```

Set `CLIPLINE_ACME_EMAIL` to a monitored address so ACME expiry and account notices reach an
operator.

The Caddy service defaults to internal IP `172.30.0.2`, and the app sets
`CLIPLINE_TRUSTED_PROXY_HOPS` from the same `CLIPLINE_CADDY_IP` value. `X-Forwarded-For` is ignored
unless the socket peer is one of the configured trusted proxy IPs. If you override the Compose
subnet, keep `CLIPLINE_CADDY_IP` and `CLIPLINE_APP_IP` inside that subnet so audit logs record the
real client IP instead of the proxy IP.

For production, pin `CLIPLINE_IMAGE` to a released version tag instead of relying on `:latest`.
See [`release-process.md`](release-process.md) for the tag workflow and post-release smoke checks.
Profiles that default to `http://localhost:8080` are local defaults; set `CLIPLINE_PUBLIC_URL` to
an HTTPS URL behind Caddy before exposing S3 or MinIO-backed deployments to users. Non-local
`http://` public URLs require `CLIPLINE_ALLOW_INSECURE_PUBLIC_URL=true` and should be reserved for
intentional insecure development or trusted-LAN testing.

## Operator Limits

Defaults:

| Setting | Default |
|---------|---------|
| `CLIPLINE_MAX_UPLOAD_SIZE_BYTES` | `5368709120` (5 GiB) |
| `CLIPLINE_UPLOAD_SESSION_TTL_SECONDS` | `86400` (24 h) |
| `CLIPLINE_UPLOAD_PART_SIZE_BYTES` | `8388608` (8 MiB) |
| `CLIPLINE_SINGLE_PUT_MAX_BYTES` | `67108864` (64 MiB) |
| `CLIPLINE_DIRECT_S3_UPLOADS` | `false` |
| `CLIPLINE_VIDEO_OPTIMIZATION` | `off` |
| `CLIPLINE_VIDEO_OPTIMIZATION_CRF` | `26` |
| `CLIPLINE_VIDEO_OPTIMIZATION_PRESET` | `veryfast` |
| `CLIPLINE_VIDEO_OPTIMIZATION_MAX_WIDTH` | unset / `0` disables resize |
| `CLIPLINE_VIDEO_OPTIMIZATION_MIN_SAVINGS_PERCENT` | `5` |
| `CLIPLINE_VIDEO_OPTIMIZATION_KEEP_ORIGINAL` | `false` |
| `CLIPLINE_MAX_ACTIVE_UPLOAD_SESSIONS_PER_USER` | `16` |
| `CLIPLINE_USER_STORAGE_QUOTA_BYTES` | unset / `0` disables quota |
| `CLIPLINE_GLOBAL_STORAGE_WARNING_THRESHOLD_BYTES` | unset / `0` disables warning |

The server enforces the per-user storage quota when an upload session is created. The global warning
threshold is surfaced in admin diagnostics and does not block uploads.

Upload body limits are enforced by the app's configured maximum upload size and Axum body limit.
Caddy's `reverse_proxy` does not add a separate request-body cap.

## Health And Diagnostics

- `GET /healthz`: process is alive.
- `GET /readyz`: database and storage probes both pass.
- `GET /api/v1/admin/overview`: version, backend, limits, storage totals, user/clip totals, proxy
  trust config, and global storage warning state.
- `GET /api/v1/admin/uploads/failed`: failed uploads.
- `GET /api/v1/admin/jobs/dead`: dead jobs.
- `GET /api/v1/admin/jobs/recent-errors`: recent job errors.
- `GET /api/v1/admin/audit/recent`: recent audit entries with resolved client IPs.

## Backup

A complete backup is database plus media from the same point in time.

### SQLite + Local Disk

Safest option: stop the app, copy `/data`, restart.

```sh
docker compose -f docker-compose.yml stop clipline-cloud
docker run --rm -v clipline-cloud_clipline_data:/data -v "$PWD/backups:/backup" alpine \
  sh -c 'cd /data && tar czf /backup/clipline-data.tgz .'
docker compose -f docker-compose.yml start clipline-cloud
```

For online SQLite backups, use SQLite's backup API or `VACUUM INTO`. Do not copy a live SQLite DB
file directly. Keep SQLite on local disk, not NFS or SMB.

### Postgres + Local Disk

Dump Postgres and copy the media volume from the same maintenance window:

```sh
docker compose -f docker-compose.postgres.yml exec postgres \
  pg_dump -U clipline -d clipline -Fc -f /tmp/clipline.dump
docker compose -f docker-compose.postgres.yml cp postgres:/tmp/clipline.dump ./backups/clipline.dump
docker run --rm -v clipline-cloud-postgres_clipline_data:/data -v "$PWD/backups:/backup" alpine \
  sh -c 'cd /data && tar czf /backup/clipline-media.tgz .'
```

### S3 Media

Back up the database. Protect media with bucket versioning, lifecycle policy, and provider backups.
The DB stores object keys; losing either the DB or bucket breaks restores.

## Restore

Restore into an empty deployment with the app stopped.

### SQLite + Local Disk

```sh
docker compose -f docker-compose.yml down
docker run --rm -v clipline-cloud_clipline_data:/data -v "$PWD/backups:/backup" alpine \
  sh -c 'rm -rf /data/* && tar xzf /backup/clipline-data.tgz -C /data'
docker compose -f docker-compose.yml up -d
```

### Postgres + Local Disk

```sh
docker compose -f docker-compose.postgres.yml stop clipline-cloud
docker compose -f docker-compose.postgres.yml cp ./backups/clipline.dump postgres:/tmp/clipline.dump
docker compose -f docker-compose.postgres.yml exec postgres \
  pg_restore -U clipline -d clipline --clean --if-exists /tmp/clipline.dump
docker run --rm -v clipline-cloud-postgres_clipline_data:/data -v "$PWD/backups:/backup" alpine \
  sh -c 'rm -rf /data/* && tar xzf /backup/clipline-media.tgz -C /data'
docker compose -f docker-compose.postgres.yml up -d clipline-cloud
```

### S3

Restore the DB first, then confirm the referenced bucket/prefix exists and contains the objects. Run
`/readyz` and open admin diagnostics before letting users resume uploads.

## Local To S3 Migration

Migration is explicit and not automatic.

1. Stop writes by stopping the app or placing it behind maintenance.
2. Take a full DB + local media backup.
3. Copy local object keys under `/data/objects/` into the target bucket/prefix, preserving paths.
4. Start the app with `CLIPLINE_STORAGE_BACKEND=s3` and matching `CLIPLINE_S3_*` settings.
5. Check `/readyz`, admin totals, and a representative private clip plus public share.
6. Keep the local backup until the S3 deployment has passed restore testing.

## Failure Checks

- DB unavailable: `/readyz` returns not ready; app logs `database.readyz_failed`.
- Storage unavailable or bad S3 credentials: startup or `/readyz` reports storage failure.
- Interrupted upload: clients resume with upload progress, received parts, and missing parts.
- Processing failed: durable jobs retry, then appear in admin dead-job diagnostics.
- Restart mid-upload or mid-processing: upload sessions and jobs are durable.
- Disk full: storage write fails and the upload stays retryable or failed with diagnostics.
- Permanent upload validation failure: the upload is marked failed with a stored reason, admin
  diagnostics show the reason, and the user can delete the failed upload before retrying.
- Misconfigured public URL: non-HTTPS URLs log a startup warning; HTTPS Caddy profile should not.
- Metadata row without object: media returns a storage-not-found response and diagnostics stay visible.
- Object without row: object is ignored by the API; restore/migration runbooks preserve DB as source of truth.

Back up before every upgrade that may run migrations.
