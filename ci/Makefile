DOCKER_DIR = docker
K8S_DIR = k8s
LOGGER_IMAGE = logger:latest
OLOGAMI_BE_IMAGE = ologami-be:latest
OLOGAMI_FE_IMAGE = ologami-fe:latest

CREATE_INGRESS_CONTROLLER = $(K8S_DIR)/0.1-create-ingress-controller.sh
DELETE_INGRESS_CONTROLLER = $(K8S_DIR)/0.2-delete-ingress-controller.sh
CREATE_OLOGAMI_BE_ENV_SECRET = $(K8S_DIR)/0.3-create-ologami-be-env-secret.sh
DELETE_OLOGAMI_BE_ENV_SECRET = $(K8S_DIR)/0.4-delete-ologami-be-env-secret.sh
OLOGAMI_NAMESPACE_YAML = $(K8S_DIR)/1-ologami-namespace.yml
OLOGAMI_MONGODB_YAML = $(K8S_DIR)/2-ologami-mongodb.yml
OLOGAMI_BE_YAML = $(K8S_DIR)/3-ologami-be.yml
OLOGAMI_FE_YAML = $(K8S_DIR)/4-ologami-fe.yml
LOGGER_YAML = $(K8S_DIR)/5-logger.yml
OLOGAMI_INGRESS_YAML = $(K8S_DIR)/6-ologami-ingress.yml

build-ologami-fe:
	docker build -t $(OLOGAMI_FE_IMAGE) -f $(DOCKER_DIR)/ologami-fe.dockerfile ../ologami-fe/ --no-cache

build-ologami-be:
	docker build -t $(OLOGAMI_BE_IMAGE) -f $(DOCKER_DIR)/ologami-be.dockerfile ../ologami-be/ --no-cache

build-logger:
	docker build -t $(LOGGER_IMAGE) -f $(DOCKER_DIR)/logger.dockerfile ../logger/ --no-cache

build-all: build-ologami-fe build-ologami-be build-logger

create-ingress-controller:
	bash $(CREATE_INGRESS_CONTROLLER)

create-ologami-be-env-secret:
	bash $(CREATE_OLOGAMI_BE_ENV_SECRET)

create-ologami-namespace:
	kubectl apply -f $(OLOGAMI_NAMESPACE_YAML)

create-ologami-mongodb:
	kubectl apply -f $(OLOGAMI_MONGODB_YAML)

create-ologami-be:
	kubectl apply -f $(OLOGAMI_BE_YAML)

create-ologami-fe:
	kubectl apply -f $(OLOGAMI_FE_YAML)

create-logger:
	kubectl apply -f $(LOGGER_YAML)

create-ologami-ingress:
	kubectl wait --namespace ingress-nginx --for=condition=available --timeout=300s deployment/ingress-nginx-controller
	kubectl apply -f $(OLOGAMI_INGRESS_YAML)

delete-ingress-controller:
	bash $(DELETE_INGRESS_CONTROLLER)

delete-ologami-be-env-secret:
	./$(DELETE_OLOGAMI_BE_ENV_SECRET) || true

delete-ologami-namespace:
	kubectl delete -f $(OLOGAMI_NAMESPACE_YAML) --ignore-not-found || true

delete-ologami-mongodb:
	kubectl delete -f $(OLOGAMI_MONGODB_YAML) --ignore-not-found || true

delete-ologami-be:
	kubectl delete -f $(OLOGAMI_BE_YAML) --ignore-not-found || true

delete-ologami-fe:
	kubectl delete -f $(OLOGAMI_FE_YAML) --ignore-not-found || true

delete-logger:
	kubectl delete -f $(LOGGER_YAML) --ignore-not-found || true

delete-ologami-ingress:
	kubectl delete -f $(OLOGAMI_INGRESS_YAML) --ignore-not-found || true

delete-ologami: delete-ologami-ingress delete-ologami-be delete-ologami-fe delete-ologami-mongodb delete-ologami-be-env-secret
delete-all: delete-ingress-controller delete-logger delete-ologami

create-ologami: create-ologami-namespace create-ologami-ingress create-ologami-be create-ologami-fe create-ologami-mongodb create-ologami-be-env-secret
create-all: create-ingress-controller create-ologami create-logger
	@echo "All resources created successfully. Waiting for all pods to be ready..."
	# Lancio il comando kubectl get po per vedere i pod fino a quando non sono tutti ready
	@kubectl get pods -n ologami --watch &
	@kubectl get pods -n ingress-nginx --watch &
	@sleep 5 # Wait for the watch to initialize
	@while [ $$(kubectl get pods -n ologami --no-headers | grep -v 'Running' | grep -v '1/1' | wc -l) -gt 0 ] || \
	       [ $$(kubectl get pods -n ingress-nginx --no-headers | grep -v 'Running' | grep -v '1/1' | wc -l) -gt 0 ]; do \
	       sleep 5; \
	done
	@echo "All pods are ready!"

recreate-%:
	kubectl delete -f $(K8S_DIR)/*$*.yml --ignore-not-found || true
	kubectl apply -f $(K8S_DIR)/*$*.yml

rebuild-%: build-% recreate-% 

local: build-all create-all

clean:
	kubectl delete all --all -n ologami || true
	docker system prune -f
