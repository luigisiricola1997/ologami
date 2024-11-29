#!/bin/bash

kubectl create secret generic ologami-be-env-secret \
    --from-env-file=.env \
    --namespace=ologami
