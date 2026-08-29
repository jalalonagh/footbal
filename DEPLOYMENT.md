# footiq.ir Deployment Guide

## Architecture
```
footiq.ir ──→ Nginx ──→ Next.js (port 3000)  [Frontend]
api.footiq.ir ──→ Nginx ──→ .NET API (port 8080)  [Backend]
                ──→ SQL Server (93.118.113.229)  [Database]
                ──→ Redis (127.0.0.1:6379)  [Cache]
```

---

## Step 1: Server Setup

```bash
# Install Docker & Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Certbot (for SSL)
sudo apt install certbot
```

---

## Step 2: DNS Configuration

In your domain registrar (footiq.ir), add these DNS records:

| Type  | Host            | Value              | TTL   |
|-------|-----------------|--------------------|-------|
| A     | @               | YOUR_SERVER_IP     | 3600  |
| A     | api             | YOUR_SERVER_IP     | 3600  |
| A     | www             | YOUR_SERVER_IP     | 3600  |
| CNAME | @ → www         | footiq.ir          | 3600  |

---

## Step 3: SSL Certificate

```bash
# Stop nginx first
docker compose -f docker-compose.production.yml stop nginx

# Get certificates (standalone mode)
sudo certbot certonly --standalone -d footiq.ir -d www.footiq.ir -d api.footiq.ir

# Copy certs to project
sudo cp /etc/letsencrypt/live/footiq.ir/fullchain.pem ./nginx/certs/
sudo cp /etc/letsencrypt/live/footiq.ir/privkey.pem ./nginx/certs/
sudo chmod 644 ./nginx/certs/*.pem
```

---

## Step 4: Configure Environment

```bash
# Copy and edit environment file
cp .env.example .env
nano .env
```

Fill in all values:
- `DB_CONNECTION_STRING` — your SQL Server connection string
- `REDIS_CONNECTION_STRING` — Redis host:port,password
- `JWT_KEY` — 32+ character secret key (generate with `openssl rand -base64 32`)
- `ZARINPAL_MERCHANT_ID` — your ZarinPal merchant ID
- `AI_BASE_URL` — Arvan Cloud AI URL
- `AI_API_KEY` — Arvan Cloud API key

---

## Step 5: Build & Deploy

```bash
# Clone project to server
git clone https://github.com/YOUR_REPO/footbal.git /opt/footiq
cd /opt/footiq

# Build images
docker compose -f docker-compose.production.yml build

# Start all services
docker compose -f docker-compose.production.yml up -d

# Check status
docker compose -f docker-compose.production.yml ps

# View logs
docker compose -f docker-compose.production.yml logs -f api
docker compose -f docker-compose.production.yml logs -f web
```

---

## Step 6: Verify

```bash
# Test API
curl https://api.footiq.ir/api/academy

# Test Frontend
curl https://footiq.ir

# Check SSL
echo | openssl s_client -connect footiq.ir:443 -servername footiq.ir 2>/dev/null | openssl x509 -noout -dates
```

---

## SSL Auto-Renewal

```bash
# Add cron job
sudo crontab -e
# Add this line:
0 0 1 * * certbot renew --pre-hook "docker compose -f /opt/footiq/docker-compose.production.yml stop nginx" --post-hook "docker compose -f /opt/footiq/docker-compose.production.yml start nginx" --deploy-hook "cp /etc/letsencrypt/live/footiq.ir/*.pem /opt/footiq/nginx/certs/"
```

---

## Quick Commands

```bash
# Restart
docker compose -f docker-compose.production.yml restart

# Update (after git pull)
docker compose -f docker-compose.production.yml up -d --build

# Stop
docker compose -f docker-compose.production.yml down

# Logs
docker compose -f docker-compose.production.yml logs -f

# Database migration (manual if needed)
docker compose -f docker-compose.production.yml exec api dotnet ef database update
```

---

## Troubleshooting

### API returns CORS error
- Check `Cors:Origins` in appsettings includes `https://footiq.ir`
- Ensure nginx is forwarding `X-Forwarded-Proto` header

### Frontend can't reach API
- Check `NEXT_PUBLIC_API_URL=https://api.footiq.ir/api` in env
- Verify DNS: `nslookup api.footiq.ir`

### Database connection failed
- Check SQL Server is accessible from server
- Verify `DB_CONNECTION_STRING` in `.env`

### SSL certificate error
- Check certs exist in `./nginx/certs/`
- Ensure domain DNS points to your server
- Run `sudo certbot renew` if expired
