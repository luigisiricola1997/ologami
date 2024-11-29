#!/bin/bash

export PATH=$PATH:/c/Program\ Files/Git/bin:/C/Program\ Files/Git/bin/helm.exe

if ! helm status ingress-nginx -n ingress-nginx >/dev/null 2>&1; then
    echo "Installing ingress controller..."
    helm install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace
fi


# To update:
# echo "Ingress controller already installed, upgrading..."
# helm upgrade ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx
