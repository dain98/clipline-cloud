#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

SMOKE_ID="${SMOKE_ID:-$(date +%Y%m%d%H%M%S)-$$}"
IMAGE="${CLIPLINE_IMAGE:-clipline-cloud:ops-smoke}"
BUILD_IMAGE="${BUILD_IMAGE:-1}"
RUN_PROFILES="${RUN_PROFILES-default minio postgres}"
RUN_CADDY="${RUN_CADDY:-0}"
RUN_DIRECT_S3="${RUN_DIRECT_S3:-1}"
RUN_VIDEO_OPTIMIZATION="${RUN_VIDEO_OPTIMIZATION:-0}"
RUN_EXTERNAL_S3="${RUN_EXTERNAL_S3:-0}"
ALLOW_EXTERNAL_S3_NO_PREFIX="${ALLOW_EXTERNAL_S3_NO_PREFIX:-0}"
ALLOW_EXTERNAL_S3_NON_SMOKE_PREFIX="${ALLOW_EXTERNAL_S3_NON_SMOKE_PREFIX:-0}"
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
  write_secret_from_env_or_file \
    "$SECRET_DIR/s3_access_key_id.txt" \
    "CLIPLINE_SMOKE_S3_ACCESS_KEY_ID" \
    "CLIPLINE_COMPOSE_S3_ACCESS_KEY_ID_FILE" \
    "cliplinesmokeaccesskey"
  write_secret_from_env_or_file \
    "$SECRET_DIR/s3_secret_access_key.txt" \
    "CLIPLINE_SMOKE_S3_SECRET_ACCESS_KEY" \
    "CLIPLINE_COMPOSE_S3_SECRET_ACCESS_KEY_FILE" \
    "clipline-smoke-s3-secret-0123456789abcdef"
}

