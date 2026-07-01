#!/bin/bash
set -euo pipefail

SECRET_NAME="custom-root-ca"
ENV_SECRET_NAME="rain-dms-env"
APP_SECRET_NAME="app-env"
NAMESPACE="default"
CERT_NAME="external-server-cert"
CERT_FILE="rain.dms.cert.pem"
KEY_FILE="rain.dms.cert-key.pem"
ROOT_CA_FILE="./rootCA.pem"
ENV_FILE="../.env"

RABBITMQ_CERT_NAME="rabbitmq-cert"
RABBITMQ_CERT_FILE="${RABBITMQ_CERT_NAME}.pem"
RABBITMQ_KEY_FILE="${RABBITMQ_CERT_NAME}-key.pem"


set -a
source "$ENV_FILE"
set +a

kubectl get nodes

echo "Recreating Kubernetes secrets..."

kubectl create secret tls "$CERT_NAME" \
  --cert="$CERT_FILE" \
  --key="$KEY_FILE" \
  -n "$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

TMP_ENV=$(mktemp)
trap 'rm -f "$TMP_ENV"' EXIT

cat > "$TMP_ENV" <<EOF
AMQP_URL=amqps://${RABBITMQ_USER}:${RABBITMQ_PASS}@${SERVER_IP}:5671
RABBITMQ_MANAGEMENT_URL=https://${SERVER_IP}:15671
S3_ENDPOINT=https://${SERVER_IP}:7443/s3
NGINX_PORT=7443
SERVER_IP=${SERVER_IP}
SERVER_IDENT_HEX_STRING=${SERVER_IDENT_HEX_STRING}
MAIN_ENCRYPTION_KEY=${MAIN_ENCRYPTION_KEY}
S3_ACCESS_KEY=${ACCESS_KEY_S3}
S3_SECRET_KEY=${SECRET_KEY_S3}
CLUSTER_WORKER_SECRET=${CLUSTER_WORKER_SECRET}
EOF

kubectl create secret generic "$ENV_SECRET_NAME" \
  --from-env-file="$TMP_ENV" \
  -n "$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret generic "$APP_SECRET_NAME" \
  --from-literal=AMQP_URL="amqps://${RABBITMQ_USER}:${RABBITMQ_PASS}@${SERVER_IP}:5671" \
  -n "$NAMESPACE" \
  --dry-run=client -o yaml | kubectl apply -f -

  # --- Create the CA secret for keda
kubectl create secret generic keda-custom-ca \
  --from-file=ca.crt="$ROOT_CA_FILE" \
  --from-file=tls.crt="$RABBITMQ_CERT_FILE" \
  --from-file=tls.key="$RABBITMQ_KEY_FILE" \
  -n default \
  --dry-run=client -o yaml | kubectl apply -f -



echo "✓ Kubernetes secrets updated"