# Ingress Controller Nginx
export PATH=$PATH:/c/Program\ Files/Git/bin
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-nginx/ingress-nginx

# OPENAI_AP_KEY Secret
kubectl create secret generic ologami-backend-secret --from-literal=OPENAI_API_KEY=your-openai-key --namespace=ologami
