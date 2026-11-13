ENV := dev
DOCKER_COMPOSE_FILE := ./app/docker-compose.yml

ifeq ($(ENV), dev)
	DOCKER_COMPOSE_FILE = ./app/docker-compose.dev.yml
endif

SECRETS_DIR=app/secrets
ENV_DIR=app
MIGRATION_NAME ?= init
FRONTEND_DIR=./app/frontend
BACKEND_DIR=./app/backend
SHARED_DIR=./app/shared
APP_DIR=./app

all: up

refresh: build up

pull:
	git pull --ff-only
	$(MAKE) install
	$(MAKE) check

build:
	docker compose -f $(DOCKER_COMPOSE_FILE) build

up: install secrets shared
	docker compose -f $(DOCKER_COMPOSE_FILE) up -d

watch: up
	@if [ "$(ENV)" = "dev" ]; then \
		docker compose -f $(DOCKER_COMPOSE_FILE) watch; \
	else \
		echo "'Watch' command is only available in dev environment"; \
	fi

# Build shared for dev
shared:
	cd $(APP_DIR) && npm run build:shared

down:
	docker compose -f $(DOCKER_COMPOSE_FILE) down

install: $(APP_DIR)/node_modules/.package-lock.json

$(APP_DIR)/node_modules/.package-lock.json: $(APP_DIR)/package.json $(APP_DIR)/package-lock.json
	@echo "Installing frontend packages..."
	cd $(APP_DIR) && npm ci

check: check-back check-front

check-back: install
	@echo "checking format"
	cd $(BACKEND_DIR) && npx prisma generate
	cd $(BACKEND_DIR) && npm run build
	cd $(BACKEND_DIR) && npm run lint

check-front: install
	@echo "checking format"
	cd $(FRONTEND_DIR) && npm run build
	cd $(FRONTEND_DIR) && npm run lint

lint-front:
	cd $(FRONTEND_DIR) && npm run lint && cd ../..
lint-back:
	cd $(BACKEND_DIR) && npm run lint && cd ../..

type-front:
	cd $(FRONTEND_DIR) && npm run type-check && cd ../..

secrets:
	@mkdir -p $(SECRETS_DIR)

	@if [ ! -s $(SECRETS_DIR)/db_password.txt ]; then \
		openssl rand -hex 32 | tr -dc 'A-Za-z0-9@%^*_+=-' | head -c 16 > "$(SECRETS_DIR)/db_password.txt"; \
	fi;

	@if [ ! -s $(SECRETS_DIR)/jwt_secret.txt ]; then \
		openssl rand -hex 32 | tr -dc 'A-Za-z0-9@%^*_+=-' | head -c 16 > "$(SECRETS_DIR)/jwt_secret.txt"; \
	fi

fclean: down
	docker compose -f $(DOCKER_COMPOSE_FILE) down --rmi all --volumes --remove-orphans

re: fclean
	docker compose -f $(DOCKER_COMPOSE_FILE) build --no-cache
	$(MAKE) up
	$(MAKE) initdb

initdb:
	docker compose -f $(DOCKER_COMPOSE_FILE) exec backend npx prisma migrate deploy

# how to use: make migrate MIGRATION_NAME="Your_migration_name_between_double_quotes"
migrate:
	@cd app/backend && \
	DB_HOST=localhost \
	DB_PORT=5432 \
	DB_NAME=mydb \
	DB_USER=the_boss \
	DB_PASSWORD_FILE=../secrets/db_password.txt \
	npx prisma migrate dev --name $(MIGRATION_NAME)

.PHONY: all refresh build up down fclean re secrets migrate initdb install check

