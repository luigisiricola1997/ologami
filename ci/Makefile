build-logger:
	docker build -t logger:latest -f docker/logger.dockerfile ../logger/ --no-cache
build-ologami-frontend:
	docker build -t ologami-frontend:latest -f docker/ologami-frontend.dockerfile ../ologami-frontend/ --no-cache
build-ologami-backend:
	docker build -t ologami-backend:latest -f docker/ologami-backend.dockerfile ../ologami-backend/ --no-cache
build-ologami:build-ologami-frontend build-ologami-backend
build-all: build-logger build-ologami-frontend build-ologami-backend

delete-namespace:
	kubectl delete -f k8s/ologami-namespace.yml || true
delete-ologami-ingress:
	kubectl delete -f k8s/ologami-ingress.yml || true
delete-logger:
	kubectl delete -f k8s/logger.yml || true
delete-ologami-frontend:
	kubectl delete -f k8s/ologami-frontend.yml || true
delete-ologami-backend:
	kubectl delete -f k8s/ologami-backend.yml || true
delete-ologami: delete-ologami-ingress delete-ologami-frontend delete-ologami-backend
delete-mongodb:
	kubectl delete -f k8s/mongodb.yml || true
delete-all: delete-namespace

create-namespace:
	kubectl apply -f k8s/ologami-namespace.yml
create-ologami-ingress:
	kubectl apply -f k8s/ologami-ingress.yml
create-logger:
	kubectl apply -f k8s/logger.yml
create-ologami-frontend:
	kubectl apply -f k8s/ologami-frontend.yml
create-ologami-backend:
	kubectl apply -f k8s/ologami-backend.yml
create-ologami: create-ologami-ingress create-ologami-frontend create-ologami-backend
create-mongodb:
	kubectl apply -f k8s/mongodb.yml
create-all: create-namespace create-logger create-ologami-ingress create-ologami-frontend create-ologami-backend create-mongodb

recreate-namespace: delete-namespace create-namespace
recreate-ologami-ingress: delete-ologami-ingress create-ologami-ingress
recreate-logger: build-logger delete-logger create-logger
recreate-ologami-frontend: build-ologami-frontend delete-ologami-frontend create-ologami-frontend
recreate-ologami-backend: build-ologami-backend delete-ologami-backend create-ologami-backend
recreate-ologami: recreate-ologami-frontend recreate-ologami-backend
recreate-mongodb: delete-mongodb create-mongodb
recreate-all: recreate-namespace recreate-logger recreate-ologami-ingress recreate-ologami-frontend recreate-ologami-backend recreate-mongodb

local: build-all delete-all create-all
