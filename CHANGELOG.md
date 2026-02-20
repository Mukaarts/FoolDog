# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden hier dokumentiert.

## [0.4.0] - 2026-02-20

### Geändert
- Witze und Emojis von JavaScript in die Datenbank migriert
- Neues `emoji`-Feld in der Joke-Entity
- API-Endpunkt `/api/jokes` liefert jetzt Emojis mit aus

## [0.3.0] - 2026-02-20

### Hinzugefügt
- Glassmorphism-Design mit Frosted-Glass-Effekten und Farbverläufen
- Luxemburgische Witze als Datenbank-Fixtures
- Witz-Karussell mit Navigation (Vor/Zurück) und Flip-Animation
- Witzzähler-Anzeige

### Geändert
- Komplettes Redesign im Dark-Glassmorphism-Stil
- UI-Sprache auf Lëtzebuergesch umgestellt

## [0.2.0] - 2026-02-19

### Hinzugefügt
- Dark-Mode-Toggle mit localStorage-Persistenz
- Modernes, aufgeräumtes Layout-Redesign
- CSS-Variablen für Theme-Farben
- Sanfte Theme-Übergänge (400ms)

## [0.1.0] - 2026-02-19

### Hinzugefügt
- Erste Version der FoolDog-Witz-App
- Animierter Hund mit Pfoten-Dekoration
- Witz-Anzeige mit Klick-zum-Aufdecken
- Witz-Einreichen per API (`POST /api/joke/submit`)
- Zufällige Witz-API (`GET /api/joke/random`)
- KI-Witz-Generator (`GET /api/joke/ai`)
- Fallback-Witze auf Deutsch wenn DB leer
- Docker-Setup mit MySQL 8.0
- Makefile für einfache Projektsteuerung
