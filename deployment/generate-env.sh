#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=".env"

# Get local IP (Linux/macOS)
SERVER_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || ipconfig getifaddr en0)
SERVER_IP=${SERVER_IP:-127.0.0.1}

# Machine secrets — full entropy hex
gen_secret() {
  openssl rand -hex 32
}

# Human-facing passwords — two words + random suffix
gen_passphrase() {
  local words=(
    amber anchor anvil arrow basin birch blade blaze bloom bolt
    brook cairn cedar chalk cliff cloak cloud cobalt coral crest
    delta drift ember fable fern flint forge frost grove haven
    heath heron ivory jade kite lance larch ledge maple marsh
    mast mitre moose mossy noble north olive onset orbit otter
    oxide pearl pilot pixel plume prism quartz quill raven reef
    ridge rivet rowan rudder rune sabre scribe sedge shale slate
    smoke solar solvent spire spoke stave stern stone swift thorn
    tide timber token torch totem trace trail tread trove turf
    vault veil venom verde viper vista volt warden weld wharf
    willow wren yarrow zenith
  )
  local n=${#words[@]}
  local w1=${words[$((RANDOM % n))]}
  local w2=${words[$((RANDOM % n))]}
  local suffix
  suffix=$(openssl rand -hex 2)   # 4 hex chars — enough to foil dictionary attacks
  echo "${w1}-${w2}-${suffix}"
}

cat > "$ENV_FILE" <<EOF
SERVER_IP=${SERVER_IP}
DEFAULT_USERNAME=admin
DEFAULT_PASSWORD=$(gen_passphrase)

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$(gen_secret)

# RabbitMQ
RABBITMQ_USER=admin
RABBITMQ_PASS=$(gen_passphrase)

# Keys
MEILI_MASTER_KEY=$(gen_secret)
CLUSTER_WORKER_SECRET=$(gen_secret)
DOZZLE_PASSWORD=$(gen_passphrase)
SERVER_IDENT_HEX_STRING=$(gen_secret)
MAIN_ENCRYPTION_KEY=$(gen_secret)

# Paths
CONSUME_PATH=/tmp/rain-dms/consume
CONSUMED_PATH=/tmp/rain-dms/consumed
TEMP_PATH=/tmp/rain-dms/temp
CA_CERT_PATH=/etc/nginx/certs/rootCA.pem

# S3
ACCESS_KEY_S3=rain-dms
SECRET_KEY_S3=$(gen_secret)

DEBUG_WATCHER=false

ENCRYPT_AT_REST=false
EOF

echo "Generated $ENV_FILE"