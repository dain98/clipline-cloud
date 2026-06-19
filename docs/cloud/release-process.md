# Clipline Cloud Release Process

This runbook covers publishing a tagged Clipline Cloud server image.

## Release Tags

Use annotated semver tags:

```sh
git checkout main
git pull --ff-only --prune
git tag -a v1.2.7 -m "Clipline Cloud v1.2.7"
git push origin v1.2.7
```

Pushing a `vMAJOR.MINOR.PATCH` tag starts the `Release` GitHub Actions workflow. The workflow builds
the Docker image, pushes it to GHCR, and creates a GitHub release with generated notes plus the
published image tags and manifest digest.

Published image tags for `v1.2.7`:

```text
ghcr.io/dain98/clipline-cloud:1.2.7
ghcr.io/dain98/clipline-cloud:1.2
ghcr.io/dain98/clipline-cloud:latest
ghcr.io/dain98/clipline-cloud:sha-<short-git-sha>
```

## Release Validation

After the workflow finishes, smoke-test the published image instead of the local build. This command
runs the full multi-profile smoke suite (`default minio postgres`):

```sh
BUILD_IMAGE=0 \
CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.7 \
CLIPLINE_HTTP_PORT=18080 \
MINIO_API_PORT=19000 \
MINIO_CONSOLE_PORT=19001 \
deploy/compose/smoke.sh
```

For a faster image-only check of the default SQLite/local profile, set `RUN_PROFILES=default`.

For Caddy localhost TLS:

```sh
BUILD_IMAGE=0 \
CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.7 \
CLIPLINE_CADDY_HTTP_PORT=18081 \
CLIPLINE_CADDY_HTTPS_PORT=18443 \
CLIPLINE_CADDY_SUBNET=10.251.250.0/24 \
CLIPLINE_CADDY_IP=10.251.250.2 \
CLIPLINE_APP_IP=10.251.250.10 \
RUN_PROFILES="" \
RUN_CADDY=1 \
deploy/compose/smoke.sh
```

Pick a different `CLIPLINE_CADDY_SUBNET` if that subnet overlaps existing Docker networks on the
host.

## Deploying A Release

Pin production Compose deployments to the release tag:

```sh
CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:1.2.7 \
docker compose -f deploy/compose/docker-compose.yml up -d
```

Do not rely on `latest` for production rollouts. Keep the previous release tag available for
rollback.

## Rollback

Point `CLIPLINE_IMAGE` at the previous known-good tag and recreate the app container:

```sh
CLIPLINE_IMAGE=ghcr.io/dain98/clipline-cloud:<previous-tag> \
docker compose -f deploy/compose/docker-compose.yml up -d
```

Database migrations are forward-only. Back up the database and media before upgrading, and restore
from that backup if a release must be fully reverted.