write_secret_from_env_or_file() {
  local target="$1"
  local value_var="$2"
  local file_var="$3"
  local fallback="$4"
  local value="${!value_var-}"
  local source_file="${!file_var-}"

  if [ -n "$value" ]; then
    printf '%s\n' "$value" > "$target"
  elif [ -n "$source_file" ]; then
    [ -r "$source_file" ] || die "$file_var points to an unreadable file: $source_file"
    cp "$source_file" "$target"
  else
    printf '%s\n' "$fallback" > "$target"
  fi
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
    CLIPLINE_WEB_PROCESS_ROLE="${CLIPLINE_WEB_PROCESS_ROLE:-}" \
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
    CLIPLINE_CADDY_SUBNET="${CLIPLINE_CADDY_SUBNET:-}" \
    CLIPLINE_CADDY_IP="${CLIPLINE_CADDY_IP:-}" \
    CLIPLINE_APP_IP="${CLIPLINE_APP_IP:-}" \
    CLIPLINE_HTTP_PORT="${CLIPLINE_HTTP_PORT:-}" \
    MINIO_API_PORT="${MINIO_API_PORT:-}" \
    MINIO_CONSOLE_PORT="${MINIO_CONSOLE_PORT:-}" \
    CLIPLINE_DIRECT_S3_UPLOADS="${CLIPLINE_DIRECT_S3_UPLOADS:-}" \
    CLIPLINE_SINGLE_PUT_MAX_BYTES="${CLIPLINE_SINGLE_PUT_MAX_BYTES:-}" \
    CLIPLINE_VIDEO_OPTIMIZATION="${CLIPLINE_VIDEO_OPTIMIZATION:-}" \
    CLIPLINE_VIDEO_OPTIMIZATION_CRF="${CLIPLINE_VIDEO_OPTIMIZATION_CRF:-}" \
    CLIPLINE_VIDEO_OPTIMIZATION_PRESET="${CLIPLINE_VIDEO_OPTIMIZATION_PRESET:-}" \
    CLIPLINE_VIDEO_OPTIMIZATION_MAX_WIDTH="${CLIPLINE_VIDEO_OPTIMIZATION_MAX_WIDTH:-}" \
    CLIPLINE_VIDEO_OPTIMIZATION_MIN_SAVINGS_PERCENT="${CLIPLINE_VIDEO_OPTIMIZATION_MIN_SAVINGS_PERCENT:-}" \
    CLIPLINE_VIDEO_OPTIMIZATION_KEEP_ORIGINAL="${CLIPLINE_VIDEO_OPTIMIZATION_KEEP_ORIGINAL:-}" \
    CLIPLINE_S3_ENDPOINT="${CLIPLINE_S3_ENDPOINT:-}" \
    CLIPLINE_S3_BUCKET="${CLIPLINE_S3_BUCKET:-}" \
    CLIPLINE_S3_REGION="${CLIPLINE_S3_REGION:-}" \
    CLIPLINE_S3_FORCE_PATH_STYLE="${CLIPLINE_S3_FORCE_PATH_STYLE:-}" \
    CLIPLINE_S3_PREFIX="${CLIPLINE_S3_PREFIX:-}" \
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
    compose "clipline-config-worker-$SMOKE_ID" "$file" --profile worker config --quiet
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

require_external_s3_config() {
  [ "$RUN_EXTERNAL_S3" = "1" ] || die "RUN_PROFILES=s3 requires RUN_EXTERNAL_S3=1 because it writes to a real external bucket"
  [ -n "${CLIPLINE_S3_ENDPOINT:-}" ] || die "CLIPLINE_S3_ENDPOINT is required for RUN_PROFILES=s3"
  [ -n "${CLIPLINE_S3_BUCKET:-}" ] || die "CLIPLINE_S3_BUCKET is required for RUN_PROFILES=s3"
  [ -n "${CLIPLINE_SMOKE_S3_ACCESS_KEY_ID:-}${CLIPLINE_COMPOSE_S3_ACCESS_KEY_ID_FILE:-}" ] \
    || die "provide CLIPLINE_SMOKE_S3_ACCESS_KEY_ID or CLIPLINE_COMPOSE_S3_ACCESS_KEY_ID_FILE for RUN_PROFILES=s3"
  [ -n "${CLIPLINE_SMOKE_S3_SECRET_ACCESS_KEY:-}${CLIPLINE_COMPOSE_S3_SECRET_ACCESS_KEY_FILE:-}" ] \
    || die "provide CLIPLINE_SMOKE_S3_SECRET_ACCESS_KEY or CLIPLINE_COMPOSE_S3_SECRET_ACCESS_KEY_FILE for RUN_PROFILES=s3"

  if [ -z "${CLIPLINE_S3_PREFIX:-}" ] && [ "$ALLOW_EXTERNAL_S3_NO_PREFIX" != "1" ]; then
    die "CLIPLINE_S3_PREFIX is required for external S3 smoke; use a disposable prefix such as clipline-smoke/$SMOKE_ID"
  fi

  case "${CLIPLINE_S3_PREFIX:-}" in
    *smoke*|*test*|"") ;;
    *)
      [ "$ALLOW_EXTERNAL_S3_NON_SMOKE_PREFIX" = "1" ] \
        || die "CLIPLINE_S3_PREFIX should contain 'smoke' or 'test' for external S3 smoke; set ALLOW_EXTERNAL_S3_NON_SMOKE_PREFIX=1 to override"
      ;;
  esac
}

preflight_runtime_profiles() {
  local profile
  for profile in $RUN_PROFILES; do
    if [ "$profile" = "s3" ]; then
      require_external_s3_config
    fi
  done
}

