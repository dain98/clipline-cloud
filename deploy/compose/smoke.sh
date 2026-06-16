#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

SMOKE_ID="${SMOKE_ID:-$(date +%Y%m%d%H%M%S)-$$}"
IMAGE="${CLIPLINE_IMAGE:-clipline-cloud:ops-smoke}"
BUILD_IMAGE="${BUILD_IMAGE:-1}"
RUN_PROFILES="${RUN_PROFILES-default minio postgres}"
RUN_CADDY="${RUN_CADDY:-0}"
CONFIG_ONLY="${CONFIG_ONLY:-0}"
KEEP="${KEEP:-0}"
ISSUED_DEVICE_TOKEN=""

tmp_dir=""
declare -a CLEANUP_PROJECTS=()
declare -a CLEANUP_FILES=()

log() {
  printf '\n==> %s\n' "$*"
}

die() {
  printf 'error: %s\n' "$*" >&2
  exit 1
}

cleanup() {
  local rc="${1:-0}"

  if [ "$KEEP" = "1" ]; then
    log "KEEP=1 set; leaving smoke resources in place"
    return
  fi

  if [ "$rc" = "0" ]; then
    for idx in "${!CLEANUP_PROJECTS[@]}"; do
      cleanup_project "${CLEANUP_PROJECTS[$idx]}" "${CLEANUP_FILES[$idx]}"
    done
  elif [ "${#CLEANUP_PROJECTS[@]}" -gt 0 ]; then
    log "Smoke failed; leaving active Compose resources in place for inspection"
  fi

  if [ -n "$tmp_dir" ]; then
    rm -rf "$tmp_dir"
  fi
}

on_exit() {
  local rc=$?
  cleanup "$rc"
  exit "$rc"
}

trap on_exit EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

require_docker() {
  command -v docker >/dev/null 2>&1 || die "docker is required"
  docker compose version >/dev/null 2>&1 || die "docker compose is required"
}

make_secrets() {
  tmp_dir="$(mktemp -d)"
  SECRET_DIR="$tmp_dir/secrets"
  export SECRET_DIR
  mkdir -p "$SECRET_DIR"

  printf 'clipline-smoke-admin-password\n' > "$SECRET_DIR/admin_password.txt"
  printf 'clipline-smoke-session-secret-0123456789abcdef\n' > "$SECRET_DIR/session_secret.txt"
  printf 'clipline-smoke-postgres-password\n' > "$SECRET_DIR/postgres_password.txt"
  printf 'postgres://clipline:clipline-smoke-postgres-password@postgres:5432/clipline\n' > "$SECRET_DIR/database_url.txt"
  printf 'cliplinesmokeaccesskey\n' > "$SECRET_DIR/s3_access_key_id.txt"
  printf 'clipline-smoke-s3-secret-0123456789abcdef\n' > "$SECRET_DIR/s3_secret_access_key.txt"
}

compose_file_for_profile() {
  case "$1" in
    default) printf '%s/docker-compose.yml' "$SCRIPT_DIR" ;;
    minio) printf '%s/docker-compose.minio.yml' "$SCRIPT_DIR" ;;
    postgres) printf '%s/docker-compose.postgres.yml' "$SCRIPT_DIR" ;;
    caddy) printf '%s/docker-compose.caddy.yml' "$SCRIPT_DIR" ;;
    s3) printf '%s/docker-compose.s3.yml' "$SCRIPT_DIR" ;;
    *) die "unknown profile: $1" ;;
  esac
}

