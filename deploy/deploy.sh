#!/usr/bin/env bash
# =============================================================================
# FPicare – one-command, idempotent deploy for an Ubuntu/Debian VPS (run as root)
#
#   bash deploy/deploy.sh [SOURCE_DIR]
#
# Designed to live safely on a VPS that already hosts other sites/servers:
#   * Uses its own folder (/var/www/fpicare), its own PM2 process (fpicare-api)
#     and its own Nginx server block (fpicare.conf) – nothing else is touched.
#   * Picks a FREE local port for the API (bound to 127.0.0.1 only).
#   * Uses a separate MongoDB database ("fpicare"); never drops other DBs.
#   * Validates Nginx config before a graceful reload; rolls back its own file
#     if validation fails, so other sites keep running.
#   * Never runs `pm2 delete all`, never restarts other PM2 apps.
#
# Optional environment variables:
#   DOMAIN        Domain for the site (default: fpicare.<ip-with-dashes>.sslip.io)
#   APP_DIR       Install dir (default: /var/www/fpicare)
#   API_PORT      Force an API port (default: first free port from 5055)
#   MONGO_URI     Use an existing MongoDB / Atlas URI
#   ENABLE_SSL    1 (default) to request a free Let's Encrypt certificate
# =============================================================================
set -euo pipefail

SRC_DIR="$(cd "${1:-$(dirname "$0")/..}" && pwd)"
APP_NAME="fpicare"
PM2_NAME="fpicare-api"
APP_DIR="${APP_DIR:-/var/www/fpicare}"
ENABLE_SSL="${ENABLE_SSL:-1}"
CRED_FILE="/root/fpicare-credentials.txt"

log()  { echo -e "\n\033[1;35m==> $*\033[0m"; }
warn() { echo -e "\033[1;33m[warn] $*\033[0m"; }
die()  { echo -e "\033[1;31m[error] $*\033[0m"; exit 1; }

[ "$(id -u)" -eq 0 ] || die "Please run as root (sudo bash deploy/deploy.sh)"
[ -f "$SRC_DIR/backend/package.json" ] || die "Source not found at $SRC_DIR"
export DEBIAN_FRONTEND=noninteractive

port_in_use() { ss -ltnH "( sport = :$1 )" 2>/dev/null | grep -q .; }
port_owner()  { ss -ltnpH "( sport = :$1 )" 2>/dev/null | grep -o 'users:(("[^"]*' | head -1 | cut -d'"' -f2; }

# ---------------------------------------------------------------- base tools
log "Checking base packages"
need=()
for b in curl rsync ss openssl; do command -v "$b" >/dev/null || need+=("$b"); done
if [ ${#need[@]} -gt 0 ]; then
  apt-get update -y
  pkgs=()
  for b in "${need[@]}"; do [ "$b" = ss ] && pkgs+=(iproute2) || pkgs+=("$b"); done
  apt-get install -y "${pkgs[@]}" ca-certificates gnupg
fi

# ---------------------------------------------------------------- domain
if [ -z "${DOMAIN:-}" ]; then
  PUBLIC_IP="$(curl -fsS --max-time 5 https://api.ipify.org || hostname -I | awk '{print $1}')"
  DOMAIN="${APP_NAME}.${PUBLIC_IP//./-}.sslip.io"
fi
log "Domain: $DOMAIN"

# ---------------------------------------------------------------- Node.js
NODE_BIN=""
if command -v node >/dev/null; then
  major="$(node -p 'process.versions.node.split(".")[0]')"
  [ "$major" -ge 18 ] && NODE_BIN="$(command -v node)"
fi
if [ -z "$NODE_BIN" ]; then
  # Install a private Node 20 for this app only, so the system Node used by
  # other projects is not changed.
  log "Installing private Node.js 20 to /opt/fpicare-node"
  NV="v20.18.1"
  curl -fsSL "https://nodejs.org/dist/$NV/node-$NV-linux-x64.tar.xz" -o /tmp/node.tar.xz
  rm -rf /opt/fpicare-node && mkdir -p /opt/fpicare-node
  tar -xJf /tmp/node.tar.xz -C /opt/fpicare-node --strip-components=1
  NODE_BIN="/opt/fpicare-node/bin/node"
fi
NODE_DIR="$(dirname "$NODE_BIN")"
export PATH="$NODE_DIR:$PATH"
NPM="$NODE_DIR/npm"; [ -x "$NPM" ] || NPM="$(command -v npm)"
log "Using node $("$NODE_BIN" -v) at $NODE_BIN"

if ! command -v pm2 >/dev/null; then
  log "Installing PM2"
  "$NPM" install -g pm2@5
  hash -r
fi
PM2="$(command -v pm2 || echo "$NODE_DIR/pm2")"

# ---------------------------------------------------------------- MongoDB
EXISTING_ENV="$APP_DIR/backend/.env"
if [ -z "${MONGO_URI:-}" ] && [ -f "$EXISTING_ENV" ]; then
  MONGO_URI="$(grep -E '^MONGO_URI=' "$EXISTING_ENV" | cut -d= -f2- || true)"
fi
if [ -z "${MONGO_URI:-}" ]; then
  if port_in_use 27017; then
    log "MongoDB already running on 27017 – using a separate 'fpicare' database"
  else
    log "Installing MongoDB (no MongoDB found on this server)"
    . /etc/os-release
    if [ "$ID" = "ubuntu" ]; then
      case "$VERSION_CODENAME" in
        noble)       MVER=8.0; CODENAME=noble ;;
        jammy|focal) MVER=7.0; CODENAME="$VERSION_CODENAME" ;;
        *)           MVER=8.0; CODENAME=noble ;;
      esac
      REPO="deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-$MVER.gpg ] https://repo.mongodb.org/apt/ubuntu $CODENAME/mongodb-org/$MVER multiverse"
    else
      MVER=8.0
      REPO="deb [ signed-by=/usr/share/keyrings/mongodb-server-$MVER.gpg ] http://repo.mongodb.org/apt/debian bookworm/mongodb-org/$MVER main"
    fi
    curl -fsSL "https://www.mongodb.org/static/pgp/server-$MVER.asc" | gpg --dearmor --yes -o "/usr/share/keyrings/mongodb-server-$MVER.gpg"
    echo "$REPO" > "/etc/apt/sources.list.d/mongodb-org-$MVER.list"
    apt-get update -y
    apt-get install -y mongodb-org
    systemctl enable --now mongod
    for _ in $(seq 1 30); do port_in_use 27017 && break; sleep 1; done
    port_in_use 27017 || die "MongoDB did not start. Check: journalctl -u mongod"
  fi
  MONGO_URI="mongodb://127.0.0.1:27017/fpicare"
