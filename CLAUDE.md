# CLAUDE.md — FoolDog Project Guide

This file provides AI assistants with the context needed to work effectively in the FoolDog codebase.

---

## Project Overview

**FoolDog** is a Luxembourgish dog joke carousel web application. It serves and displays jokes (with emojis) from a MySQL database through a Symfony 8 backend and a minimal Stimulus.js frontend with a glassmorphism design, dark mode support, and flip-card animations.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | PHP 8.4, Symfony 8.0 |
| ORM | Doctrine ORM 3.x |
| Templating | Twig |
| Frontend JS | Stimulus.js (Hotwire) |
| CSS | Custom CSS3 with variables (glassmorphism) |
| Asset Build | Webpack Encore |
| Database | MySQL 8.0 (Docker) |
| Testing | PHPUnit 13.0 |

---

## Directory Structure

```
FoolDog/
├── assets/
│   ├── controllers/           # Stimulus.js controllers
│   │   ├── joke_controller.js      # Carousel flip logic
│   │   ├── theme_controller.js     # Dark/light mode toggle
│   │   ├── csrf_protection_controller.js
│   │   └── hello_controller.js     # Demo (can be removed)
│   ├── styles/
│   │   └── app.css            # All CSS (glassmorphism, variables, dark mode)
│   ├── app.js                 # Frontend entry point
│   └── stimulus_bootstrap.js  # Stimulus controller loader
├── config/
│   ├── packages/              # Symfony package config (doctrine, twig, etc.)
│   ├── routes/                # Route definitions
│   ├── bundles.php            # Registered Symfony bundles
│   └── services.yaml          # Service container config
├── migrations/                # Doctrine database migrations
├── public/
│   └── index.php              # Web server entry point (do not modify)
├── src/
│   ├── Controller/
│   │   └── JokeController.php # All application routes
│   ├── DataFixtures/
│   │   └── AppFixtures.php    # Seed data (10 Luxembourgish jokes)
│   ├── Entity/
│   │   └── Joke.php           # Joke ORM entity
│   └── Repository/
│       └── JokeRepository.php # Custom DB queries
├── templates/
│   ├── base.html.twig         # Base layout
│   └── joke/
│       └── index.html.twig    # Main joke carousel page
├── tests/
│   └── bootstrap.php          # PHPUnit bootstrap
├── .editorconfig
├── .env                       # Environment variables
├── compose.yaml               # Docker Compose (MySQL service)
├── compose.override.yaml      # Docker overrides
├── Makefile                   # All common dev commands
├── composer.json              # PHP dependencies
├── package.json               # Node dependencies
├── webpack.config.js          # Webpack Encore config
└── phpunit.dist.xml           # PHPUnit configuration
```

---

## Development Workflow

### Initial Setup

```bash
make init       # Full project init: Docker + deps + DB + fixtures
```

This runs: Docker up → composer install → npm install → migrations → fixtures.

### Daily Development

```bash
make start      # Start Docker, Symfony dev server, and asset watcher
make stop       # Stop Symfony server and Docker
make restart    # Equivalent to stop + start
```

The Symfony server runs at `http://127.0.0.1:8000` by default.

### Database Operations

```bash
make db         # Run pending migrations
make migration  # Generate a new migration from entity changes
make fixtures   # Reload fixtures (DESTRUCTIVE — clears existing data)
make db-reset   # Full reset: drop + migrate + fixtures
```

### Asset Build

```bash
# Development (with watcher — used by `make start`)
npm run watch

# Production build
make assets     # runs: npm run build
```

### Code Style

```bash
make fix        # Run PHP CS Fixer (vendor/bin/php-cs-fixer fix)
```

### Cache

```bash
make cc         # php bin/console cache:clear
```

---

## Running Tests

```bash
php bin/phpunit
```

- Config: `phpunit.dist.xml`
- Bootstrap: `tests/bootstrap.php` (loads `.env.test`)
- Environment: `APP_ENV=test`
- PHPUnit is strict: fails on deprecations, notices, and warnings.
- No tests exist yet — add them in `tests/`.

---

## API Endpoints

All routes are defined in `src/Controller/JokeController.php`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Home page — renders a random joke in the carousel |
| `GET` | `/api/joke/random` | Returns a single random joke as JSON |
| `GET` | `/api/joke/ai` | Returns a procedurally generated AI-style joke as JSON |
| `POST` | `/api/joke/submit` | Accepts a user-submitted joke (JSON body) |
| `GET` | `/api/jokes` | Returns all jokes with their emojis as JSON |

### JSON Response Shape (random joke)

```json
{
  "id": 1,
  "content": "Firwat huet de Grousspapp säi Kaz 'Jägermeeschter' genanont? ...",
  "emoji": "🐾",
  "author": "Seed Data",
  "createdAt": "2026-02-20T10:00:00+00:00"
}
```

---

## Database Schema

### `joke` table

