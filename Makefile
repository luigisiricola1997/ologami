build:
	docker build -t nodejs-logger nodejs-logger/ --no-cache
	docker build -t ologami ologami/ --no-cache

delete:
	kubectl delete -f k8s/nodejs-logger.yaml || true
	kubectl delete -f k8s/ologami.yaml || true

create: 
	kubectl apply -f k8s/nodejs-logger.yaml
	kubectl apply -f k8s/ologami.yaml

local: build delete create
