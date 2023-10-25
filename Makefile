local: build deploy-local

build:
	docker build -t nodejs-logger nodejs-logger/ --no-cache

deploy-local:
	kubectl delete -f k8s/nodejs-logger.yaml || true
	kubectl apply -f k8s/nodejs-logger.yaml
