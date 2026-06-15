#!/bin/bash

cd k3s
echo starting k3s configs ...
kubectl apply -f scaler.yaml
kubectl apply -f scaler-sync.yaml
kubectl apply -f kyverno.yaml
kubectl apply -f default-deny-egress.yaml
kubectl apply -f allow-specific-egress.yaml

echo Cluster should be up in a few moments ...