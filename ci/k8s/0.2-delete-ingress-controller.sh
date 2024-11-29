#!/bin/bash

export PATH=$PATH:/c/Program\ Files/Git/bin:/C/Program\ Files/Git/bin/helm.exe
if helm list -n ingress-nginx | grep ingress-nginx; then
    helm uninstall ingress-nginx -n ingress-nginx
    echo "Ingress controller uninstalled successfully."
else
    echo "Ingress controller not found. Skipping uninstallation."
fi
