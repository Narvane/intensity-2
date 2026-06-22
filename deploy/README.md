# Production deploy (VPS)

Production stack per **DT-07** and **DT-08**: Caddy (TLS) + Spring Boot API + PostgreSQL on a single VPS.

## Prerequisites

- Linux VPS with Docker 24+ and Compose v2
- DNS `A` records for `API_DOMAIN` and `APP_DOMAIN` pointing to the VPS
- GitHub repo with API CI pushing to GHCR (`ghcr.io/<owner>/<repo>/api`)
- Repository secrets: `DEPLOY_WEBHOOK_URL`, `DEPLOY_WEBHOOK_SECRET` (optional)

## First-time setup

1. Clone this repo on the VPS (e.g. `/opt/intensity`).

2. Configure secrets:

   ```bash
   cd deploy
   cp .env.example .env
   # Edit .env — strong passwords, real domains, GHCR image path
   ```

3. Make scripts executable:

   ```bash
   chmod +x deploy.sh webhook/receive.sh
   ```

4. Log in to GHCR on the VPS (once):

   ```bash
   echo "$GITHUB_PAT" | docker login ghcr.io -u YOUR_GITHUB_USER --password-stdin
   ```

5. Start the stack:

   ```bash
   ./deploy.sh
   ```

6. Verify:

   ```bash
   curl -fsS "https://$API_DOMAIN/actuator/health"
   curl -fsS "https://$APP_DOMAIN/.well-known/assetlinks.json"
   curl -fsS "https://$APP_DOMAIN/.well-known/apple-app-site-association"
   ```

   Update placeholder values in `client/deep-link/.well-known/` (Android SHA256 fingerprint, Apple Team ID) **before** store submission.

## Automated deploy (CI webhook)

On push to `master`, GitHub Actions builds the Docker image, pushes to GHCR, and POSTs to `DEPLOY_WEBHOOK_URL`:

```json
{ "image": "ghcr.io/owner/intensity/api", "sha": "<commit-sha>" }
```

### Option A — Manual pull (simplest)

After CI succeeds, SSH to the VPS and run:

```bash
cd /opt/intensity/deploy
./deploy.sh
```

Or pin a specific SHA:

```bash
./deploy.sh ghcr.io/owner/intensity/api abc123def456
```

### Option B — Webhook listener

Install [webhook](https://github.com/admittances/webhook) on the VPS, point it at `deploy/webhook/hooks.json`, and set:

- `DEPLOY_WEBHOOK_URL` → `https://your-vps:9000/hooks/intensity-api-deploy`
- `DEPLOY_WEBHOOK_SECRET` → same value as in `deploy/.env`

Example systemd unit:

```ini
[Unit]
Description=Intensity deploy webhook
After=network.target

[Service]
ExecStart=/usr/bin/webhook -hooks /opt/intensity/deploy/webhook/hooks.json -port 9000 -verbose
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Restrict port 9000 to GitHub Actions egress or protect with a reverse proxy + secret header.

## Rollback

Pin the previous image tag in `.env`:

```env
API_IMAGE=ghcr.io/owner/intensity/api:PREVIOUS_SHA
```

Then run `./deploy.sh`.

## Stack layout

```
Internet :443
    ↓
  Caddy (proxy)
    ├── api.<domain>  → api:8080
    └── app.<domain>  → /.well-known/* (deep link association files)
Postgres (internal network only)
```

## Order of release (DT-10)

1. Deploy API to VPS (`./deploy.sh` or CI webhook)
2. Build and submit client store release (`client/STORE_RELEASE.md`)

Never ship a client build that calls new API endpoints before the API is live.
