# Clipline Cloud Deployment Guide

This is the friendly, step-by-step guide to deploying Clipline Cloud v1.2.15 with Docker Compose. For the
deep operational runbook — operator limits, backup/restore details, migration, and failure-mode checks —
see [`deployment-operations.md`](deployment-operations.md).

For a hosted one-click setup where Railway runs the app, Postgres, and object storage, use the Railway
button in the project README instead of Docker Compose and host-mounted storage.

All commands run from `deploy/compose/` unless noted. Pin the image to the release tag:

```text
CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.15
```

Do not run `latest` in production.

## Prerequisites

- **Docker + Docker Compose** (Compose v2, i.e. `docker compose`).
- **HTTPS for any real deployment.** Either an existing reverse proxy (e.g. Nginx Proxy Manager) in front
  of the app, or the bundled Caddy profile, which gets certificates automatically.
- **A storage choice:** local disk (default) or an S3-compatible bucket.
- **A database choice:** SQLite (default) or Postgres.
- **A public URL.** Set `CLIPLINE_PUBLIC_URL` to the `https://` address users and the desktop app will use.
  It defaults to `http://localhost:8080`, which is fine only for local testing. Non-local `http://`
  URLs fail startup unless `CLIPLINE_ALLOW_INSECURE_PUBLIC_URL=true` is set intentionally for an
  insecure development or trusted-LAN deployment.
- **A stable session secret.** The Compose profiles mount `CLIPLINE_SESSION_SECRET_FILE`. For bare,
  split-web, or HA deployments, set `CLIPLINE_SESSION_SECRET` or `CLIPLINE_SESSION_SECRET_FILE` to
  the same high-entropy value on every web replica so browser CSRF tokens survive restarts and route
  correctly across replicas.

The app listens on port `8080` inside the container.

## Compose profiles

| File | Database | Storage | Use |
|------|----------|---------|-----|
| `docker-compose.yml` | SQLite | Local disk | Default; local/LAN test |
| `docker-compose.standalone.yml` | SQLite | Local disk | No-clone single-host deployment |
| `docker-compose.postgres.yml` | Postgres | Local disk | Postgres deployments |
| `docker-compose.s3.yml` | SQLite | External S3 | S3-backed media |
| `docker-compose.caddy.yml` | SQLite | Local disk | Single-host HTTPS via Caddy |
| `docker-compose.minio.yml` | SQLite | Bundled MinIO | Local S3 testing only — **not production** |

These files are the supported starting points, not a turnkey profile for every database/storage
combination. The common combinations have a dedicated file; for one that doesn't (for example
Postgres + S3), merge the relevant environment variables **and** secret mounts from the two matching
profiles rather than assuming environment variables alone cover it.

## Optional worker container

By default, each profile runs one `clipline-cloud` container with both the HTTP server and durable
job runner enabled (`CLIPLINE_PROCESS_ROLE=all`). This is the recommended simple setup.

To split processing into a second container, set the web container role to `web` and enable the
Compose `worker` profile:

```sh
CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.15 \
CLIPLINE_WEB_PROCESS_ROLE=web \
docker compose --profile worker up -d
```

Use the same pattern with any profile file, for example:

```sh
CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.15 \
CLIPLINE_WEB_PROCESS_ROLE=web \
docker compose -f docker-compose.postgres.yml --profile worker up -d
```

The worker shares the same database, storage, secrets, and image, but does not bind port `8080`.
Run only one web container with `CLIPLINE_PROCESS_ROLE=web`; additional worker containers are safe
because job claiming is atomic, but one worker is enough for typical self-hosted deployments.

For true split-worker deployments, prefer the Postgres profile. SQLite split mode is acceptable only
when both containers run on the same host against a local Docker volume; do not put the SQLite data
file on NFS/SMB or another network filesystem, and expect writes to serialize under load.

## Simplest local/LAN test

```sh
git clone https://github.com/dain98/clipline-cloud.git
cd clipline-cloud/deploy/compose
CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.15 docker compose up -d
docker compose logs clipline-cloud
```

This starts the SQLite + local-disk profile on `http://localhost:8080`. On first boot a bootstrap owner
user (`admin`) is created. If you did not set a bootstrap password, a one-time password is printed in the
logs:

```text
Clipline Cloud initialized.
Initial owner user created: admin
One-time password: <generated-password>
Save this password now. It will not be shown again.
```

Log in, change the password, and create users. The owner can create/disable admin accounts and edit
the public About text. To set a fixed bootstrap password for this default profile
instead of the generated one, set `CLIPLINE_BOOTSTRAP_ADMIN_PASSWORD` inline before first boot, then rotate
it after first login. (The default `docker-compose.yml` does not read an `admin_password.txt` secret — that
file is used by the Caddy, Postgres, and S3 profiles below.)

If you lose the owner password after first boot, use the operator reset command from the same Compose
profile. It resets the configured owner account, re-enables it if disabled, revokes existing browser
sessions/device tokens/reset links, and prints a new one-time password:

```sh
docker compose run --rm clipline-cloud admin reset-password
```

To reset a specific username instead:

```sh
docker compose run --rm clipline-cloud admin reset-password admin
```

## No-clone standalone deployment

Use `docker-compose.standalone.yml` when you want a single copyable Compose file instead of a git clone.
It uses relative host paths (`./data` and `./secrets`) and expects one operator-created
`./secrets/session_secret.txt` file instead of running the local-test `clipline-secrets` helper
container.

```sh
mkdir -p /opt/cl-cloud /mnt/core/cldata
cd /opt/cl-cloud
ln -s /mnt/core/cldata data
mkdir -p secrets
openssl rand -base64 32 > secrets/session_secret.txt
chmod 700 secrets
chown 10001:10001 secrets/session_secret.txt
chmod 400 secrets/session_secret.txt
chown -R 10001:10001 /mnt/core/cldata

curl -fsSLo docker-compose.yml \
  https://raw.githubusercontent.com/dain98/clipline-cloud/main/deploy/compose/docker-compose.standalone.yml
curl -fsSLo .env \
  https://raw.githubusercontent.com/dain98/clipline-cloud/main/deploy/compose/standalone.env.example
```

Edit `.env` before starting:

```text
CLIPLINE_PUBLIC_URL=https://clips.example.com
CLIPLINE_HTTP_PORT=8080
CLIPLINE_TRUSTED_PROXY_HOPS=
CLIPLINE_VIDEO_OPTIMIZATION=off
```

For an existing reverse proxy such as Nginx Proxy Manager, keep `CLIPLINE_PUBLIC_URL` set to the public
`https://` URL and forward the proxy host to `http://<host-ip>:<CLIPLINE_HTTP_PORT>`. If the proxy has
a stable source IP and you want audit logs and rate limits to use real client IPs, set
`CLIPLINE_TRUSTED_PROXY_HOPS` to that proxy IP or CIDR.

Then start the app:

```sh
docker compose up -d
docker compose logs -f clipline-cloud
```

On first boot the app prints a generated one-time admin password to the logs. Store it, log in as
`admin`, change the password, and create normal users.

## Production behind a reverse proxy (Nginx Proxy Manager)

Use the default or Postgres/S3 profile, publish port `8080` on the host, and put your proxy in front.

1. Start the app, setting the public URL to your domain:

   ```sh
   CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.15 \
   CLIPLINE_PUBLIC_URL=https://clips.example.com \
   docker compose up -d
   ```

2. In Nginx Proxy Manager, create a Proxy Host:
   - **Forward to:** `http://<host-ip>:8080`
   - **Force SSL / HTTP→HTTPS redirect:** on
   - Request a certificate for `clips.example.com`.

3. If your proxy sits at a known, trusted IP and you want audit logs to record real client IPs, set
   `CLIPLINE_TRUSTED_PROXY_HOPS` to the proxy's IP (or container IP). `X-Forwarded-For` is ignored unless
   the socket peer is a configured trusted proxy.

   ```sh
   CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.15 \
   CLIPLINE_PUBLIC_URL=https://clips.example.com \
   CLIPLINE_TRUSTED_PROXY_HOPS=<proxy-ip> \
   docker compose up -d
   ```

## Production with the Caddy HTTPS profile

If you don't already run a reverse proxy, the Caddy profile terminates HTTPS and fetches certificates via
ACME. It binds host ports `80`/`443`, so point your domain's DNS at the host first.

