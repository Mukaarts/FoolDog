# FoolDog

Eine Witz-Karussell-Web-App rund um den Hund **Fool** — gebaut mit Symfony 8, Stimulus.js und einem modernen Glassmorphism-Design.

## Features

- **Witz-Karussell** — Durchblättern von Hundewitzen per Klick mit Flip-Animation
- **Dark Mode** — Umschaltbar zwischen dunklem und hellem Theme, gespeichert im Browser
- **Glassmorphism-Design** — Modernes Frosted-Glass-UI mit Farbverläufen und Blur-Effekten
- **Lëtzebuergesch** — Witze und UI-Texte auf Luxemburgisch
- **Witz einreichen** — API-Endpunkt zum Einreichen eigener Witze
- **Feedback** — UserJot-Feedback-Button für Nutzermeldungen
- **Responsive** — Optimiert für Desktop und Mobile

## Tech-Stack

| Bereich   | Technologie                          |
|-----------|--------------------------------------|
| Backend   | PHP 8.4+, Symfony 8.0, Doctrine ORM |
| Frontend  | Stimulus.js, Webpack Encore          |
| Datenbank | MySQL 8.0 (Docker)                   |
| Styling   | Custom CSS (Glassmorphism, CSS Vars) |

## Schnellstart

```bash
# Projekt initialisieren (Docker, Dependencies, Datenbank, Fixtures)
make init

# Alles starten (Docker, Symfony-Server, Asset-Watcher)
make start
```

Die App läuft dann unter `https://localhost:8000`.

## Makefile-Befehle

| Befehl           | Beschreibung                                      |
|------------------|---------------------------------------------------|
| `make init`      | Komplettes Setup (Docker + Deps + DB + Fixtures)  |
| `make start`     | Alles starten (Docker + Server + Assets)           |
| `make db-reset`  | Datenbank komplett neu aufbauen                    |
| `make fixtures`  | Testdaten neu laden                                |
| `make assets`    | Production-Build der Frontend-Assets               |

## API-Endpunkte

| Route               | Methode | Beschreibung                      |
|----------------------|---------|-----------------------------------|
| `/`                  | GET     | Startseite mit Witz-Karussell     |
| `/api/joke/random`   | GET     | Zufälligen Witz abrufen           |
| `/api/joke/ai`       | GET     | KI-generierten Witz generieren    |
| `/api/joke/submit`   | POST    | Neuen Witz einreichen             |
| `/api/jokes`         | GET     | Alle Witze als JSON               |

## Projektstruktur

```
src/
├── Controller/JokeController.php    # Alle Routen und API-Logik
├── Entity/Joke.php                  # Witz-Entity (content, emoji, author)
├── Repository/JokeRepository.php    # Datenbankabfragen (z.B. Zufallswitz)
└── DataFixtures/AppFixtures.php     # 10 Luxemburgische Seed-Witze

assets/
├── controllers/
│   ├── joke_controller.js           # Karussell-Logik (Navigation, Flip)
│   └── theme_controller.js          # Dark-Mode-Toggle
└── styles/app.css                   # Glassmorphism-Styling, Themes

templates/
├── base.html.twig                   # HTML-Layout
└── joke/index.html.twig             # Karussell-UI
```

## Lizenz

Proprietary