compose() {
  local project="$1"
  local file="$2"
  shift 2

  env \
    CLIPLINE_IMAGE="$IMAGE" \
    CLIPLINE_COMPOSE_ADMIN_PASSWORD_FILE="$SECRET_DIR/admin_password.txt" \
    CLIPLINE_COMPOSE_SESSION_SECRET_FILE="$SECRET_DIR/session_secret.txt" \
    CLIPLINE_COMPOSE_DATABASE_URL_FILE="$SECRET_DIR/database_url.txt" \
    CLIPLINE_COMPOSE_POSTGRES_PASSWORD_FILE="$SECRET_DIR/postgres_password.txt" \
    CLIPLINE_COMPOSE_S3_ACCESS_KEY_ID_FILE="$SECRET_DIR/s3_access_key_id.txt" \
    CLIPLINE_COMPOSE_S3_SECRET_ACCESS_KEY_FILE="$SECRET_DIR/s3_secret_access_key.txt" \
    CLIPLINE_DOMAIN="${CLIPLINE_DOMAIN:-}" \
    CLIPLINE_ACME_EMAIL="${CLIPLINE_ACME_EMAIL:-}" \
    CLIPLINE_PUBLIC_URL="${CLIPLINE_PUBLIC_URL:-}" \
    CLIPLINE_CADDY_HTTP_PORT="${CLIPLINE_CADDY_HTTP_PORT:-}" \
    CLIPLINE_CADDY_HTTPS_PORT="${CLIPLINE_CADDY_HTTPS_PORT:-}" \
    CLIPLINE_HTTP_PORT="${CLIPLINE_HTTP_PORT:-}" \
    MINIO_API_PORT="${MINIO_API_PORT:-}" \
    MINIO_CONSOLE_PORT="${MINIO_CONSOLE_PORT:-}" \
    CLIPLINE_S3_ENDPOINT="${CLIPLINE_S3_ENDPOINT:-}" \
    CLIPLINE_S3_BUCKET="${CLIPLINE_S3_BUCKET:-}" \
    CLIPLINE_S3_REGION="${CLIPLINE_S3_REGION:-}" \
    CLIPLINE_S3_FORCE_PATH_STYLE="${CLIPLINE_S3_FORCE_PATH_STYLE:-}" \
    docker compose -p "$project" -f "$file" "$@"
}

validate_compose_configs() {
  log "Validating Compose configs"
  local file
  for file in \
    "$SCRIPT_DIR/docker-compose.yml" \
    "$SCRIPT_DIR/docker-compose.caddy.yml" \
    "$SCRIPT_DIR/docker-compose.postgres.yml" \
    "$SCRIPT_DIR/docker-compose.s3.yml" \
    "$SCRIPT_DIR/docker-compose.minio.yml"
  do
    compose "clipline-config-$SMOKE_ID" "$file" config --quiet
  done
}

build_image() {
  if [ "$BUILD_IMAGE" != "1" ]; then
    log "Skipping image build; using CLIPLINE_IMAGE=$IMAGE"
    return
  fi

  log "Building $IMAGE"
  docker build -t "$IMAGE" "$REPO_ROOT"
}

register_cleanup() {
  CLEANUP_PROJECTS+=("$1")
  CLEANUP_FILES+=("$2")
}

cleanup_project() {
  CLIPLINE_IMAGE="$IMAGE" docker compose \
    -p "$1" \
    -f "$2" \
    down -v --remove-orphans >/dev/null 2>&1 || true
}

wait_healthy() {
  local project="$1"
  local file="$2"
  local service="$3"
  local cid=""
  local status=""

  for _ in $(seq 1 90); do
    cid="$(compose "$project" "$file" ps -q "$service" 2>/dev/null || true)"
    if [ -n "$cid" ]; then
      status="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$cid" 2>/dev/null || true)"
      if [ "$status" = "healthy" ] || [ "$status" = "running" ]; then
        return 0
      fi
    fi
    sleep 2
  done

  compose "$project" "$file" logs "$service" >&2 || true
  die "$service did not become healthy for $project"
}

wait_ready() {
  local project="$1"
  local file="$2"

  for _ in $(seq 1 90); do
    if compose "$project" "$file" exec -T clipline-cloud \
      curl -fsS http://127.0.0.1:8080/readyz >/dev/null 2>&1; then
      return 0
    fi
    sleep 2
  done

  compose "$project" "$file" logs clipline-cloud >&2 || true
  die "/readyz did not become ready for $project"
}

generated_admin_password() {
  local project="$1"
  local file="$2"
  compose "$project" "$file" logs --no-color clipline-cloud \
    | sed -n 's/.*One-time password: //p' \
    | tail -n 1
}

admin_password_for_profile() {
  local profile="$1"
  local project="$2"
  local file="$3"

  case "$profile" in
    default|minio)
      generated_admin_password "$project" "$file"
      ;;
    *)
      tr -d '\r\n' < "$SECRET_DIR/admin_password.txt"
      ;;
  esac

}

issue_device_token() {
  local project="$1"
  local file="$2"
  local password="$3"
  local response=""
  local token=""
  ISSUED_DEVICE_TOKEN=""

  for _ in $(seq 1 30); do
    response="$(compose "$project" "$file" exec -T clipline-cloud sh -c \
      "curl -fsS -H 'Content-Type: application/json' --data '{\"username\":\"admin\",\"password\":\"$password\",\"name\":\"deployment-smoke\"}' http://127.0.0.1:8080/api/v1/auth/device-token" 2>/dev/null || true)"
    token="$(printf '%s' "$response" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')"
    if [ -n "$token" ]; then
      ISSUED_DEVICE_TOKEN="$token"
      return 0
    fi
    sleep 2
  done

  die "could not parse device token response for $project"
}

