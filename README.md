# ologami

AI-based predictive log analytics.

<img src="./.github/assets/logo.png" alt="Logo" width="200"/>

# How to run locally on Windows 11

* Install Docker Desktop and enable Kubernetes.
* Download the repository locally using git.
* Build the image: `docker build -t nodejs-logger nodejs-logger/ --no-cache`.
* Create k8s resources: `kubectl apply -f k8s/nodejs-logger.yaml`.
* Navigate to [http://localhost]() and try to request a page, like `/test` to see the error log.
* That error log will be sent to ChatGPT 4 into a prompt to receive the log analysis.
