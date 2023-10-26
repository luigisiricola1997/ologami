# ologami

AI-based predictive log analytics.

<img src="./.github/assets/logo.png" alt="Logo" width="200"/>

# How to run locally on Windows 11

* Install Docker Desktop and enable Kubernetes.
* Download the repository locally using git.
* Run: `make local` to build and create k8s resources
* Navigate to [http://localhost]() and try to request a page, like `/test` to see the error log.
* That error log will be sent to ChatGPT 4 into a prompt to receive the log analysis.
