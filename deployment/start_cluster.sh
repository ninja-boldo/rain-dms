#!/bin/bash

cd k3s
echo starting k3s configs ...
kubectl apply -f scaler.yaml
kubectl apply -f scaler-sync.yaml
kubectl apply -f egress-controller.yaml

echo Cluster should be up in a few moments ...