DOCKER_DIR = docker
K8S_DIR = k8s
FRONTEND_IMAGE = ologami-frontend:latest
BACKEND_IMAGE = ologami-backend:latest
LOGGER_IMAGE = logger:latest

NAMESPACE_YAML = $(K8S_DIR)/1-ologami-namespace.yml
MONGODB_YAML = $(K8S_DIR)/2-ologami-mongodb.yml
BACKEND_YAML = $(K8S_DIR)/3-ologami-backend.yml
FRONTEND_YAML = $(K8S_DIR)/4-ologami-frontend.yml
INGRESS_YAML = $(K8S_DIR)/5-ologami-ingress.yml
LOGGER_YAML = $(K8S_DIR)/6-logger.yml

INSTALL_INGRESS = $(K8S_DIR)/0.1-ingress-controller-install.sh
UNINSTALL_INGRESS = $(K8S_DIR)/0.2-ingress-controller-uninstall.sh

build-ologami-frontend:
	docker build -t $(FRONTEND_IMAGE) -f $(DOCKER_DIR)/ologami-frontend.dockerfile ../ologami-frontend/ --no-cache

build-ologami-backend:
	docker build -t $(BACKEND_IMAGE) -f $(DOCKER_DIR)/ologami-backend.dockerfile ../ologami-backend/ --no-cache

build-logger:
	docker build -t $(LOGGER_IMAGE) -f $(DOCKER_DIR)/logger.dockerfile ../logger/ --no-cache

build-all: build-ologami-frontend build-ologami-backend build-logger

delete-namespace:
	kubectl delete -f $(NAMESPACE_YAML) --ignore-not-found || true

delete-mongodb:
	kubectl delete -f $(MONGODB_YAML) --ignore-not-found || true

delete-backend:
	kubectl delete -f $(BACKEND_YAML) --ignore-not-found || true

delete-frontend:
	kubectl delete -f $(FRONTEND_YAML) --ignore-not-found || true

delete-ingress:
	kubectl delete -f $(INGRESS_YAML) --ignore-not-found || true

delete-logger:
	kubectl delete -f $(LOGGER_YAML) --ignore-not-found || true

create-namespace:
	kubectl apply -f $(NAMESPACE_YAML)

create-mongodb:
	kubectl apply -f $(MONGODB_YAML)

create-backend:
	kubectl apply -f $(BACKEND_YAML)

create-frontend:
	kubectl apply -f $(FRONTEND_YAML)

create-ingress:
	kubectl wait --namespace ingress-nginx --for=condition=available --timeout=300s deployment/ingress-nginx-controller
	kubectl apply -f $(INGRESS_YAML)
	@echo "Ingress resources created successfully."

create-logger:
	kubectl apply -f $(LOGGER_YAML)
	@echo "Logger resources created successfully."

delete-ologami: delete-ingress delete-frontend delete-backend delete-mongodb delete-logger delete-namespace
delete-all: uninstall-ingress delete-ologami

create-ologami: create-namespace create-mongodb create-backend create-frontend create-ingress create-logger
create-all: install-ingress create-ologami
	@echo "All resources created successfully. Waiting for all pods to be ready..."
	# Lancio il comando kubectl get po per vedere i pod fino a quando non sono tutti ready
	@kubectl get pods -n ologami --watch &
	@kubectl get pods -n ingress-nginx --watch &
	@sleep 5 # Attendi che il watch venga inizializzato
	@while [ $$(kubectl get pods -n ologami --no-headers | grep -v 'Running' | grep -v '1/1' | wc -l) -gt 0 ] || \
	       [ $$(kubectl get pods -n ingress-nginx --no-headers | grep -v 'Running' | grep -v '1/1' | wc -l) -gt 0 ]; do \
	        sleep 5; \
	done
	@echo "All pods are ready!"
	# Il comando watch si fermerà automaticamente quando questo comando termina

recreate-%:
	kubectl delete -f $(K8S_DIR)/*$*.yml --ignore-not-found || true
	kubectl apply -f $(K8S_DIR)/*$*.yml
	@echo "$* recreated successfully."

rebuild-%: build-% recreate-% 
	@echo "$* rebuilt and redeployed successfully."

install-ingress:
	bash $(INSTALL_INGRESS)
	@echo "Ingress controller installed successfully."

uninstall-ingress:
	bash $(UNINSTALL_INGRESS) || true
	@echo "Ingress controller uninstallation attempted."

local: build-all delete-all create-all

clean:
	docker system prune -f
	kubectl delete all --all -n ologami || true

help:
	@echo "Makefile Targets:"
	@echo "  build-all          - Build all Docker images"
	@echo "  delete-all         - Delete all Kubernetes resources"
	@echo "  create-all         - Create all Kubernetes resources"
	@echo "  rebuild-backend    - Rebuild and redeploy the backend"
	@echo "  local              - Build and deploy locally"
	@echo "  clean              - Clean up Docker and Kubernetes residuals"
	@echo "  install-ingress    - Install ingress controller"
	@echo "  uninstall-ingress  - Uninstall ingress controller"