assert_admin_overview() {
  local project="$1"
  local file="$2"
  local token="$3"
  local response=""

  for _ in $(seq 1 30); do
    response="$(compose "$project" "$file" exec -T clipline-cloud sh -c \
      "curl -fsS -H 'Authorization: Bearer $token' http://127.0.0.1:8080/api/v1/admin/overview" 2>/dev/null || true)"
    if printf '%s' "$response" | grep -q '"storage_backend"'; then
      return 0
    fi
    sleep 2
  done

  die "admin overview response missing storage_backend for $project"
}

expect_not_ready() {
  local project="$1"
  local file="$2"
  local component="$3"
  local output=""
  local code=""
  local body=""

  for _ in $(seq 1 45); do
    output="$(compose "$project" "$file" exec -T clipline-cloud sh -c \
      'rm -f /tmp/readyz.out; code="$(curl -sS -o /tmp/readyz.out -w "%{http_code}" http://127.0.0.1:8080/readyz || true)"; printf "%s\n" "$code"; cat /tmp/readyz.out' 2>/dev/null || true)"
    code="$(printf '%s\n' "$output" | sed -n '1p')"
    body="$(printf '%s\n' "$output" | sed '1d')"
    if [ "$code" = "503" ] && printf '%s' "$body" | grep -q "\"$component\":\"error\""; then
      return 0
    fi
    sleep 2
  done

  die "expected /readyz 503 with $component=error for $project"
}

smoke_backup_restore() {
  local project="$1"
  local file="$2"
  local token="$3"
  local volume="${project}_clipline_data"
  local backup_dir="$tmp_dir/backup-$project"

  log "Smoke-testing SQLite/local backup and restore"
  mkdir -p "$backup_dir"
  docker run --rm -v "$volume:/data" alpine:3.20 \
    sh -c 'mkdir -p /data/smoke && printf restored > /data/smoke/marker.txt'
  compose "$project" "$file" stop clipline-cloud >/dev/null
  docker run --rm -v "$volume:/data" -v "$backup_dir:/backup" alpine:3.20 \
    sh -c 'cd /data && tar czf /backup/clipline-data.tgz .'
  docker run --rm -v "$volume:/data" alpine:3.20 \
    sh -c 'rm -rf /data/* /data/.[!.]* /data/..?* 2>/dev/null || true'
  docker run --rm -v "$volume:/data" -v "$backup_dir:/backup" alpine:3.20 \
    sh -c 'tar xzf /backup/clipline-data.tgz -C /data'
  compose "$project" "$file" start clipline-cloud >/dev/null
  wait_ready "$project" "$file"
  docker run --rm -v "$volume:/data" alpine:3.20 \
    test -f /data/smoke/marker.txt
  assert_admin_overview "$project" "$file" "$token"
}

smoke_postgres_backup_restore() {
  local project="$1"
  local file="$2"
  local token="$3"
  local volume="${project}_clipline_data"
  local backup_dir="$tmp_dir/backup-$project"

  log "Smoke-testing Postgres/local backup and restore"
  mkdir -p "$backup_dir"
  docker run --rm -v "$volume:/data" alpine:3.20 \
    sh -c 'mkdir -p /data/smoke && printf restored > /data/smoke/postgres-marker.txt'
  compose "$project" "$file" exec -T postgres \
    psql -U clipline -d clipline -v ON_ERROR_STOP=1 \
    -c "CREATE TABLE IF NOT EXISTS smoke_restore_marker (id text PRIMARY KEY);" \
    -c "INSERT INTO smoke_restore_marker (id) VALUES ('restored') ON CONFLICT (id) DO NOTHING;"

  compose "$project" "$file" stop clipline-cloud >/dev/null
  compose "$project" "$file" exec -T postgres \
    pg_dump -U clipline -d clipline -Fc > "$backup_dir/clipline.dump"
  docker run --rm -v "$volume:/data" -v "$backup_dir:/backup" alpine:3.20 \
    sh -c 'cd /data && tar czf /backup/clipline-media.tgz .'

  compose "$project" "$file" exec -T postgres \
    psql -U clipline -d clipline -v ON_ERROR_STOP=1 \
    -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'
  docker run --rm -v "$volume:/data" alpine:3.20 \
    sh -c 'rm -rf /data/* /data/.[!.]* /data/..?* 2>/dev/null || true'

  compose "$project" "$file" exec -T postgres \
    pg_restore -U clipline -d clipline --clean --if-exists --exit-on-error < "$backup_dir/clipline.dump"
  docker run --rm -v "$volume:/data" -v "$backup_dir:/backup" alpine:3.20 \
    sh -c 'tar xzf /backup/clipline-media.tgz -C /data'
  [ "$(compose "$project" "$file" exec -T postgres \
    psql -U clipline -d clipline -tAc "SELECT count(*) FROM smoke_restore_marker WHERE id = 'restored'")" = "1" ] \
    || die "restored Postgres marker was not present for $project"

  compose "$project" "$file" start clipline-cloud >/dev/null
  wait_ready "$project" "$file"
  docker run --rm -v "$volume:/data" alpine:3.20 \
    test -f /data/smoke/postgres-marker.txt
  assert_admin_overview "$project" "$file" "$token"
}

run_profile() {
  local profile="$1"
  local file=""
  local project=""
  local password=""
  local token=""

  file="$(compose_file_for_profile "$profile")"
  project="clipline-smoke-$profile-$SMOKE_ID"
  register_cleanup "$project" "$file"

  log "Starting $profile profile"
  compose "$project" "$file" up -d
  wait_healthy "$project" "$file" clipline-cloud
  wait_ready "$project" "$file"

  password="$(admin_password_for_profile "$profile" "$project" "$file")"
  [ -n "$password" ] || die "admin password was not available for $profile"
  issue_device_token "$project" "$file" "$password"
  token="$ISSUED_DEVICE_TOKEN"
  assert_admin_overview "$project" "$file" "$token"

  case "$profile" in
    default)
      smoke_backup_restore "$project" "$file" "$token"
      ;;
    minio)
      log "Checking storage readiness failure"
      compose "$project" "$file" stop minio >/dev/null
      expect_not_ready "$project" "$file" storage
      compose "$project" "$file" start minio >/dev/null
      wait_ready "$project" "$file"
      ;;
    postgres)
      smoke_postgres_backup_restore "$project" "$file" "$token"
      log "Checking database readiness failure"
      compose "$project" "$file" stop postgres >/dev/null
      expect_not_ready "$project" "$file" database
      compose "$project" "$file" start postgres >/dev/null
      wait_healthy "$project" "$file" postgres
      wait_ready "$project" "$file"
      ;;
  esac

  if [ "$KEEP" != "1" ]; then
    cleanup_project "$project" "$file"
  fi
}

