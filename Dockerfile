FROM rust:1-bookworm@sha256:19817ead3289c8c631c73df281e18b59b172f6a31f4f563290f69cddd06c30e9 AS build

WORKDIR /workspace

COPY Cargo.toml Cargo.lock* ./
COPY apps/clipline-cloud-server/Cargo.toml ./apps/clipline-cloud-server/Cargo.toml
COPY crates/clipline-cloud-api/Cargo.toml ./crates/clipline-cloud-api/Cargo.toml
COPY crates/clipline-cloud-api-types/Cargo.toml ./crates/clipline-cloud-api-types/Cargo.toml
COPY crates/clipline-cloud-core/Cargo.toml ./crates/clipline-cloud-core/Cargo.toml
COPY crates/clipline-cloud-db/Cargo.toml ./crates/clipline-cloud-db/Cargo.toml
COPY crates/clipline-cloud-storage/Cargo.toml ./crates/clipline-cloud-storage/Cargo.toml
RUN mkdir -p apps/clipline-cloud-server/src \
    crates/clipline-cloud-api/src \
    crates/clipline-cloud-api-types/src \
    crates/clipline-cloud-core/src \
    crates/clipline-cloud-db/src \
    crates/clipline-cloud-storage/src \
  && touch apps/clipline-cloud-server/src/main.rs \
    crates/clipline-cloud-api/src/lib.rs \
    crates/clipline-cloud-api-types/src/lib.rs \
    crates/clipline-cloud-core/src/lib.rs \
    crates/clipline-cloud-db/src/lib.rs \
    crates/clipline-cloud-storage/src/lib.rs \
  && cargo fetch --locked

COPY crates ./crates
COPY apps/clipline-cloud-server ./apps/clipline-cloud-server
COPY apps/clipline-cloud-web ./apps/clipline-cloud-web

RUN diff -ru apps/clipline-cloud-web/src apps/clipline-cloud-web/dist
RUN cargo build --release -p clipline-cloud-server

FROM debian:bookworm-slim@sha256:96e378d7e6531ac9a15ad505478fcc2e69f371b10f5cdf87857c4b8188404716

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl ffmpeg \
  && groupadd --system --gid 10001 app \
  && useradd --system --uid 10001 --gid app --home-dir /app --shell /usr/sbin/nologin app \
  && mkdir -p /app /data \
  && chown app:app /app /data \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /workspace/target/release/clipline-cloud-server /usr/local/bin/clipline-cloud-server
COPY --from=build /workspace/apps/clipline-cloud-web/dist ./apps/clipline-cloud-web/dist

EXPOSE 8080

USER 10001:10001

ENTRYPOINT ["clipline-cloud-server"]
