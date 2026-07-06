#!/bin/bash
set -euo pipefail

REPO="https://github.com/ninja-boldo/rain-dms.git"
DIR="rain-dms"
ARCH=$(dpkg --print-architecture)

echo "[1/5] Installing dependencies..."
sudo apt update
sudo apt install -y git openssl libnss3-tools ansible jq

if kubectl version --client; then
  echo "kubectl already installed"
else
  echo "kubectl doesnt seem to be installed yet => Installing now..."
  curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/$ARCH/kubectl"
  curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/$ARCH/kubectl.sha256"
  echo "$(cat kubectl.sha256)  kubectl" | sha256sum --check
  sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
  rm kubectl kubectl.sha256
fi


MKCERT_VERSION=$(curl -s https://api.github.com/repos/FiloSottile/mkcert/releases/latest | jq | grep "tag_name" | sed -E 's/.*"([^"]+)".*/\1/')
curl -fL --retry 3 --retry-delay 2 \
  -o /tmp/mkcert \
  "https://github.com/FiloSottile/mkcert/releases/download/${MKCERT_VERSION}/mkcert-${MKCERT_VERSION}-linux-$ARCH"
chmod +x /tmp/mkcert
sudo mv /tmp/mkcert /usr/local/bin/mkcert

echo "[2/5] Cloning repository..."
if [ -d "$DIR" ]; then
  echo "Directory exists. Pulling latest changes..."
  cd "$DIR"
  git pull
else
  git clone "$REPO"
  cd "$DIR"
fi

echo "[3/5] Generating certificates and keys..."
chmod +x docker/certs/create_certs.sh
./docker/certs/create_certs.sh
if [ ! -f ~/.ssh/id_ed25519 ]; then
  ssh-keygen -t ed25519 -C "ansible" -f ~/.ssh/id_ed25519 -N "" -q
fi

echo "[4/5] Generating environment file..."
chmod +x deployment/generate-env.sh
deployment/generate-env.sh

echo "[5/5] Finishing..."
mv -f .env docker/.env
mv -f frontend/dist docker/dist

chmod +x deployment/apply-kubectl.sh
chmod +x docker/config/generate-nginx-conf.sh

cd docker/config
./generate-nginx-conf.sh
cd ..
cd ..


echo ""
echo "IMPORTANT: Review secrets in docker/.env before deployment."
echo ""

read -rp "Spin up containers now? [y/n]: " answer

if [ "$answer" = "y" ]; then
  echo "Starting containers..."
  cd docker && docker compose up -d
  echo "Containers started."
else
  echo "Done. Run 'cd ${DIR}/docker && docker compose up -d' when ready."
fi
