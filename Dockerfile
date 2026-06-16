FROM rust:1-bookworm AS build

WORKDIR /workspace

COPY Cargo.toml Cargo.lock* ./
COPY crates ./crates
COPY apps/clipline-cloud-server ./apps/clipline-cloud-server
COPY apps/clipline-cloud-web ./apps/clipline-cloud-web

RUN cargo build --release -p clipline-cloud-server

FROM debian:bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates curl ffmpeg \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /workspace/target/release/clipline-cloud-server /usr/local/bin/clipline-cloud-server
COPY --from=build /workspace/apps/clipline-cloud-web/dist ./apps/clipline-cloud-web/dist

ENV CLIPLINE_BIND_ADDR=0.0.0.0:8080

EXPOSE 8080

ENTRYPOINT ["clipline-cloud-server"]
