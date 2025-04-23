#!/bin/bash

kubectl create secret generic ologami-be-env-secret \
    --from-env-file=ci/.env \
    --namespace=ologami
