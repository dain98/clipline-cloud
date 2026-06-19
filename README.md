# Clipline Cloud

Clipline Cloud is a self-hosted clip-sharing server for the [Clipline](https://github.com/dain98/clipline)
Windows desktop app. You run it on your own host; the desktop app uploads recorded clips to it, and users
browse, manage, and share those clips from a web UI. It never depends on any Clipline-operated
infrastructure.

It ships as a single Docker image and supports SQLite or Postgres for metadata and local disk or
S3-compatible object storage for media.

- **Current release:** [`v1.2.4`](https://github.com/dain98/clipline-cloud/releases/tag/v1.2.4)
- **Image:** `ghcr.io/dain98/clipline-cloud:1.2.4`

## Quick start (local Docker Compose)

This runs the default SQLite + local-disk profile on `http://localhost:8080`. It is meant for a local or
LAN test — see the [deployment guide](docs/cloud/deployment-guide.md) before exposing it to users.

```sh
git clone https://github.com/dain98/clipline-cloud.git
cd clipline-cloud/deploy/compose
CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.4 docker compose up -d
```

On first boot Clipline Cloud creates a bootstrap admin user (`admin` by default). If you did not set a
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
`https://` URL. Pin `CLIPLINE_IMAGE` to a released tag such as `ghcr.io/dain98/clipline-cloud:1.2.4`
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
- [Release notes](https://github.com/dain98/clipline-cloud/releases/tag/v1.2.4) — v1.2.4.
- [Clipline desktop app](https://github.com/dain98/clipline) — the Windows client that uploads clips.
