build-logger:
	docker build -t logger:latest -f docker/logger.dockerfile ../logger/ --no-cache
build-ologami-frontend:
	docker build -t ologami-frontend:latest -f docker/ologami-frontend.dockerfile ../ologami-frontend/ --no-cache
build-ologami-backend:
	docker build -t ologami-backend:latest -f docker/ologami-backend.dockerfile ../ologami-backend/ --no-cache
build-all: build-logger build-ologami-frontend build-ologami-backend

delete-namespace:
	kubectl delete -f k8s/ologami-namespace.yml || true
delete-logger:
	kubectl delete -f k8s/logger.yml || true
delete-ologami-frontend:
	kubectl delete -f k8s/ologami-frontend.yml || true
delete-ologami-backend:
	kubectl delete -f k8s/ologami-backend.yml || true
delete-mongodb:
	kubectl delete -f k8s/mongodb.yml || true
delete-all: delete-namespace

create-namespace:
	kubectl apply -f k8s/ologami-namespace.yml
create-logger:
	kubectl apply -f k8s/logger.yml
create-ologami-frontend:
	kubectl apply -f k8s/ologami-frontend.yml
create-ologami-backend:
	kubectl apply -f k8s/ologami-backend.yml
create-mongodb:
	kubectl apply -f k8s/mongodb.yml
create-all: create-namespace create-logger create-ologami-frontend create-ologami-backend create-mongodb

recreate-namespace: delete-namespace create-namespace
recreate-logger: build-logger delete-logger create-logger
recreate-ologami-frontend: build-ologami-frontend delete-ologami-frontend create-ologami-frontend
recreate-ologami-backend: build-ologami-backend delete-ologami-backend create-ologami-backend
recreate-mongodb: delete-mongodb create-mongodb
recreate-all: recreate-namespace recreate-logger recreate-ologami-frontend recreate-ologami-backend recreate-mongodb

local: build-all delete-all create-all
