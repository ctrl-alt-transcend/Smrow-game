ENV := prod
DOCKER_COMPOSE_FILE := ./app/docker-compose.yml

ifeq ($(ENV), dev)
	DOCKER_COMPOSE_FILE = ./app/docker-compose.dev.yml
endif

all: up

refresh: build up

build:
	docker compose -f $(DOCKER_COMPOSE_FILE) build

up:
	docker compose -f $(DOCKER_COMPOSE_FILE) up -d

watch: up
	@if [ "$(ENV)" = "dev" ]; then \
		docker compose -f $(DOCKER_COMPOSE_FILE) watch; \
	else \
		echo "'Watch' command is only available in dev environment"; \
	fi

down:
	docker compose -f $(DOCKER_COMPOSE_FILE) down

fclean: down
	docker compose -f $(DOCKER_COMPOSE_FILE) down --rmi all --volumes --remove-orphans

re: fclean
	docker compose -f $(DOCKER_COMPOSE_FILE) build --no-cache
	$(MAKE) up

.PHONY: all refresh build up down fclean re

