# Clipline Cloud Deployment Operations

This runbook covers the v1 Docker Compose profiles, operational limits, backup/restore, and
failure-mode checks.

## Compose Profiles

Run commands from `deploy/compose/`.

| File | Purpose |
|------|---------|
| `docker-compose.yml` | SQLite + local disk. Local smoke-test profile. |
| `docker-compose.caddy.yml` | SQLite + local disk behind Caddy automatic HTTPS. |
| `docker-compose.postgres.yml` | Postgres metadata DB + local disk media. |
| `docker-compose.s3.yml` | SQLite metadata DB + external S3-compatible media storage. |
| `docker-compose.minio.yml` | SQLite metadata DB + bundled MinIO for local S3 testing. |

The default and MinIO profiles run with local-test defaults:

```sh
docker compose -f docker-compose.yml up -d
docker compose -f docker-compose.minio.yml up -d
```

The first boot creates the initial admin account. If no bootstrap password is configured, read the
generated one-time password from logs:

```sh
docker compose -f docker-compose.yml logs clipline-cloud
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

For the Postgres profile, `database_url.txt` should contain a full DSN matching the Postgres
password, for example:

```text
postgres://clipline:replace-with-postgres-password@postgres:5432/clipline
```

## Production HTTPS

Use `docker-compose.caddy.yml` for the single-host HTTPS path:

```sh
CLIPLINE_DOMAIN=clips.example.com docker compose -f docker-compose.caddy.yml up -d
```

The Caddy service uses a fixed internal IP (`172.30.0.2`) and the app sets
`CLIPLINE_TRUSTED_PROXY_HOPS=172.30.0.2`. `X-Forwarded-For` is ignored unless the socket peer is one
of the configured trusted proxy IPs.

## Operator Limits

Defaults:

| Setting | Default |
|---------|---------|
| `CLIPLINE_MAX_UPLOAD_SIZE_BYTES` | `5368709120` (5 GiB) |
| `CLIPLINE_UPLOAD_SESSION_TTL_SECONDS` | `86400` (24 h) |
| `CLIPLINE_UPLOAD_PART_SIZE_BYTES` | `8388608` (8 MiB) |
| `CLIPLINE_SINGLE_PUT_MAX_BYTES` | `67108864` (64 MiB) |
| `CLIPLINE_MAX_ACTIVE_UPLOAD_SESSIONS_PER_USER` | `16` |
| `CLIPLINE_USER_STORAGE_QUOTA_BYTES` | unset / `0` disables quota |
| `CLIPLINE_GLOBAL_STORAGE_WARNING_THRESHOLD_BYTES` | unset / `0` disables warning |

The server enforces the per-user storage quota when an upload session is created. The global warning
threshold is surfaced in admin diagnostics and does not block uploads.

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
- Misconfigured public URL: non-HTTPS URLs log a startup warning; HTTPS Caddy profile should not.
- Metadata row without object: media returns a storage-not-found response and diagnostics stay visible.
- Object without row: object is ignored by the API; restore/migration runbooks preserve DB as source of truth.

Back up before every upgrade that may run migrations.