smoke_external_s3_upload() {
  local project="$1"
  local file="$2"
  local token="$3"

  log "Smoke-testing external S3 server-proxy upload and media reads"
  compose "$project" "$file" exec -T -e SMOKE_TOKEN="$token" clipline-cloud sh -s <<'SCRIPT'
set -eu

api="http://127.0.0.1:8080"
clip="/tmp/clipline-external-s3-smoke.mp4"
headers="/tmp/clipline-external-s3-headers.txt"
body="/tmp/clipline-external-s3-body.out"
trap 'rm -f "$clip" "$headers" "$body"' EXIT

# The runtime image intentionally omits jq; these parsers assume serde's compact JSON output.
json_string() {
  field="$1"
  sed -n "s/.*\"$field\":\"\([^\"]*\)\".*/\1/p"
}

require_json_string() {
  field="$1"
  value="$(printf '%s' "$2" | json_string "$field")"
  [ -n "$value" ] || {
    printf 'missing JSON string field %s in: %s\n' "$field" "$2" >&2
    exit 1
  }
  printf '%s' "$value"
}

wait_for_ready_clip() {
  clip_id="$1"
  for _ in $(seq 1 120); do
    if clip_response="$(curl -fsS -H "Authorization: Bearer $SMOKE_TOKEN" "$api/api/v1/clips/$clip_id" 2>/dev/null)"; then
      printf '%s' "$clip_response" | grep -q '"status":"ready"' && return 0
    fi
    sleep 2
  done

  printf 'external S3 uploaded clip %s did not become ready\n' "$clip_id" >&2
  curl -sS -H "Authorization: Bearer $SMOKE_TOKEN" "$api/api/v1/admin/jobs/recent-errors" >&2 || true
  return 1
}

wait_for_jpeg() {
  clip_id="$1"
  endpoint="$2"
  label="$3"

  for _ in $(seq 1 120); do
    code="$(curl -sS -D "$headers" -o "$body" -w "%{http_code}" \
      -H "Authorization: Bearer $SMOKE_TOKEN" \
      "$api/api/v1/clips/$clip_id/$endpoint")"
    if [ "$code" = "200" ] && grep -qi '^content-type: image/jpeg' "$headers"; then
      return 0
    fi
    sleep 2
  done

  printf '%s did not become a generated JPEG for clip %s\n' "$label" "$clip_id" >&2
  cat "$headers" >&2 || true
  curl -sS -H "Authorization: Bearer $SMOKE_TOKEN" "$api/api/v1/admin/jobs/recent-errors" >&2 || true
  return 1
}

ffmpeg -hide_banner -loglevel error -nostdin -y \
  -f lavfi -i testsrc2=size=160x90:rate=15 \
  -t 1 \
  -c:v mpeg4 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  "$clip"

size="$(wc -c < "$clip" | tr -d ' ')"
checksum="$(sha256sum "$clip" | awk '{print $1}')"
client_clip_id="$(printf 'external-s3-smoke-%s-%s' "$(date +%s)" "$$")"
payload="$(printf '{"client_clip_id":"%s","title":"External S3 smoke","source_type":"deployment_smoke","duration_ms":1000,"file_size_bytes":%s,"checksum_sha256":"%s","container":"mp4","video_codec":"mpeg4","width":160,"height":90,"fps":15,"visibility":"private"}' "$client_clip_id" "$size" "$checksum")"

create_response="$(curl -fsS \
  -H "Authorization: Bearer $SMOKE_TOKEN" \
  -H 'Content-Type: application/json' \
  --data "$payload" \
  "$api/api/v1/uploads")"

clip_id="$(require_json_string clip_id "$create_response")"
upload_id="$(require_json_string upload_id "$create_response")"
mode="$(require_json_string mode "$create_response")"

case "$mode" in
  single_put)
    content_path="$(require_json_string single_put_url "$create_response")"
    upload_response="$(curl -fsS \
      -X PUT \
      -H "Authorization: Bearer $SMOKE_TOKEN" \
      -H 'Content-Type: video/mp4' \
      --data-binary "@$clip" \
      "$api$content_path")"
    printf '%s' "$upload_response" | grep -q '"status":"completed"' || {
      printf 'single PUT response did not complete upload %s: %s\n' "$upload_id" "$upload_response" >&2
      exit 1
    }
    ;;
  chunked)
    parts_template="$(require_json_string parts_url_template "$create_response")"
    part_path="$(printf '%s' "$parts_template" | sed 's/{part_number}/1/g')"
    part_response="$(curl -fsS \
      -X PUT \
      -H "Authorization: Bearer $SMOKE_TOKEN" \
      -H "X-Clipline-Part-SHA256: $checksum" \
      --data-binary "@$clip" \
      "$api$part_path")"
    printf '%s' "$part_response" | grep -q "\"upload_id\":\"$upload_id\"" || {
      printf 'part response did not reference upload_id %s: %s\n' "$upload_id" "$part_response" >&2
      exit 1
    }
    curl -fsS \
      -X POST \
      -H "Authorization: Bearer $SMOKE_TOKEN" \
      "$api/api/v1/uploads/$upload_id/complete" >/dev/null
    ;;
  *)
    printf 'unexpected upload mode %s in: %s\n' "$mode" "$create_response" >&2
    exit 1
    ;;
esac

wait_for_ready_clip "$clip_id"

owner_media_code="$(curl -sS -D "$headers" -o "$body" -w "%{http_code}" \
  -H "Authorization: Bearer $SMOKE_TOKEN" \
  -H 'Range: bytes=0-15' \
  "$api/api/v1/clips/$clip_id/media")"
[ "$owner_media_code" = "206" ] || {
  printf 'owner media range request returned %s, expected 206\n' "$owner_media_code" >&2
  cat "$headers" >&2 || true
  exit 1
}
grep -qi '^content-range: bytes 0-15/' "$headers" || {
  printf 'owner media response missing expected Content-Range\n' >&2
  cat "$headers" >&2 || true
  exit 1
}

