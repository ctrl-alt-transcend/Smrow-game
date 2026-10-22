ENV := dev
DOCKER_COMPOSE_FILE := ./app/docker-compose.yml

ifeq ($(ENV), dev)
	DOCKER_COMPOSE_FILE = ./app/docker-compose.dev.yml
endif

SECRETS_DIR=app/secrets
ENV_DIR=app
MIGRATION_NAME ?= init

all: up

refresh: build up

build:
	docker compose -f $(DOCKER_COMPOSE_FILE) build

up: secrets
	docker compose -f $(DOCKER_COMPOSE_FILE) up -d

watch: up
	@if [ "$(ENV)" = "dev" ]; then \
		docker compose -f $(DOCKER_COMPOSE_FILE) watch; \
	else \
		echo "'Watch' command is only available in dev environment"; \
	fi

down:
	docker compose -f $(DOCKER_COMPOSE_FILE) down

lint-front:
	cd ./app/frontend && npm run lint && cd ../..

type-front:
	cd ./app/frontend && npm run type-check && cd ../..

secrets:
	@mkdir -p $(SECRETS_DIR)

	@if [ ! -s $(SECRETS_DIR)/db_password.txt ]; then \
		openssl rand -hex 32 | tr -dc 'A-Za-z0-9@%^*_+=-' | head -c 16 > "$(SECRETS_DIR)/db_password.txt"; \
	fi;

	@if [ ! -s $(SECRETS_DIR)/jwt_secret.txt ]; then \
		openssl rand -hex 32 | tr -dc 'A-Za-z0-9@%^*_+=-' | head -c 16 > "$(SECRETS_DIR)/jwt_secret.txt"; \
	fi

prepush: lint type

fclean: down
	docker compose -f $(DOCKER_COMPOSE_FILE) down --rmi all --volumes --remove-orphans

re: fclean
	docker compose -f $(DOCKER_COMPOSE_FILE) build --no-cache
	$(MAKE) up
	$(MAKE) initdb

initdb:
	docker compose -f $(DOCKER_COMPOSE_FILE) exec backend npx prisma migrate deploy

migrate:
	@cd app/backend && \
	DB_HOST=localhost \
	DB_PORT=5432 \
	DB_NAME=mydb \
	DB_USER=the_boss \
	DB_PASSWORD_FILE=../secrets/db_password.txt \
	npx prisma migrate dev --name $(MIGRATION_NAME)

.PHONY: all refresh build up down fclean re secrets migrate initdb