fi

# ---------------------------------------------------------------- API port
CUR_PORT=""
[ -f "$EXISTING_ENV" ] && CUR_PORT="$(grep -E '^PORT=' "$EXISTING_ENV" | cut -d= -f2 || true)"
if [ -n "${API_PORT:-}" ]; then
  :
elif [ -n "$CUR_PORT" ]; then
  API_PORT="$CUR_PORT"   # keep the port we already own across redeploys
else
  API_PORT=5055
  while port_in_use "$API_PORT"; do API_PORT=$((API_PORT + 1)); done
fi
log "API will listen on 127.0.0.1:$API_PORT"

# ---------------------------------------------------------------- code
log "Syncing code to $APP_DIR"
mkdir -p "$APP_DIR"
rsync -a --delete \
  --exclude '.git' --exclude 'node_modules' --exclude 'frontend/dist' \
  --exclude 'backend/.env' --exclude 'backend/uploads' --exclude 'logs' \
  "$SRC_DIR"/ "$APP_DIR"/
mkdir -p "$APP_DIR/backend/uploads" "$APP_DIR/logs"

# ---------------------------------------------------------------- backend .env
SCHEME="http"; [ "$ENABLE_SSL" = "1" ] && SCHEME="https"
if [ ! -f "$APP_DIR/backend/.env" ]; then
  log "Creating backend/.env"
  ADMIN_PASS="$(openssl rand -base64 12 | tr -dc 'A-Za-z0-9' | head -c 12)@Fp1"
  cat > "$APP_DIR/backend/.env" <<EOF
NODE_ENV=production
HOST=127.0.0.1
PORT=$API_PORT
MONGO_URI=$MONGO_URI
JWT_SECRET=$(openssl rand -hex 48)
JWT_EXPIRES_IN=30d
CLIENT_URL=https://$DOMAIN,http://$DOMAIN
UPLOAD_DIR=$APP_DIR/backend/uploads
ADMIN_NAME=FPicare Admin
ADMIN_EMAIL=admin@fpicare.in
ADMIN_PASSWORD=$ADMIN_PASS
EOF
  chmod 600 "$APP_DIR/backend/.env"
  {
    echo "FPicare admin login (created $(date))"
    echo "URL:      $SCHEME://$DOMAIN/admin"
    echo "Email:    admin@fpicare.in"
    echo "Password: $ADMIN_PASS"
    echo "Change it after first login (Account > Profile)."
  } > "$CRED_FILE"
  chmod 600 "$CRED_FILE"
else
  sed -i "s|^PORT=.*|PORT=$API_PORT|" "$APP_DIR/backend/.env"
fi

# ---------------------------------------------------------------- install & build
log "Installing backend dependencies"
cd "$APP_DIR/backend"
"$NPM" ci --omit=dev --no-audit --no-fund

log "Building frontend"
cd "$APP_DIR/frontend"
"$NPM" ci --no-audit --no-fund
"$NPM" run build

log "Seeding database (safe: only fills an empty catalog)"
cd "$APP_DIR/backend"
"$NODE_BIN" src/seed/seed.js