wait_for_jpeg "$clip_id" thumbnail thumbnail
wait_for_jpeg "$clip_id" poster poster

visibility_response="$(curl -fsS \
  -X POST \
  -H "Authorization: Bearer $SMOKE_TOKEN" \
  -H 'Content-Type: application/json' \
  --data '{"visibility":"unlisted"}' \
  "$api/api/v1/clips/$clip_id/visibility")"
share_id="$(require_json_string public_share_id "$visibility_response")"
public_response="$(curl -fsS "$api/api/v1/public/clips/$share_id")"
printf '%s' "$public_response" | grep -q "\"share_id\":\"$share_id\"" || {
  printf 'public clip response did not reference share_id %s: %s\n' "$share_id" "$public_response" >&2
  exit 1
}

public_probe_code="$(curl -sS -D "$headers" -o "$body" -w "%{http_code}" \
  "$api/api/v1/public/clips/$share_id/media")"
case "$public_probe_code" in
  307)
    grep -qi '^location:' "$headers" || {
      printf 'public presigned media redirect was missing Location\n' >&2
      cat "$headers" >&2 || true
      exit 1
    }
    public_follow_code="$(curl -L -sS -D "$headers" -o "$body" -w "%{http_code}" \
      -H 'Range: bytes=0-15' \
      "$api/api/v1/public/clips/$share_id/media")"
    [ "$public_follow_code" = "206" ] || {
      printf 'public presigned media range request returned %s, expected 206\n' "$public_follow_code" >&2
      cat "$headers" >&2 || true
      exit 1
    }
    ;;
  200|206)
    public_proxy_code="$(curl -sS -D "$headers" -o "$body" -w "%{http_code}" \
      -H 'Range: bytes=0-15' \
      "$api/api/v1/public/clips/$share_id/media")"
    [ "$public_proxy_code" = "206" ] || {
      printf 'public proxy media range request returned %s, expected 206\n' "$public_proxy_code" >&2
      cat "$headers" >&2 || true
      exit 1
    }
    ;;
  *)
    printf 'public media returned %s, expected 307/200/206\n' "$public_probe_code" >&2
    cat "$headers" >&2 || true
    exit 1
    ;;
esac

curl -fsS \
  -X DELETE \
  -H "Authorization: Bearer $SMOKE_TOKEN" \
  "$api/api/v1/clips/$clip_id" >/dev/null || true
SCRIPT
}

