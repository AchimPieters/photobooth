# 📸 Photobooth

> Zelfgebouwde kiosk-photobooth als Progressive Web App — draait op elke iPad, geen App Store nodig.

[![Deploy](https://github.com/AchimPieters/photobooth/actions/workflows/deploy.yml/badge.svg)](https://github.com/AchimPieters/photobooth/actions/workflows/deploy.yml)
[![CI](https://github.com/AchimPieters/photobooth/actions/workflows/ci.yml/badge.svg)](https://github.com/AchimPieters/photobooth/actions/workflows/ci.yml)

**🌐 Live:** [https://achimpieters.github.io/photobooth](https://achimpieters.github.io/photobooth)

---

## Wat doet het?

1. **Welkom** — gast tikt op het scherm
2. **Camera** — 4 foto's met aftelling (3-2-1)
3. **Preview** — fotostrip wordt samengesteld
4. **Betaling** — €3,00 via SumUp
5. **Klaar** — strip wordt geprint via AirPrint, scherm reset na 15s

## Hardware

| Apparaat | Model |
|---|---|
| iPad | Mini 2 (iOS 12) of nieuwer |
| Printer | Canon SELPHY CP1500 (AirPrint) |
| Betaalterminal | SumUp Air of Solo |

## Snel starten

Zie [docs/beginners-guide.md](docs/beginners-guide.md) voor de complete beginner's guide.

```bash
cd frontend
npm install
npm run dev      # → http://localhost:5173/photobooth/
```

## Documentatie

| Document | Beschrijving |
|---|---|
| [Beginner's Guide](docs/beginners-guide.md) | Eerste keer instellen, stap voor stap |
| [Event Guide](docs/event-guide.md) | Opstarten en gebruiken op een event |
| [Configuratie](docs/configuration.md) | Prijs, SumUp key, aanpassen |
| [Troubleshooting](docs/troubleshooting.md) | Veelvoorkomende problemen oplossen |

## Licentie

[MIT](LICENSE) — Studio Pieters
