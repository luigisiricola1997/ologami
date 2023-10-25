local: build deploy-local

build:
	docker build -t nodejs-logger nodejs-logger/ --no-cache
	docker build -t ologami-backend ologami/backend/ --no-cache

deploy-local:
	kubectl delete -f k8s/nodejs-logger.yaml || true
	kubectl delete -f k8s/ologami-backend.yaml || true
	kubectl apply -f k8s/nodejs-logger.yaml
	kubectl apply -f k8s/ologami-backend.yaml