smoke_video_optimization() {
  local project="$1"
  local file="$2"
  local token="$3"

  log "Smoke-testing video optimization"
  compose "$project" "$file" exec -T -e SMOKE_TOKEN="$token" clipline-cloud sh -s <<'SCRIPT'
set -eu

api="http://127.0.0.1:8080"
clip="/tmp/clipline-optimization-smoke.mp4"
headers="/tmp/clipline-optimization-headers.txt"
body="/tmp/clipline-optimization-body.out"
trap 'rm -f "$clip" "$headers" "$body"' EXIT

# The runtime image intentionally omits jq; these parsers assume serde's compact JSON output.
json_string() {
  field="$1"
  sed -n "s/.*\"$field\":\"\([^\"]*\)\".*/\1/p"
}

json_number() {
  field="$1"
  sed -n "s/.*\"$field\":\([0-9][0-9]*\).*/\1/p"
}

require_json_string() {
  field="$1"
  value="$(printf '%s' "$2" | json_string "$field")"
  [ -n "$value" ] || {
    printf 'missing JSON string field %s in: %s\n' "$field" "$2" >&2
    exit 1
  }
  printf '%s' "$value"
}

require_json_number() {
  field="$1"
  value="$(printf '%s' "$2" | json_number "$field")"
  [ -n "$value" ] || {
    printf 'missing JSON number field %s in: %s\n' "$field" "$2" >&2
    exit 1
  }
  printf '%s' "$value"
}

wait_for_optimized_clip() {
  clip_id="$1"
  original_size="$2"

  for _ in $(seq 1 180); do
    if clip_response="$(curl -fsS -H "Authorization: Bearer $SMOKE_TOKEN" "$api/api/v1/clips/$clip_id" 2>/dev/null)"; then
      if printf '%s' "$clip_response" | grep -q '"status":"ready"'; then
        optimized_size="$(printf '%s' "$clip_response" | json_number file_size_bytes)"
        video_codec="$(printf '%s' "$clip_response" | json_string video_codec)"
        if [ -n "$optimized_size" ] && [ "$optimized_size" -lt "$original_size" ] && [ "$video_codec" = "h264" ]; then
          printf '%s' "$optimized_size"
          return 0
        fi
      fi
    fi
    sleep 2
  done

  printf 'clip %s did not optimize below original size %s\n' "$clip_id" "$original_size" >&2
  curl -sS -H "Authorization: Bearer $SMOKE_TOKEN" "$api/api/v1/admin/jobs/recent-errors" >&2 || true
  return 1
}

wait_for_jpeg() {
  clip_id="$1"
  endpoint="$2"
  label="$3"

  for _ in $(seq 1 120); do
    code="$(curl -sS -D "$headers" -o "$body" -w "%{http_code}" \
      -H "Authorization: Bearer $SMOKE_TOKEN" \
      "$api/api/v1/clips/$clip_id/$endpoint")"
    if [ "$code" = "200" ] && grep -qi '^content-type: image/jpeg' "$headers"; then
      return 0
    fi
    sleep 2
  done

  printf '%s did not become a generated JPEG for optimized clip %s\n' "$label" "$clip_id" >&2
  cat "$headers" >&2 || true
  curl -sS -H "Authorization: Bearer $SMOKE_TOKEN" "$api/api/v1/admin/jobs/recent-errors" >&2 || true
  return 1
}

ffmpeg -hide_banner -loglevel error -nostdin -y \
  -f lavfi -i testsrc2=size=320x180:rate=30 \
  -t 2 \
  -c:v mpeg4 \
  -q:v 1 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  "$clip"

size="$(wc -c < "$clip" | tr -d ' ')"
checksum="$(sha256sum "$clip" | awk '{print $1}')"
client_clip_id="$(printf 'optimization-smoke-%s-%s' "$(date +%s)" "$$")"
payload="$(printf '{"client_clip_id":"%s","title":"Video optimization smoke","source_type":"deployment_smoke","duration_ms":2000,"file_size_bytes":%s,"checksum_sha256":"%s","container":"mp4","video_codec":"mpeg4","width":320,"height":180,"fps":30,"visibility":"private"}' "$client_clip_id" "$size" "$checksum")"

create_response="$(curl -fsS \
  -H "Authorization: Bearer $SMOKE_TOKEN" \
  -H 'Content-Type: application/json' \
  --data "$payload" \
  "$api/api/v1/uploads")"

clip_id="$(require_json_string clip_id "$create_response")"
upload_id="$(require_json_string upload_id "$create_response")"
mode="$(require_json_string mode "$create_response")"

case "$mode" in
  single_put)
    content_path="$(require_json_string single_put_url "$create_response")"
    upload_response="$(curl -fsS \
      -X PUT \
      -H "Authorization: Bearer $SMOKE_TOKEN" \
      -H 'Content-Type: video/mp4' \
      --data-binary "@$clip" \
      "$api$content_path")"
    printf '%s' "$upload_response" | grep -q '"status":"completed"' || {
      printf 'single PUT response did not complete upload %s: %s\n' "$upload_id" "$upload_response" >&2
      exit 1
    }
    ;;
  chunked)
    parts_template="$(require_json_string parts_url_template "$create_response")"
    part_path="$(printf '%s' "$parts_template" | sed 's/{part_number}/1/g')"
    part_response="$(curl -fsS \
      -X PUT \
      -H "Authorization: Bearer $SMOKE_TOKEN" \
      -H "X-Clipline-Part-SHA256: $checksum" \
      --data-binary "@$clip" \
      "$api$part_path")"
    printf '%s' "$part_response" | grep -q "\"upload_id\":\"$upload_id\"" || {
      printf 'part response did not reference upload_id %s: %s\n' "$upload_id" "$part_response" >&2
      exit 1
    }
    curl -fsS \
      -X POST \
      -H "Authorization: Bearer $SMOKE_TOKEN" \
      "$api/api/v1/uploads/$upload_id/complete" >/dev/null
    ;;
  *)
    printf 'unexpected upload mode %s in: %s\n' "$mode" "$create_response" >&2
    exit 1
    ;;
esac

optimized_size="$(wait_for_optimized_clip "$clip_id" "$size")"

owner_media_code="$(curl -sS -D "$headers" -o "$body" -w "%{http_code}" \
  -H "Authorization: Bearer $SMOKE_TOKEN" \
  -H 'Range: bytes=0-15' \
  "$api/api/v1/clips/$clip_id/media")"