```sh
CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.15 \
CLIPLINE_DOMAIN=clips.example.com \
CLIPLINE_ACME_EMAIL=you@example.com \
docker compose -f docker-compose.caddy.yml up -d
```

The profile sets `CLIPLINE_PUBLIC_URL` to `https://<CLIPLINE_DOMAIN>` and configures
`CLIPLINE_TRUSTED_PROXY_HOPS` to Caddy's internal IP for you. Use a monitored address for
`CLIPLINE_ACME_EMAIL` so certificate-expiry notices reach an operator.

This profile expects two operator-provided secret files in `deploy/compose/secrets/`:

```text
admin_password.txt
session_secret.txt
```

## Postgres profile

Uses Postgres for metadata and local disk for media. Create these secret files in
`deploy/compose/secrets/` before starting:

```text
postgres_password.txt        # the Postgres password
database_url.txt             # full DSN matching that password
admin_password.txt           # bootstrap owner password
session_secret.txt           # random session secret
```

`database_url.txt` should contain a DSN pointing at the bundled `postgres` service, for example:

```text
postgres://clipline:replace-with-postgres-password@postgres:5432/clipline
```

Then:

```sh
CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.15 \
CLIPLINE_PUBLIC_URL=https://clips.example.com \
docker compose -f docker-compose.postgres.yml up -d
```

## External S3 profile

Uses SQLite for metadata and an external, private S3-compatible bucket for media. Create these secret
files in `deploy/compose/secrets/`:

```text
s3_access_key_id.txt
s3_secret_access_key.txt
admin_password.txt
session_secret.txt
```

Configure the bucket via environment variables:

| Variable | Meaning |
|----------|---------|
| `CLIPLINE_S3_ENDPOINT` | S3 endpoint URL |
| `CLIPLINE_S3_BUCKET` | Bucket name |
| `CLIPLINE_S3_REGION` | Bucket region |
| `CLIPLINE_S3_FORCE_PATH_STYLE` | `true` for path-style endpoints (many non-AWS providers), else `false` |
| `CLIPLINE_S3_PREFIX` | Optional object-key prefix; recommended for tests and shared buckets |
| `CLIPLINE_DIRECT_S3_UPLOADS` | Optional Phase-4 direct client-to-S3 uploads; defaults to `false` and requires client support |

```sh
CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.15 \
CLIPLINE_PUBLIC_URL=https://clips.example.com \
CLIPLINE_S3_ENDPOINT=https://s3.example.com \
CLIPLINE_S3_BUCKET=clipline \
CLIPLINE_S3_REGION=us-east-1 \
CLIPLINE_S3_FORCE_PATH_STYLE=false \
CLIPLINE_S3_PREFIX=clipline-prod \
docker compose -f docker-compose.s3.yml up -d
```

Use a private bucket. The `docker-compose.minio.yml` profile is for local S3 testing only — don't use it
for production object storage.

`CLIPLINE_DIRECT_S3_UPLOADS=true` is optional and S3-only. Leave it off unless the desktop client
being tested supports the direct-upload flow; the default server-proxy upload path works for all S3
deployments. Browser-based direct uploads also require bucket CORS that allows `PUT` and exposes
`ETag`.

### Optional video optimization

Video optimization is disabled by default. When enabled, completed uploads remain playable as soon as
they pass validation, then an `optimize_video` job tries to create a single smaller browser MP4. It
only replaces `source.mp4` after the candidate validates and meets the configured savings threshold.

| Variable | Default | Meaning |
|----------|---------|---------|
| `CLIPLINE_VIDEO_OPTIMIZATION` | `off` | Set to `on` to enable lossy H.264/AAC optimization jobs |
| `CLIPLINE_VIDEO_OPTIMIZATION_CRF` | `26` | x264 CRF; valid `18`-`35`; larger means smaller/lower quality |
| `CLIPLINE_VIDEO_OPTIMIZATION_PRESET` | `veryfast` | x264 preset; slower presets spend more CPU |
| `CLIPLINE_VIDEO_OPTIMIZATION_MAX_WIDTH` | `0` | Optional max width; `0`/unset keeps source resolution |
| `CLIPLINE_VIDEO_OPTIMIZATION_MIN_SAVINGS_PERCENT` | `5` | Candidate must save at least this percentage before replacement |
| `CLIPLINE_VIDEO_OPTIMIZATION_KEEP_ORIGINAL` | `false` | Store `original-source.mp4` under the clip media token for early testing |

