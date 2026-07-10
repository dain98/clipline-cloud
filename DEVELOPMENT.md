# Development

Clipline Cloud is a Rust workspace with a small Preact frontend. The default local stack uses
SQLite and local object storage; CI also exercises Postgres and S3-compatible storage.

## Source map

- `apps/clipline-cloud-server` owns HTTP routing, authentication, authorization, request
  validation, and composition of the lower-level crates.
- `apps/clipline-cloud-web` owns browser state and presentation. GET request lifecycles belong in
  `src/lib/use-api-resource.js`; mutations go through `src/lib/api.js`.
- `crates/clipline-cloud-api-types` contains serialized request and response contracts shared by
  clients and the server. Prefer a named type here over `serde_json::Value`.
- `crates/clipline-cloud-api` is the reusable Rust client.
- `crates/clipline-cloud-db` owns persistence. Single-table operations live in repository types;
  multi-table atomic workflows live in `src/repositories/transactions.rs`.
- `crates/clipline-cloud-storage` owns local and S3 object-storage behavior.
- `crates/clipline-cloud-core` owns durable jobs and media processing. It composes database and
  storage abstractions but has no HTTP concerns.

Dependencies should continue to point inward: API types, database, and storage must not depend on
the server application. HTTP handlers should not issue SQL directly.

## Local verification

Run the fast checks while developing:

```sh
cargo fmt --all --check
cargo clippy --workspace --all-targets -- -D warnings
cargo test --workspace
npm test --prefix apps/clipline-cloud-web
npm run check:dist --prefix apps/clipline-cloud-web
```

`check:dist` creates a clean frontend build and compares it with the committed `dist/` directory.
Run `npm run build --prefix apps/clipline-cloud-web` after changing browser code.

The full deployment smoke suite requires Docker:

```sh
RUN_PROFILES="default minio postgres" deploy/compose/smoke.sh
```

The ignored S3 integration test expects the `CLIPLINE_TEST_S3_*` environment variables documented
in `.github/workflows/ci.yml`. Postgres repository tests run when
`CLIPLINE_TEST_POSTGRES_URL` is set; SQLite always runs.

## Change rules

- Add matching SQLite and Postgres migrations. Migrations are append-only after release.
- Put multi-row or multi-table state transitions in a database transaction and test both the
  successful and rejected transition.
- Keep API errors actionable for 4xx responses. Log internal diagnostics, but never serialize them
  in a 500 response.
- Bound request bodies, collections, and external-process output before allocating or buffering.
- Use named response types for stable endpoint contracts.
- Pass an `AbortSignal` through browser GET loaders so route changes cannot commit stale data.
- Never edit generated frontend bundles by hand.

Deployment, backup, and release procedures live under `docs/cloud/`.