[ "$owner_media_code" = "206" ] || {
  printf 'optimized owner media range request returned %s, expected 206\n' "$owner_media_code" >&2
  cat "$headers" >&2 || true
  exit 1
}
grep -qi "^content-range: bytes 0-15/$optimized_size" "$headers" || {
  printf 'optimized owner media response missing expected Content-Range total %s\n' "$optimized_size" >&2
  cat "$headers" >&2 || true
  exit 1
}

wait_for_jpeg "$clip_id" thumbnail thumbnail
wait_for_jpeg "$clip_id" poster poster

curl -fsS \
  -X DELETE \
  -H "Authorization: Bearer $SMOKE_TOKEN" \
  "$api/api/v1/clips/$clip_id" >/dev/null || true
SCRIPT
}

smoke_direct_s3_upload() {
  local project="$1"
  local file="$2"
  local token="$3"

  log "Smoke-testing direct S3 multipart upload"
  compose "$project" "$file" exec -T -e SMOKE_TOKEN="$token" clipline-cloud sh -s <<'SCRIPT'
set -eu

api="http://127.0.0.1:8080"
clip="/tmp/clipline-direct-s3-smoke.mp4"
put_headers="/tmp/clipline-direct-s3-put-headers.txt"
put_output="/tmp/clipline-direct-s3-put.out"
curl_headers="/tmp/clipline-direct-s3-curl-headers.conf"
headers_lines="/tmp/clipline-direct-s3-headers-lines.txt"
trap 'rm -f "$clip" "$put_headers" "$put_output" "$curl_headers" "$headers_lines"' EXIT

# The runtime image intentionally omits jq; these parsers assume serde's compact JSON output.
json_string() {
  field="$1"
  sed -n "s/.*\"$field\":\"\([^\"]*\)\".*/\1/p"
}

json_number() {
  field="$1"
  sed -n "s/.*\"$field\":\([0-9][0-9]*\).*/\1/p"
}

require_json_string() {
  field="$1"
  value="$(printf '%s' "$2" | json_string "$field")"
  [ -n "$value" ] || {
    printf 'missing JSON string field %s in: %s\n' "$field" "$2" >&2
    exit 1
  }
  printf '%s' "$value"
}

require_json_number() {
  field="$1"
  value="$(printf '%s' "$2" | json_number "$field")"
  [ -n "$value" ] || {
    printf 'missing JSON number field %s in: %s\n' "$field" "$2" >&2
    exit 1
  }
  printf '%s' "$value"
}

ffmpeg -hide_banner -loglevel error -nostdin -y \
  -f lavfi -i testsrc2=size=160x90:rate=15 \
  -t 1 \
  -c:v mpeg4 \
  -pix_fmt yuv420p \
  -movflags +faststart \
  "$clip"

size="$(wc -c < "$clip" | tr -d ' ')"
checksum="$(sha256sum "$clip" | awk '{print $1}')"
client_clip_id="$(printf 'direct-s3-smoke-%s-%s' "$(date +%s)" "$$")"
payload="$(printf '{"client_clip_id":"%s","title":"Direct S3 smoke","source_type":"deployment_smoke","duration_ms":1000,"file_size_bytes":%s,"checksum_sha256":"%s","container":"mp4","video_codec":"mpeg4","width":160,"height":90,"fps":15,"visibility":"private"}' "$client_clip_id" "$size" "$checksum")"

# This check depends on the same compact JSON assumption as the field parsers above.
discovery="$(curl -fsS "$api/.well-known/clipline-cloud")"
printf '%s' "$discovery" | grep -q '"direct_s3_upload":true' || {
  printf 'direct_s3_upload discovery feature was not enabled: %s\n' "$discovery" >&2
  exit 1
}

create_response="$(curl -fsS \
  -H "Authorization: Bearer $SMOKE_TOKEN" \
  -H 'Content-Type: application/json' \
  --data "$payload" \
  "$api/api/v1/uploads")"

mode="$(require_json_string mode "$create_response")"
[ "$mode" = "chunked" ] || {
  printf 'expected chunked upload mode, got %s in: %s\n' "$mode" "$create_response" >&2
  exit 1
}
clip_id="$(require_json_string clip_id "$create_response")"
upload_id="$(require_json_string upload_id "$create_response")"
presign_template="$(require_json_string direct_part_presign_url_template "$create_response")"
ack_template="$(require_json_string direct_part_ack_url_template "$create_response")"
presign_path="$(printf '%s' "$presign_template" | sed 's/{part_number}/1/g')"
ack_path="$(printf '%s' "$ack_template" | sed 's/{part_number}/1/g')"

presign_response="$(curl -fsS \
  -X POST \
  -H "Authorization: Bearer $SMOKE_TOKEN" \
  "$api$presign_path")"
put_url="$(require_json_string url "$presign_response")"
expected_size="$(require_json_number expected_size_bytes "$presign_response")"
[ "$expected_size" = "$size" ] || {
  printf 'presign expected_size_bytes=%s did not match file size=%s\n' "$expected_size" "$size" >&2
  exit 1
}

: > "$curl_headers"
headers_segment="$(printf '%s' "$presign_response" | sed -n 's/.*"headers":\[\(.*\)\].*/\1/p')"
if [ -n "$headers_segment" ]; then
  printf '%s' "$headers_segment" | sed 's/},{/}\n{/g' > "$headers_lines"
  while IFS= read -r header_json; do
    name="$(printf '%s' "$header_json" | json_string name)"
    value="$(printf '%s' "$header_json" | json_string value)"
    [ -n "$name" ] || {
      printf 'could not parse presigned header name from: %s\n' "$header_json" >&2
      exit 1
    }
    printf 'header = "%s: %s"\n' "$name" "$value" >> "$curl_headers"
  done < "$headers_lines"
fi

if [ -s "$curl_headers" ]; then
  curl -fsS --config "$curl_headers" -D "$put_headers" -o "$put_output" \
    -X PUT --data-binary "@$clip" "$put_url"
else
  curl -fsS -D "$put_headers" -o "$put_output" \
    -X PUT --data-binary "@$clip" "$put_url"
fi

etag="$(sed -n 's/^[Ee][Tt][Aa][Gg]:[[:space:]]*//p' "$put_headers" | tr -d '\r' | tail -n 1)"
etag="$(printf '%s' "$etag" | sed 's/^"//; s/"$//')"
[ -n "$etag" ] || {
  printf 'S3 direct PUT did not return an ETag\n' >&2
  cat "$put_headers" >&2
  exit 1
}

ack_payload="$(printf '{"size_bytes":%s,"checksum_sha256":"%s","etag":"%s"}' "$size" "$checksum" "$etag")"
ack_response="$(curl -fsS \
  -H "Authorization: Bearer $SMOKE_TOKEN" \
  -H 'Content-Type: application/json' \
  --data "$ack_payload" \
  "$api$ack_path")"
printf '%s' "$ack_response" | grep -q "\"upload_id\":\"$upload_id\"" || {
  printf 'ack response did not reference upload_id %s: %s\n' "$upload_id" "$ack_response" >&2
  exit 1
}

curl -fsS \
  -X POST \
  -H "Authorization: Bearer $SMOKE_TOKEN" \
  "$api/api/v1/uploads/$upload_id/complete" >/dev/null

for _ in $(seq 1 120); do
  if clip_response="$(curl -fsS -H "Authorization: Bearer $SMOKE_TOKEN" "$api/api/v1/clips/$clip_id" 2>/dev/null)"; then
    printf '%s' "$clip_response" | grep -q '"status":"ready"' && exit 0
  fi
  sleep 2
done

printf 'direct S3 uploaded clip %s did not become ready\n' "$clip_id" >&2
curl -sS -H "Authorization: Bearer $SMOKE_TOKEN" "$api/api/v1/admin/jobs/recent-errors" >&2 || true
exit 1
SCRIPT
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
  local CLIPLINE_DIRECT_S3_UPLOADS="${CLIPLINE_DIRECT_S3_UPLOADS:-}"
  local CLIPLINE_SINGLE_PUT_MAX_BYTES="${CLIPLINE_SINGLE_PUT_MAX_BYTES:-}"
  local CLIPLINE_VIDEO_OPTIMIZATION="${CLIPLINE_VIDEO_OPTIMIZATION:-}"
  local CLIPLINE_VIDEO_OPTIMIZATION_CRF="${CLIPLINE_VIDEO_OPTIMIZATION_CRF:-}"
  local CLIPLINE_VIDEO_OPTIMIZATION_PRESET="${CLIPLINE_VIDEO_OPTIMIZATION_PRESET:-}"
  local CLIPLINE_VIDEO_OPTIMIZATION_MAX_WIDTH="${CLIPLINE_VIDEO_OPTIMIZATION_MAX_WIDTH:-}"
  local CLIPLINE_VIDEO_OPTIMIZATION_MIN_SAVINGS_PERCENT="${CLIPLINE_VIDEO_OPTIMIZATION_MIN_SAVINGS_PERCENT:-}"
  local CLIPLINE_VIDEO_OPTIMIZATION_KEEP_ORIGINAL="${CLIPLINE_VIDEO_OPTIMIZATION_KEEP_ORIGINAL:-}"

  file="$(compose_file_for_profile "$profile")"
  project="clipline-smoke-$profile-$SMOKE_ID"
  register_cleanup "$project" "$file"

  if [ "$profile" = "s3" ]; then
    require_external_s3_config
  fi

  if [ "$profile" = "minio" ] && [ "$RUN_DIRECT_S3" = "1" ]; then
    CLIPLINE_DIRECT_S3_UPLOADS="${CLIPLINE_DIRECT_S3_UPLOADS:-true}"
    CLIPLINE_SINGLE_PUT_MAX_BYTES="${CLIPLINE_SINGLE_PUT_MAX_BYTES:-1}"
  fi
  if [ "$RUN_VIDEO_OPTIMIZATION" = "1" ]; then
    CLIPLINE_VIDEO_OPTIMIZATION="${CLIPLINE_VIDEO_OPTIMIZATION:-on}"
    CLIPLINE_VIDEO_OPTIMIZATION_CRF="${CLIPLINE_VIDEO_OPTIMIZATION_CRF:-35}"
    CLIPLINE_VIDEO_OPTIMIZATION_PRESET="${CLIPLINE_VIDEO_OPTIMIZATION_PRESET:-veryfast}"
    CLIPLINE_VIDEO_OPTIMIZATION_MAX_WIDTH="${CLIPLINE_VIDEO_OPTIMIZATION_MAX_WIDTH:-160}"
    CLIPLINE_VIDEO_OPTIMIZATION_MIN_SAVINGS_PERCENT="${CLIPLINE_VIDEO_OPTIMIZATION_MIN_SAVINGS_PERCENT:-1}"
    CLIPLINE_VIDEO_OPTIMIZATION_KEEP_ORIGINAL="${CLIPLINE_VIDEO_OPTIMIZATION_KEEP_ORIGINAL:-false}"
  fi

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
      if [ "$RUN_VIDEO_OPTIMIZATION" = "1" ]; then
        smoke_video_optimization "$project" "$file" "$token"
      fi
      ;;
    minio)
      if [ "$RUN_DIRECT_S3" = "1" ]; then
        smoke_direct_s3_upload "$project" "$file" "$token"
      else
        log "Skipping direct S3 runtime smoke; set RUN_DIRECT_S3=1 to enable"
      fi
      if [ "$RUN_VIDEO_OPTIMIZATION" = "1" ]; then
        smoke_video_optimization "$project" "$file" "$token"
      fi
      log "Checking storage readiness failure"
      compose "$project" "$file" stop minio >/dev/null
      expect_not_ready "$project" "$file" storage
      compose "$project" "$file" start minio >/dev/null
      wait_ready "$project" "$file"
      ;;
    postgres)
      smoke_postgres_backup_restore "$project" "$file" "$token"
      if [ "$RUN_VIDEO_OPTIMIZATION" = "1" ]; then
        smoke_video_optimization "$project" "$file" "$token"
      fi
      log "Checking database readiness failure"
      compose "$project" "$file" stop postgres >/dev/null
      expect_not_ready "$project" "$file" database
      compose "$project" "$file" start postgres >/dev/null
      wait_healthy "$project" "$file" postgres
      wait_ready "$project" "$file"
      ;;
    s3)
      smoke_external_s3_upload "$project" "$file" "$token"
      if [ "$RUN_VIDEO_OPTIMIZATION" = "1" ]; then
        smoke_video_optimization "$project" "$file" "$token"
      fi
      if [ "$RUN_DIRECT_S3" = "1" ] && [ "${CLIPLINE_DIRECT_S3_UPLOADS:-}" = "true" ]; then
        smoke_direct_s3_upload "$project" "$file" "$token"
      fi
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
  local probe_ok="0"

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

  for _ in $(seq 1 30); do
    if curl -k -fsS -D "$headers_file" "https://localhost:${https_port}/readyz" > "$readyz_file"; then
      probe_ok="1"
      break
    fi
    sleep 2
  done

  if [ "$probe_ok" != "1" ]; then
    compose "$project" "$file" logs caddy >&2 || true
    die "Caddy HTTPS /readyz probe failed for $project"
  fi

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

  preflight_runtime_profiles
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
