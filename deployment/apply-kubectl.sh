#!/bin/bash
set -euo pipefail

read -rp "did you configure your hosts.ini file(should be in the deployment folder)? [y/n]: " answer

if [ "$answer" != "y" ]; then
  echo "Please first configure your hosts.ini file cause this is needed for ansible"
  exit 1
fi

sudo apt update
sudo apt install iptables -y

cd deployment
echo "Starting ansible playbook..."
ansible-playbook -i hosts.ini k3s-playbook.yml
echo "Finished playbook"

if [ -f /etc/rancher/k3s/k3s.yaml ]; then
  mkdir -p ~/.kube
  sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
  sudo chown "$USER:$USER" ~/.kube/config
else
  echo "Warning: k3s kubeconfig not found, skipping kubectl config setup"
fi

cd ../docker/certs
chmod +x update_kubectl_secrets.sh
./update_kubectl_secrets.sh

cd ../../deployment
chmod +x start_cluster.sh
./start_cluster.sh
