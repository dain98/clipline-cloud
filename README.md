# Clipline Cloud

Clipline Cloud is a self-hosted clip-sharing server for the [Clipline](https://github.com/dain98/clipline)
Windows desktop app. You run it on your own host; the desktop app uploads recorded clips to it, and users
browse, manage, and share those clips from a web UI. It never depends on any Clipline-operated
infrastructure.

It ships as a single Docker image and supports SQLite or Postgres for metadata and local disk or
S3-compatible object storage for media.

- **Current release:** [`v1.2.14`](https://github.com/dain98/clipline-cloud/releases/tag/v1.2.14)
- **Image:** `ghcr.io/dain98/clipline-cloud:1.2.14`

## Quick start

The easiest path by far is the hosted Railway template with Railway Postgres and Railway Object
Storage:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/clipline-cloud?referralCode=OIcwSe&utm_medium=integration&utm_source=template&utm_campaign=generic)

The template runs Clipline Cloud from the published Docker image and provisions the database and bucket
for you. The only value you should need to provide is the first owner password.
The template itself must include a Railway Postgres service named `Postgres` and a Railway Object
Storage service named `Bucket`.

Railway Object Storage is the recommended default for the one-click template because it is
S3-compatible, lives in the same Railway project, and has the same storage price as Cloudflare R2.
Backblaze B2 can also work through its S3-compatible API, but review its download bandwidth and egress
model before using it for public video playback.

Expected template wiring:

```env
CLIPLINE_DATABASE_URL="postgresql://${{Postgres.POSTGRES_USER}}:${{Postgres.POSTGRES_PASSWORD}}@${{Postgres.RAILWAY_PRIVATE_DOMAIN}}:5432/${{Postgres.POSTGRES_DB}}"
CLIPLINE_STORAGE_BACKEND="s3"
CLIPLINE_S3_ENDPOINT="${{Bucket.ENDPOINT}}"
CLIPLINE_S3_BUCKET="${{Bucket.BUCKET}}"
CLIPLINE_S3_REGION="${{Bucket.REGION}}"
CLIPLINE_S3_ACCESS_KEY_ID="${{Bucket.ACCESS_KEY_ID}}"
CLIPLINE_S3_SECRET_ACCESS_KEY="${{Bucket.SECRET_ACCESS_KEY}}"
CLIPLINE_S3_FORCE_PATH_STYLE="false"
```

If `CLIPLINE_DATABASE_URL` is empty after deploying the template, the Postgres service reference is not
resolving. Confirm the template has a `Postgres` service and that it defines `POSTGRES_DB`,
`POSTGRES_USER`, and `POSTGRES_PASSWORD`. Fix that before uploading clips; the bucket may keep video
files, but the library needs the Postgres clip records to survive redeploys.

### Railway Cost Estimate

Railway Hobby has a `$5/month` minimum that includes `$5` of monthly usage. Railway Object Storage is
`$0.015/GB-month`, with free bucket egress and free S3 API operations. The app service and Postgres also
consume Railway usage, so these are storage-heavy estimates rather than hard monthly caps.

| Stored media | Bucket storage usage | Estimated Hobby bill before app/Postgres compute |
|--------------|----------------------|---------------------------------------------------|
| 500 GB | `$7.50/month` | about `$7.50/month` plus app/Postgres usage |
| 1 TB | `$15.00/month` | about `$15/month` plus app/Postgres usage |
| 2 TB | `$30.00/month` | about `$30/month` plus app/Postgres usage |

Because Hobby's included `$5` applies to usage, this is not `$5 + storage` once storage usage exceeds
`$5`.

### Local Docker Compose

This runs the default SQLite + local-disk profile on `http://localhost:8080`. It is meant for a local or
LAN test — see the [deployment guide](docs/cloud/deployment-guide.md) before exposing it to users.

```sh
git clone https://github.com/dain98/clipline-cloud.git
cd clipline-cloud/deploy/compose
CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.14 docker compose up -d
```

On first boot Clipline Cloud creates a bootstrap owner user (`admin` by default). If you did not set a
bootstrap password, a one-time password is printed to the logs:

```sh
docker compose logs clipline-cloud
```

Look for:

```text
Clipline Cloud initialized.
Initial admin user created: admin
One-time password: <generated-password>
Save this password now. It will not be shown again.
```

Open `http://localhost:8080`, log in as `admin`, change the password, and create users. Point the desktop
app at your server URL (`https://your-domain` in production).

## Backends

| Concern | Options |
|---------|---------|
| Metadata DB | SQLite (default) or Postgres |
| Media storage | Local disk (default) or S3-compatible object storage |

Compose profiles for the common combinations live in [`deploy/compose/`](deploy/compose/). The
[deployment guide](docs/cloud/deployment-guide.md) covers each one.

For a no-clone single-host deployment, use
[`docker-compose.standalone.yml`](deploy/compose/docker-compose.standalone.yml). It pins the released
image and uses relative `./data` and `./secrets` paths so the Compose file can live in a directory such
as `/opt/cl-cloud`.

## Production note

This is self-hosted software. For any real use, run it behind HTTPS — either an existing reverse proxy
(e.g. Nginx Proxy Manager) or the bundled Caddy profile — and set `CLIPLINE_PUBLIC_URL` to your public
`https://` URL. Pin `CLIPLINE_IMAGE` to a released tag such as `ghcr.io/dain98/clipline-cloud:1.2.14`
rather than `latest`.

## Health checks

- `GET /healthz` — process is alive.
- `GET /readyz` — database and storage probes both pass.

Admin diagnostics (version, backend, limits, storage totals, failed uploads, dead jobs, recent audit
entries) are available in the web UI and API.

## Documentation

- [Deployment guide](docs/cloud/deployment-guide.md) — step-by-step setup for each profile.
- [Deployment operations](docs/cloud/deployment-operations.md) — full backup/restore and failure-mode runbook.
- [Release process](docs/cloud/release-process.md) — how releases are tagged and validated.
- [Release notes](https://github.com/dain98/clipline-cloud/releases/tag/v1.2.14) — v1.2.14.
- [Clipline desktop app](https://github.com/dain98/clipline) — the Windows client that uploads clips.
