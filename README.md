# ologami

AI-based predictive log analytics.

<img src="./.github/assets/logo.png" alt="Logo" width="200"/>

## Description

Ologami is an AI-based predictive log analytics tool that helps you analyze and predict issues in your application logs.
It leverages machine learning models to provide insights and recommendations based on your log data.

## Installation

### Prerequisites

To run the project locally, you can simply use Docker Desktop + Kubernetes

### Steps

1. Clone the repository:
    ```sh
    git clone https://github.com/luigisiricola1997/ologami.git
    cd ologami
    ```
2. Build Docker images and deploy to Kubernetes:
    ```sh
    cd ci
    make create-all
    ```
3. Open your browser and navigate to `http://localhost/logger` to see the Ologami Logger interface.

4. Use the provided buttons to analyze logs using AI models.

## License

This project is licensed under the terms of the [GNU General Public License v3.0](LICENSE).
