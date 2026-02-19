.PHONY: help init start stop restart db migration fixtures db-reset cc assets fix

# Standard-Hilfe: Zeigt alle Befehle an, wenn du nur "make" tippst
help: ## Zeigt diese Hilfe an
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# --- 🚀 Projekt Start & Setup ---

init: ## Projekt initialisieren (Docker, Dependencies, DB & Fixtures)
	@echo "🐳 Starte Docker Container..."
	docker compose up -d
	@echo "⏳ Warte 10 Sekunden auf Datenbank-Initialisierung..."
	@sleep 10
	@echo "📦 Installiere PHP Dependencies..."
	composer install
	@echo "📦 Installiere JS Dependencies..."
	npm install
	@echo "🗄  Richte Datenbank ein..."
	php bin/console doctrine:database:create --if-not-exists
	php bin/console doctrine:migrations:migrate --no-interaction
	@echo "🌱 Lade Testdaten (Fixtures)..."
	php bin/console doctrine:fixtures:load --no-interaction
	@echo "✅ Setup fertig! Starte den Server mit 'make start'"

start: ## Startet Docker, Symfony Server und Asset-Watcher
	docker compose up -d
	symfony server:start -d
	npm run watch

stop: ## Stoppt alles (Symfony Server & Docker)
	symfony server:stop
	docker compose stop

restart: stop start ## Startet alles neu

# --- 🛠 Entwicklung & Datenbank ---

db: ## Führt Datenbank-Migrationen aus
	php bin/console doctrine:migrations:migrate --no-interaction

migration: ## Erstellt eine neue Migration basierend auf Änderungen an Entities
	php bin/console make:migration

fixtures: ## Lädt die Testdaten neu (Löscht alte Daten!)
	php bin/console doctrine:fixtures:load --no-interaction

db-reset: ## ⚠️ ACHTUNG: Löscht DB, migriert neu & lädt Fixtures (Alles frisch!)
	-php bin/console doctrine:database:drop --force --if-exists
	php bin/console doctrine:database:create
	php bin/console doctrine:migrations:migrate --no-interaction
	php bin/console doctrine:fixtures:load --no-interaction

# --- 🧹 Tools & Assets ---

cc: ## Cache leeren (Wichtig nach Config-Änderungen)
	php bin/console cache:clear

assets: ## Baut die Assets für Production (Minifiziert)
	npm run build

fix: ## Repariert Code-Styles (CS-Fixer)
	vendor/bin/php-cs-fixer fix