Only enable this on a deployment with enough worker CPU headroom. The default retention path deletes
the uploaded original after successful replacement; use
`CLIPLINE_VIDEO_OPTIMIZATION_KEEP_ORIGINAL=true` temporarily while evaluating quality/storage
tradeoffs.

The Docker smoke harness can exercise the optimization path with `RUN_VIDEO_OPTIMIZATION=1`. It
uses smoke-specific CRF/max-width/min-savings settings, uploads a compressible fixture, waits for
`source.mp4` to shrink, verifies range playback, and checks regenerated thumbnail/poster artifacts.

To smoke-test the external S3 profile against a real bucket, use a disposable bucket or a
smoke/test prefix. This check uploads a generated MP4 through the normal server-proxy path, waits
for validation and media-processing jobs, checks owner/public media reads, and then soft-deletes the
clip. Object cleanup is asynchronous, so keep the prefix easy to remove manually if a run is
interrupted.

```sh
CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.15 \
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

## Verify the deployment

After the app reports healthy, run the end-to-end flow:

1. Check readiness: `curl -fsS https://clips.example.com/readyz` (or `http://localhost:8080/readyz` for a
   local test).
2. Log in as admin and create a user.
3. Connect the [Clipline desktop app](https://github.com/dain98/clipline) to `https://your-domain` and
   upload a clip.
4. Confirm the clip appears in the owner's library, and test a private link and a public share.

## Smoke test

The repository includes a Docker-only smoke runner. Against the released image:

```sh
BUILD_IMAGE=0 CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.15 deploy/compose/smoke.sh
```

To include the opt-in video optimization path:

```sh
BUILD_IMAGE=0 \
CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.15 \
RUN_VIDEO_OPTIMIZATION=1 \
deploy/compose/smoke.sh
```

By default it exercises the **default**, **MinIO**, and **Postgres** profiles: it validates the Compose
files, starts each profile with temporary secrets, checks `/readyz`, creates an admin device token, opens
admin diagnostics, verifies backup/restore, exercises the MinIO direct-S3 upload path, and confirms
`/readyz` flips to not-ready when storage or the database is stopped. See
[`deployment-operations.md`](deployment-operations.md) for `smoke.sh` variants (including the Caddy
localhost TLS check).

## Backups

A complete backup is the database **plus** media from the same point in time. Quick rules:

- **SQLite + local disk:** don't copy a live SQLite file directly. Stop the container first, or use
  SQLite's backup API / `VACUUM INTO`, then archive the data volume.
- **Postgres + local disk:** `pg_dump` the database and archive the media volume from the same window.
- **External S3:** back up the database, and protect media with bucket versioning and provider backups.
  The DB stores object keys, so losing either side breaks restores.

See [`deployment-operations.md`](deployment-operations.md) for the exact backup and restore commands.

## Upgrades

Migrations are forward-only, so back up before upgrading.

1. Back up the database and media.
2. Set `CLIPLINE_IMAGE` to the new release tag.
3. Recreate the app:

   ```sh
   CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:<new-tag> docker compose up -d
   ```

Keep the previous tag available so you can roll back by pointing `CLIPLINE_IMAGE` at it and recreating.

## Troubleshooting

- **Port 8080 already in use:** publish a different host port with `CLIPLINE_HTTP_PORT=18080`.
- **MinIO test ports already in use:** set `MINIO_API_PORT=19000 MINIO_CONSOLE_PORT=19001`.
- **Caddy Docker subnet overlaps an existing network:** set a non-conflicting subnet and matching static
  IPs. Choose any unused private /24, e.g. `CLIPLINE_CADDY_SUBNET=10.251.250.0/24 CLIPLINE_CADDY_IP=10.251.250.2 CLIPLINE_APP_IP=10.251.250.10`.
- **App won't come up / 502 from the proxy:** check readiness with `/readyz` and read the logs:

  ```sh
  docker compose logs clipline-cloud
  ```

- **`/readyz` not ready:** the database or storage probe is failing — verify your DB/S3 credentials and
  that the bucket or volume is reachable.