| Column | Type | Notes |
|--------|------|-------|
| `id` | INT AUTO_INCREMENT | Primary key |
| `content` | LONGTEXT | Joke text (required) |
| `emoji` | VARCHAR(10) | Optional emoji character |
| `author` | VARCHAR(100) | Submitter name (nullable) |
| `created_at` | DATETIME IMMUTABLE | Auto-set on creation |

Migrations are in `migrations/`. Always run `make migration` after changing entities, then `make db` to apply.

---

## Key Code Conventions

### PHP / Symfony

- **PHP 8.4+** — use modern PHP features (readonly properties, constructor promotion, named arguments).
- **Symfony 8.0** — follow Symfony best practices (service injection via constructor, no service locator).
- Entities go in `src/Entity/`, repositories in `src/Repository/`.
- All routes are attribute-based (`#[Route(...)]`) in controllers.
- Use `JokeRepository::findRandom()` for random joke queries — it uses an efficient offset-based strategy, not `ORDER BY RAND()`.
- Data fixtures use `AppFixtures` with `DoctrineFixturesBundle`. Run with `make fixtures`.

### JavaScript / Stimulus

- All interactivity is handled by **Stimulus controllers** in `assets/controllers/`.
- Controllers are auto-registered via `assets/stimulus_bootstrap.js`.
- Keep controllers small and focused. The `joke_controller.js` handles the flip animation (400ms CSS transition) and carousel navigation.
- Dark mode preference is stored in `localStorage` under the key `fooldog-theme`.
- Do **not** introduce heavy JS frameworks (React, Vue, etc.). Stimulus + CSS is the chosen approach.

### CSS

- All styles live in `assets/styles/app.css`.
- Theming uses CSS custom properties (variables) defined on `:root` and `[data-theme="dark"]`.
- Glassmorphism effects: `backdrop-filter: blur()`, semi-transparent backgrounds.
- Mobile-first responsive design.
- No CSS preprocessors (no Sass/LESS). Plain CSS only.

### Twig Templates

- `base.html.twig` defines the page shell with Webpack Encore asset tags.
- Stimulus controller bindings use `data-controller`, `data-action`, and `data-*-target` HTML attributes.
- Use `{{ encore_entry_link_tags('app') }}` and `{{ encore_entry_script_tags('app') }}` — do not link assets manually.

### EditorConfig (enforced)

- Encoding: UTF-8
- Line endings: LF
- Indentation: 4 spaces (YAML files: 2 spaces)
- Final newline: required
- Trailing whitespace: trimmed (except Markdown)

---

## Docker

MySQL 8.0 runs in Docker. The connection is configured via `DATABASE_URL` in `.env`.

```bash
docker compose up -d    # Start DB
docker compose down     # Stop DB
```

Default DB credentials:
- Database: `fool_dog`
- User: `root`
- Password: `root`
- Port: `3306`

---

## Environment Variables

Configured in `.env` (base) with overrides in `.env.dev` and `.env.test`:

| Variable | Purpose |
|----------|---------|
| `APP_ENV` | `dev` / `test` / `prod` |
| `APP_SECRET` | Framework secret key |
| `DATABASE_URL` | MySQL DSN |
| `MESSENGER_TRANSPORT_DSN` | Async message queue transport |

---

## Adding a New Feature — Checklist

1. **New entity field** → Edit `src/Entity/Joke.php` → run `make migration` → run `make db`
2. **New route** → Add `#[Route]` method to `src/Controller/JokeController.php`
3. **New frontend behavior** → Create a Stimulus controller in `assets/controllers/`; it auto-registers
4. **New seed data** → Edit `src/DataFixtures/AppFixtures.php` → run `make fixtures`
5. **New test** → Add a PHPUnit test class in `tests/` → run `php bin/phpunit`

---

## Makefile Reference

| Command | Description |
|---------|-------------|
| `make init` | Full project initialization |
| `make start` | Start Docker + Symfony server + asset watcher |
| `make stop` | Stop Symfony server + Docker |
| `make restart` | Stop then start |
| `make db` | Run migrations |
| `make migration` | Generate migration from entity diff |
| `make fixtures` | Reload fixtures (destructive) |
| `make db-reset` | Full DB reset |
| `make cc` | Clear Symfony cache |
| `make assets` | Production asset build |
| `make fix` | Run PHP CS Fixer |

---

## Project Version History

| Version | Date | Summary |
|---------|------|---------|
| v0.5.0 | 2026-02-21 | UserJot feedback button added alongside GitHub link |
| v0.4.0 | 2026-02-20 | Jokes moved from JS to MySQL; emoji column added |
| v0.3.0 | 2026-02-20 | Glassmorphism design; Luxembourgish jokes; flip carousel |
| v0.2.0 | 2026-02-19 | Dark mode toggle with localStorage; layout redesign |
| v0.1.0 | 2026-02-19 | Initial release: joke API + submission endpoint |
