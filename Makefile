build-nodejs-logger:
	docker build -t nodejs-logger nodejs-logger/ --no-cache

build-ologami:
	docker build -t ologami ologami/ --no-cache

build-all: build-nodejs-logger build-ologami

delete-nodejs-logger:
	kubectl delete -f k8s/nodejs-logger.yaml || true

delete-ologami:
	kubectl delete -f k8s/ologami.yaml || true

delete-mongodb:
	kubectl delete -f k8s/mongodb.yaml || true

delete-all: delete-nodejs-logger delete-ologami delete-mongodb

create-nodejs-logger: 
	kubectl apply -f k8s/nodejs-logger.yaml

create-ologami:
	kubectl apply -f k8s/ologami.yaml

create-mongodb:
	kubectl apply -f k8s/mongodb.yaml

create-all: create-nodejs-logger create-ologami create-mongodb

recreate-nodejs-logger: build-nodejs-logger delete-nodejs-logger create-nodejs-logger
recreate-ologami: build-ologami delete-ologami create-ologami
recreate-mongodb: delete-mongodb create-mongodb

local: build-all delete-all create-all