# ---------------------------------------------------------------- PM2 (only our app)
log "Starting API with PM2 ($PM2_NAME)"
cd "$APP_DIR"
cat > "$APP_DIR/ecosystem.config.cjs" <<EOF
module.exports = {
  apps: [{
    name: '$PM2_NAME',
    cwd: '$APP_DIR/backend',
    script: 'src/server.js',
    interpreter: '$NODE_BIN',
    instances: 1,
    exec_mode: 'fork',
    max_memory_restart: '400M',
    env: { NODE_ENV: 'production' },
    out_file: '$APP_DIR/logs/api-out.log',
    error_file: '$APP_DIR/logs/api-error.log',
    time: true,
  }],
};
EOF
if "$PM2" describe "$PM2_NAME" >/dev/null 2>&1; then
  "$PM2" reload "$APP_DIR/ecosystem.config.cjs" --only "$PM2_NAME" --update-env
else
  "$PM2" start "$APP_DIR/ecosystem.config.cjs" --only "$PM2_NAME"
fi
"$PM2" save
if ! systemctl list-unit-files 2>/dev/null | grep -q '^pm2-root'; then
  "$PM2" startup systemd -u root --hp /root >/dev/null || warn "pm2 startup not configured"
fi

for _ in $(seq 1 20); do curl -fsS "http://127.0.0.1:$API_PORT/api/health" >/dev/null 2>&1 && break; sleep 1; done
curl -fsS "http://127.0.0.1:$API_PORT/api/health" >/dev/null || die "API not responding. See: pm2 logs $PM2_NAME"

# ---------------------------------------------------------------- Nginx
HTTP_PORT=80
if ! command -v nginx >/dev/null; then
  owner="$(port_owner 80 || true)"
  if port_in_use 80; then
    warn "Port 80 is used by '$owner' (not nginx). Installing nginx on port 8088 instead to avoid conflicts."
    HTTP_PORT=8088
  fi
  log "Installing nginx"
  apt-get update -y
  # If port 80 is busy the stock site cannot start during install; that is fine,
  # we remove it and configure our own port below.
  apt-get install -y nginx || warn "nginx post-install start failed (expected if port 80 is busy)"
  command -v nginx >/dev/null || die "nginx installation failed"
  # Fresh install: drop the stock default site so it does not shadow ours.
  rm -f /etc/nginx/sites-enabled/default
else
  owner="$(port_owner 80 || true)"
  if port_in_use 80 && [ -n "$owner" ] && [ "$owner" != "nginx" ]; then
    warn "Port 80 is used by '$owner'. Serving FPicare on port 8088."
    HTTP_PORT=8088
  fi
fi

if [ -d /etc/nginx/sites-available ]; then
  NGX_FILE=/etc/nginx/sites-available/$APP_NAME.conf
  NGX_LINK=/etc/nginx/sites-enabled/$APP_NAME.conf
else
  NGX_FILE=/etc/nginx/conf.d/$APP_NAME.conf
  NGX_LINK=""
fi
BACKUP=""
[ -f "$NGX_FILE" ] && BACKUP="$(mktemp)" && cp "$NGX_FILE" "$BACKUP"

log "Writing nginx site $NGX_FILE"
cat > "$NGX_FILE" <<EOF
# FPicare – managed by deploy/deploy.sh
server {
    listen $HTTP_PORT;
    listen [::]:$HTTP_PORT;
    server_name $DOMAIN;

    root $APP_DIR/frontend/dist;
    index index.html;
    client_max_body_size 10m;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript image/svg+xml;

    location /api/ {
        proxy_pass http://127.0.0.1:$API_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 60s;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:$API_PORT;
        expires 30d;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files \$uri =404;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF
if [ -n "$NGX_LINK" ]; then ln -sf "$NGX_FILE" "$NGX_LINK"; fi

if nginx -t; then
  systemctl enable nginx >/dev/null 2>&1 || true
  if systemctl is-active --quiet nginx; then systemctl reload nginx; else systemctl start nginx; fi
else
  warn "nginx config test failed – restoring previous state so other sites are unaffected"
  if [ -n "$BACKUP" ]; then cp "$BACKUP" "$NGX_FILE"; else rm -f "$NGX_FILE" ${NGX_LINK:+"$NGX_LINK"}; fi
  nginx -t && systemctl reload nginx || true
  die "Fix nginx config and re-run."
fi

if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then
  ufw allow "$HTTP_PORT"/tcp >/dev/null || true
  ufw allow 443/tcp >/dev/null || true
fi

# ---------------------------------------------------------------- SSL
SITE_URL="http://$DOMAIN"; [ "$HTTP_PORT" != 80 ] && SITE_URL="http://$DOMAIN:$HTTP_PORT"
if [ "$ENABLE_SSL" = "1" ] && [ "$HTTP_PORT" = 80 ]; then
  log "Requesting HTTPS certificate (Let's Encrypt)"
  command -v certbot >/dev/null || apt-get install -y certbot python3-certbot-nginx
  if certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect --keep-until-expiring; then
    SITE_URL="https://$DOMAIN"
  else
    warn "SSL not issued (DNS not pointing here yet or rate limited). Site works on HTTP; re-run later."
  fi
fi

log "Done!"
echo "  Website : $SITE_URL"
echo "  Admin   : $SITE_URL/admin"
echo "  API     : 127.0.0.1:$API_PORT  (pm2 logs $PM2_NAME)"
if [ -f "$CRED_FILE" ]; then echo "  Admin credentials saved in $CRED_FILE (root only)"; fi
exit 0
