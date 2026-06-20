# Clipline Cloud

Clipline Cloud is a self-hosted clip-sharing server for the [Clipline](https://github.com/dain98/clipline)
Windows desktop app. You run it on your own host; the desktop app uploads recorded clips to it, and users
browse, manage, and share those clips from a web UI. It never depends on any Clipline-operated
infrastructure.

It ships as a single Docker image and supports SQLite or Postgres for metadata and local disk or
S3-compatible object storage for media.

- **Current release:** [`v1.2.10`](https://github.com/dain98/clipline-cloud/releases/tag/v1.2.10)
- **Image:** `ghcr.io/dain98/clipline-cloud:1.2.10`

## Quick start

The easiest path by far is the hosted Railway template with an S3-compatible object storage bucket:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/clipline-cloud?referralCode=OIcwSe&utm_medium=integration&utm_source=template&utm_campaign=generic)

For storage, Cloudflare R2 is the recommended default for most public clip libraries because it is
S3-compatible and has no egress bandwidth charges. Backblaze B2 can also work through its
S3-compatible API, but review its download bandwidth and egress model before using it for public video
playback.

The template runs Clipline Cloud from the published Docker image and expects you to provide your bucket
endpoint, bucket name, access key, secret key, and first owner password. See
[`docs/cloud/railway-r2.md`](docs/cloud/railway-r2.md) for the full setup guide.

### Local Docker Compose

This runs the default SQLite + local-disk profile on `http://localhost:8080`. It is meant for a local or
LAN test — see the [deployment guide](docs/cloud/deployment-guide.md) before exposing it to users.

```sh
git clone https://github.com/dain98/clipline-cloud.git
cd clipline-cloud/deploy/compose
CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.10 docker compose up -d
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
`https://` URL. Pin `CLIPLINE_IMAGE` to a released tag such as `ghcr.io/dain98/clipline-cloud:1.2.10`
rather than `latest`.

## Health checks

- `GET /healthz` — process is alive.
- `GET /readyz` — database and storage probes both pass.

Admin diagnostics (version, backend, limits, storage totals, failed uploads, dead jobs, recent audit
entries) are available in the web UI and API.

## Documentation

- [Deployment guide](docs/cloud/deployment-guide.md) — step-by-step setup for each profile.
- [Railway + Cloudflare R2](docs/cloud/railway-r2.md) — hosted one-click template setup notes.
- [Deployment operations](docs/cloud/deployment-operations.md) — full backup/restore and failure-mode runbook.
- [Release process](docs/cloud/release-process.md) — how releases are tagged and validated.
- [Release notes](https://github.com/dain98/clipline-cloud/releases/tag/v1.2.10) — v1.2.10.
- [Clipline desktop app](https://github.com/dain98/clipline) — the Windows client that uploads clips.
