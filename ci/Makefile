build-ologami-frontend:
	docker build -t ologami-frontend:latest -f docker/ologami-frontend.dockerfile ../ologami-frontend/ --no-cache
build-ologami-backend:
	docker build -t ologami-backend:latest -f docker/ologami-backend.dockerfile ../ologami-backend/ --no-cache
build-ologami:build-ologami-frontend build-ologami-backend
build-logger:
	docker build -t logger:latest -f docker/logger.dockerfile ../logger/ --no-cache
build-all: build-ologami build-logger

delete-ologami-namespace:
	kubectl delete -f k8s/ologami-namespace.yml || true
delete-ologami-ingress:
	kubectl delete -f k8s/ologami-ingress.yml || true
delete-ologami-frontend:
	kubectl delete -f k8s/ologami-frontend.yml || true
delete-ologami-backend:
	kubectl delete -f k8s/ologami-backend.yml || true
delete-ologami-mongodb:
	kubectl delete -f k8s/ologami-mongodb.yml || true
delete-ologami: delete-ologami-ingress delete-ologami-frontend delete-ologami-backend delete-ologami-mongodb
delete-logger:
	kubectl delete -f k8s/logger.yml || true
delete-all: delete-ologami-namespace

create-ologami-namespace:
	kubectl apply -f k8s/ologami-namespace.yml
create-ologami-ingress:
	kubectl apply -f k8s/ologami-ingress.yml
create-ologami-frontend:
	kubectl apply -f k8s/ologami-frontend.yml
create-ologami-backend:
	kubectl apply -f k8s/ologami-backend.yml
create-ologami-mongodb:
	kubectl apply -f k8s/ologami-mongodb.yml
create-ologami: create-ologami-namespace create-ologami-ingress create-ologami-frontend create-ologami-backend create-ologami-mongodb
create-logger:
	kubectl apply -f k8s/logger.yml
create-all: create-ologami create-logger

recreate-ologami-namespace: delete-ologami-namespace create-ologami-namespace
recreate-ologami-ingress: delete-ologami-ingress create-ologami-ingress
recreate-ologami-frontend: build-ologami-frontend delete-ologami-frontend create-ologami-frontend
recreate-ologami-backend: build-ologami-backend delete-ologami-backend create-ologami-backend
recreate-ologami-mongodb: delete-ologami-mongodb create-ologami-mongodb
recreate-ologami: recreate-ologami-ingress recreate-ologami-frontend recreate-ologami-backend recreate-ologami-mongodb
recreate-logger: build-logger delete-logger create-logger
recreate-all: recreate-ologami recreate-logger

local: build-all delete-all create-all
