#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "Installing mkcert..."
brew install mkcert -y > /dev/null 2>&1 || true

echo "Installing local CA into system trust..."
mkcert -install

# Detect local LAN IP (macOS)
LOCAL_IP=$(hostname -I | awk '{print $1}')
echo "Detected LAN IP: $LOCAL_IP"

CERT_NAME="rain.dms.cert"
CERT_FILE="${CERT_NAME}.pem"
KEY_FILE="${CERT_NAME}-key.pem"

echo "Generating TLS certificate for local ip: ${LOCAL_IP}..."

mkcert \
  -key-file "$KEY_FILE" \
  -cert-file "$CERT_FILE" \
  localhost \
  127.0.0.1 \
  nginx \
  "$LOCAL_IP"

CERT_NAME="rabbitmq-cert"
CERT_FILE="${CERT_NAME}.pem"
KEY_FILE="${CERT_NAME}-key.pem"

mkcert \
  -key-file "$KEY_FILE" \
  -cert-file "$CERT_FILE" \
  rabbitmq \
  localhost \
  127.0.0.1 \
  nginx \
  "$LOCAL_IP"


CAROOT=$(mkcert -CAROOT)
ROOT_CA_SOURCE="$CAROOT/rootCA.pem"
ROOT_CA_DEST="./rootCA.pem"

if [ ! -f "$ROOT_CA_SOURCE" ]; then
  echo "ERROR: mkcert root CA not found at:"
  echo "$ROOT_CA_SOURCE"
  exit 1
fi

echo "Copying root CA into certs folder..."

cp "$ROOT_CA_SOURCE" "$ROOT_CA_DEST"


chmod 644 $ROOT_CA_DEST
chmod 644 $CERT_FILE
chmod 644 $KEY_FILE

echo ""
echo "Certificates generated:"
ls -la *.pem

echo ""

ENV_FILE="../../.env"

echo ""
echo "Updating .env with NODE_EXTRA_CA_CERTS..."

touch "$ENV_FILE"

# Remove existing entry if present
grep -v "^NODE_EXTRA_CA_CERTS=" "$ENV_FILE" > "${ENV_FILE}.tmp" || true
mv "${ENV_FILE}.tmp" "$ENV_FILE"

echo "NODE_EXTRA_CA_CERTS=$(pwd)/rootCA.pem" >> "$ENV_FILE"

echo "✓ .env updated"

echo ""
echo "========================================="
echo "TLS setup complete"
echo "========================================="
echo ""
echo "Server cert: $(pwd)/$CERT_FILE"
echo "Server key : $(pwd)/$KEY_FILE"
echo "Root CA    : $(pwd)/rootCA.pem"
echo ""
echo "NODE_EXTRA_CA_CERTS configured automatically."
echo ""