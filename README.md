# 📸 Photobooth

Een zelfgebouwde photobooth PWA voor iPad mini met Canon SELPHY CP1500 printer en SumUp betaalterminal.

## Wat doet het?

- 4 foto's maken met de iPad-camera
- Automatisch een fotostrip samenstellen
- Betalen via SumUp (URL scheme)
- Printen via AirPrint naar Canon SELPHY CP1500
- Digitaal delen via QR-code

## Projectstructuur

```
photobooth/
├── frontend/        # React PWA — draait in Safari op iPad mini
└── backend/         # Node.js — upload, sessies, QR-codes
```

## Vereiste hardware

- iPad mini (elk model met Safari)
- Canon SELPHY CP1500 (AirPrint via WiFi)
- SumUp Air of Solo betaalterminal
- WiFi netwerk (iPad + printer op zelfde netwerk)

## Snelstart

Zie [docs/setup.md](docs/setup.md) voor de volledige installatiehandleiding.

## Licentie

MIT