run_caddy_profile() {
  local profile="caddy"
  local file=""
  local project=""
  local http_port="${CLIPLINE_CADDY_HTTP_PORT:-8081}"
  local https_port="${CLIPLINE_CADDY_HTTPS_PORT:-8443}"
  local headers_file="$tmp_dir/caddy-headers.out"
  local readyz_file="$tmp_dir/caddy-readyz.out"

  file="$(compose_file_for_profile "$profile")"
  project="clipline-smoke-caddy-$SMOKE_ID"
  register_cleanup "$project" "$file"

  command -v curl >/dev/null 2>&1 || die "curl is required for Caddy smoke checks"

  log "Starting Caddy TLS profile on localhost"
  CLIPLINE_DOMAIN=localhost CLIPLINE_ACME_EMAIL=smoke@example.com \
    CLIPLINE_CADDY_HTTP_PORT="$http_port" CLIPLINE_CADDY_HTTPS_PORT="$https_port" \
    compose "$project" "$file" up -d
  wait_healthy "$project" "$file" clipline-cloud
  wait_healthy "$project" "$file" caddy

  curl -k -fsS -D "$headers_file" "https://localhost:${https_port}/readyz" > "$readyz_file"
  grep -qi "^strict-transport-security:" "$headers_file"
  grep -qi "^x-content-type-options: nosniff" "$headers_file"
}

main() {
  require_docker
  make_secrets
  validate_compose_configs
  if [ "$CONFIG_ONLY" = "1" ]; then
    log "CONFIG_ONLY=1 set; Compose config validation passed"
    return
  fi

  build_image

  local profile
  for profile in $RUN_PROFILES; do
    run_profile "$profile"
  done

  if [ "$RUN_CADDY" = "1" ]; then
    run_caddy_profile
  else
    log "Skipping Caddy runtime smoke; set RUN_CADDY=1 to test localhost TLS through Caddy"
  fi

  log "Deployment smoke checks passed"
}

main "$@"
