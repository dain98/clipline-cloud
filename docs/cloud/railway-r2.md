# Railway + Cloudflare R2 Deployment

This guide is for the hosted path where Railway runs Clipline Cloud and Cloudflare R2 stores uploaded
media. It is meant for users who do not want to manage a VPS, Docker Compose, mounted disks, or backups
for video files.

Railway should run:

- One Clipline Cloud web service from the published Docker image.
- One Railway Postgres service for metadata.
- No persistent app volume. Media lives in R2; the app container can be replaced at any time.

Cloudflare R2 should provide:

- One private bucket for media.
- One S3 API token with Object Read & Write access to that bucket. Cloudflare describes this as
  permission to read, write, and list objects in specific buckets; Clipline's readiness check uses that
  object-list access and does not need account-wide bucket administration.

## What the one-click template should ask for

The Railway template should preconfigure everything except the R2 bucket details. The Clipline service
should use this Docker image:

```text
ghcr.io/dain98/clipline-cloud:latest
```

Use a pinned release tag instead, such as `ghcr.io/dain98/clipline-cloud:1.2.9`, if you want the
template to deploy a fixed version until the template is updated.

The user-facing required variables should be:

| Variable | Value |
|----------|-------|
| `CLIPLINE_S3_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |
| `CLIPLINE_S3_BUCKET` | The R2 bucket name |
| `CLIPLINE_S3_ACCESS_KEY_ID` | R2 Access Key ID |
| `CLIPLINE_S3_SECRET_ACCESS_KEY` | R2 Secret Access Key |

These should be preconfigured by the template:

| Variable | Value |
|----------|-------|
| `CLIPLINE_PUBLIC_URL` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` when the template generates a public domain, or the custom domain URL after the user adds one |
| `CLIPLINE_DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `CLIPLINE_STORAGE_BACKEND` | `s3` |
| `CLIPLINE_S3_REGION` | `auto` |
| `CLIPLINE_S3_FORCE_PATH_STYLE` | `true` |
| `CLIPLINE_S3_PREFIX` | empty, unless sharing a bucket |
| `CLIPLINE_DIRECT_S3_UPLOADS` | `false` |
| `CLIPLINE_PUBLIC_MEDIA_MODE` | `presigned` |
| `CLIPLINE_PUBLIC_READ_URL_TTL_SECONDS` | `300` |
| `CLIPLINE_BOOTSTRAP_ADMIN_USERNAME` | `admin` |
| `CLIPLINE_SESSION_SECRET` | `${{secret(64)}}` |
| `CLIPLINE_MAX_UPLOAD_SIZE_BYTES` | `5368709120` |
| `CLIPLINE_UPLOAD_PART_SIZE_BYTES` | `8388608` |
| `CLIPLINE_SINGLE_PUT_MAX_BYTES` | `67108864` |
| `CLIPLINE_UPLOAD_SESSION_TTL_SECONDS` | `86400` |
| `CLIPLINE_VIDEO_OPTIMIZATION` | `off` |
| `CLIPLINE_LOG_LEVEL` | `info` |

Do not set `CLIPLINE_BIND_ADDR` in Railway. Railway injects `PORT`, and Clipline Cloud binds to
`0.0.0.0:$PORT` when `CLIPLINE_BIND_ADDR` is absent.

Do not use `RAILWAY_PRIVATE_DOMAIN` for `CLIPLINE_PUBLIC_URL`. That private hostname is only for
service-to-service traffic inside Railway. Clipline needs its public HTTPS URL for cookies, CSRF origin
checks, public share links, and embed metadata.

Railway may not show `PORT` or `RAILWAY_PUBLIC_DOMAIN` in the service variable list before a deploy and
public domain are created. That is expected: leave `CLIPLINE_BIND_ADDR` unset, enable public networking,
and set `CLIPLINE_PUBLIC_URL` to the generated Railway public domain or the final custom domain.

## User setup

### 1. Create the R2 bucket

1. Open the Cloudflare dashboard.
2. Go to **Storage & databases > R2**.
3. Select **Create bucket**.
4. Name it, for example `clipline-media`.
5. Create the bucket.

Keep the bucket private. Clipline Cloud uses authenticated S3 API calls and presigned URLs; the bucket
does not need to be public.

### 2. Create R2 S3 credentials

1. In the Cloudflare dashboard, go to **Storage & databases > R2 > Overview**.
2. Select **Manage API Tokens**.
3. Create an account or user API token.
4. Choose **Object Read & Write**.
5. Scope the token to the Clipline bucket only.
6. Copy the Access Key ID and Secret Access Key.
7. Copy the S3 API endpoint. It looks like:

   ```text
   https://<account-id>.r2.cloudflarestorage.com
   ```

Cloudflare R2 uses region `auto`. `us-east-1` aliases to `auto`, but the Railway template should use
`auto` so the configuration matches Cloudflare's wording.

### 3. Deploy on Railway

1. Click the Clipline Cloud Railway template link.
2. Configure the Clipline Cloud service.
3. Paste the four R2 values:
   - `CLIPLINE_S3_ENDPOINT`
   - `CLIPLINE_S3_BUCKET`
   - `CLIPLINE_S3_ACCESS_KEY_ID`
   - `CLIPLINE_S3_SECRET_ACCESS_KEY`
4. Deploy the template.
5. Wait for the Clipline Cloud service and Postgres service to become healthy.

On first boot, Clipline Cloud creates the owner account. If no bootstrap password was configured,
Railway logs contain the generated one-time password:

```text
Clipline Cloud initialized.
Initial owner user created: admin
One-time password: <generated-password>
Save this password now. It will not be shown again.
```

Log in as `admin`, change the password, and create users.

### 4. Optional custom domain

Railway's generated domain works immediately. For a custom domain:

1. In Railway, open the Clipline Cloud service.
2. Go to **Settings > Networking**.
3. Add the custom domain and follow Railway's DNS instructions.
4. After the domain is active, update:

   ```text
   CLIPLINE_PUBLIC_URL=https://clips.example.com
   ```

5. Redeploy the Clipline Cloud service so share links, embeds, cookies, and CSRF origin checks use the
   custom domain.

## Maintainer template setup

Railway templates are created in Railway. The template should use the published Docker image, not the
GitHub repository, so users do not wait for Railway to build Clipline from source.

1. In Railway, create a new template.
2. Add a Clipline Cloud service from a Docker image:

   ```text
   ghcr.io/dain98/clipline-cloud:latest
   ```

   Use `latest` for the easiest update path, or a pinned release tag for reproducible template deploys.
3. Configure the service health check path as:

   ```text
   /readyz
   ```

4. Enable public networking for the Clipline Cloud service and generate a public Railway domain.
5. Add a Railway Postgres service named `Postgres`.
6. Configure the Clipline Cloud variables from the tables above.
7. Mark the four R2 variables as required user inputs with clear descriptions.
8. Deploy a test instance from the template.
9. Upload a short clip and verify:
   - `/readyz` returns `{"status":"ok","database":"ok","storage":"ok"}`.
   - The clip reaches `ready`.
   - Public playback works.
   - The R2 bucket contains `objects/media/...` keys.
10. Publish the template and copy its Template URL.
11. Add the button to `README.md`:

    ```md
    [![Deploy on Railway](https://railway.com/button.svg)](<template-url>)
    ```

## R2 CORS

The default Railway/R2 deployment does not require R2 browser-upload CORS because uploads go through the
Clipline Cloud server. Keep `CLIPLINE_DIRECT_S3_UPLOADS=false` unless the desktop client has implemented
the direct-S3 upload flow and the bucket CORS policy has been explicitly tested.

## Operational notes

- Use Postgres on Railway. SQLite without a persistent volume is not durable.
- Use R2 for media. Railway's app filesystem is ephemeral and should not be treated as media storage.
- Keep the R2 bucket private.
- Rotate the R2 token if it is ever pasted into the wrong service or shared publicly.
- Use `CLIPLINE_S3_PREFIX` only when deliberately sharing a bucket with another app or environment.
