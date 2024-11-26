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

build-%:
	docker build -t $*:latest -f $(DOCKER_DIR)/$*.dockerfile ../$*/ --no-cache

build-all: build-ologami-frontend build-ologami-backend build-logger

delete-%:
	kubectl delete -f $(K8S_DIR)/*$*.yml || true

create-%:
	kubectl apply -f $(K8S_DIR)/*$*.yml

delete-ologami: delete-ingress delete-frontend delete-backend delete-mongodb
delete-all: uninstall-ingress delete-ologami delete-namespace

create-ologami: create-namespace create-ingress create-frontend create-backend create-mongodb
create-all: install-ingress create-ologami create-logger

recreate-%:
	kubectl delete -f $(K8S_DIR)/*$*.yml || true
	kubectl apply -f $(K8S_DIR)/*$*.yml
	@echo "$* recreated successfully."

recreate-ologami-backend:
	kubectl delete -f $(BACKEND_YAML) || true
	kubectl apply -f $(BACKEND_YAML)
	@echo "Backend recreated successfully."

rebuild-%: build-% recreate-%
	@echo "$* rebuilt and redeployed successfully."

install-ingress:
	bash $(INSTALL_INGRESS)
	@echo "Ingress controller installed successfully."

uninstall-ingress:
	bash $(UNINSTALL_INGRESS)
	@echo "Ingress controller uninstalled successfully."

local: build-all delete-all create-all

clean:
	docker system prune -f
	kubectl delete all --all -n ologami || true

help:
	@echo "Makefile Targets:"
	@echo "  build-all          - Build all Docker images"
	@echo "  delete-all         - Delete all Kubernetes resources"
	@echo "  create-all         - Create all Kubernetes resources"
	@echo "  recreate-all       - Recreate all Kubernetes resources"
	@echo "  rebuild-backend    - Rebuild and redeploy the backend"
	@echo "  local              - Build and deploy locally"
	@echo "  clean              - Clean up Docker and Kubernetes residuals"
	@echo "  install-ingress    - Install ingress controller"
	@echo "  uninstall-ingress  - Uninstall ingress controller"
