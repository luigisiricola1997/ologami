build-logger:
	docker build -t logger:latest -f docker/logger.dockerfile ../logger/ --no-cache
build-ologami:
	docker build -t ologami:latest -f docker/ologami.dockerfile ../ologami/ --no-cache
build-all: build-logger build-ologami

delete-logger:
	kubectl delete -f k8s/logger.yaml || true
delete-ologami:
	kubectl delete -f k8s/ologami.yaml || true
delete-mongodb:
	kubectl delete -f k8s/mongodb.yaml || true
delete-all: delete-logger delete-ologami delete-mongodb

create-logger: 
	kubectl apply -f k8s/logger.yaml
create-ologami:
	kubectl apply -f k8s/ologami.yaml
create-mongodb:
	kubectl apply -f k8s/mongodb.yaml
create-all: create-logger create-ologami create-mongodb

recreate-logger: build-logger delete-logger create-logger
recreate-ologami: build-ologami delete-ologami create-ologami
recreate-mongodb: delete-mongodb create-mongodb
recreate-all: recreate-logger recreate-ologami recreate-mongodb

local: build-all delete-all create-all
