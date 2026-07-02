# Clipline Cloud

Clipline Cloud is a self-hosted clip-sharing server for the
[Clipline](https://github.com/dain98/clipline) Windows desktop app. The desktop app uploads recorded
clips to your server, and users browse, manage, and share them from a web UI.

It ships as a single Docker image and supports:

- SQLite or Postgres for metadata
- Local disk or S3-compatible object storage for media
- Built-in web UI, API, and background processing

## Deploy

The easiest path is the Railway template:

[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/deploy/clipline-cloud?referralCode=OIcwSe&utm_medium=integration&utm_source=template&utm_campaign=generic)

Follow the public docs:

- [Railway guide](https://dain98.github.io/clipline-docs/clipline-cloud/railway)
- [Docker Compose / VPS self-hosting guide](https://dain98.github.io/clipline-docs/clipline-cloud/self-hosting)

## Current Release

- [v1.2.24](https://github.com/dain98/clipline-cloud/releases/tag/v1.2.24)
- `ghcr.io/dain98/clipline-cloud:1.2.24`
- `ghcr.io/dain98/clipline-cloud:latest`

`latest` is fine for the easy managed Railway path or intentional auto-updating installs. Pin a
released tag such as `1.2.24` when you want explicit upgrade and rollback control.

## Local Test

For a quick local/LAN test:

```sh
git clone https://github.com/dain98/clipline-cloud.git
cd clipline-cloud/deploy/compose
CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.24 docker compose up -d
docker compose logs clipline-cloud
```

The app starts on `http://localhost:8080`. On first boot it creates the owner account and prints a
one-time password in the logs.

## Repository Docs

These are mainly for maintainers and lower-level operators:

- [Deployment guide](docs/cloud/deployment-guide.md)
- [Deployment operations](docs/cloud/deployment-operations.md)
- [Release process](docs/cloud/release-process.md)
- [Clipline desktop app](https://github.com/dain98/clipline)
