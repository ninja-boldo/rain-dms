#!/bin/bash
set -euo pipefail


# all the users for the ansible pcs should be in the sudoers file
# if this isnt the case you can accomplish this with:
# su -
# usermod -aG sudo <username_to_add>

read -rp "did you configure your hosts.ini file(should be in the deployment folder)? [y/n]: " answer

if [ "$answer" != "y" ]; then
  echo "Please first configure your hosts.ini file cause this is needed for ansible"
  exit 1
fi

sudo apt update
sudo apt install iptables -y

curl -sfL https://get.k3s.io | sh - # install k3s-server if not yet happened

# set config explicitly as this wasnt done automatic 
# last time i tried (10.7.26)
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown -R "$USER:$USER" ~/.kube
chmod 600 ~/.kube/config



cd docker/certs
chmod +x update_kubectl_secrets.sh
./update_kubectl_secrets.sh

cd ../../deployment
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
