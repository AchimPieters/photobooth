# Photobooth project

## Wat is dit?

Een zelfgebouwde photobooth PWA voor iPad mini met Canon SELPHY CP1500 printer en SumUp betaalterminal. Gebouwd als vervanging voor commercial software zoals Simple Booth.

## Hardware

- **iPad mini** (model onbekend) — draait de PWA als kiosk via Safari / Guided Access
- **Canon SELPHY CP1500** — dye-sublimatie fotoprinter, verbonden via AirPrint op WiFi
- **SumUp Air of Solo** — betaalterminal, gekoppeld via iOS URL scheme

## Projectstructuur

```
photobooth/
├── frontend/                  # React PWA (Vite)
│   └── src/
│       ├── App.jsx            # Router met 5 schermen
│       ├── index.css          # Kiosk-CSS (geen zoom, selectie, context menu)
│       └── screens/
│           ├── WelcomeScreen.jsx   # Welkom, tik om te starten
│           ├── CameraScreen.jsx    # Countdown + 4 foto's via getUserMedia
│           ├── PreviewScreen.jsx   # Fotostrip bouwen via Canvas API
│           ├── PaymentScreen.jsx   # Betaling via SumUp URL scheme
│           └── DoneScreen.jsx      # Printen via AirPrint (window.print)
└── backend/                   # Node.js + Express
    └── src/
        ├── index.js           # Server entry point (poort 3001)
        └── routes/
            ├── sessions.js    # Sessie beheer (in-memory)
            └── qr.js          # QR-code generatie
```

## Technische keuzes

- **Geen native app** — alles draait in Safari als PWA, geen App Store nodig
- **SumUp via URL scheme** — `sumupmerchant://pay/1.0?...` opent de SumUp app, callback keert terug naar de PWA
- **Printen via AirPrint** — `window.print()` in een popup window, geen drivers nodig
- **Fotostrip via Canvas API** — 4 foto's worden client-side samengevoegd tot één strip
- **Kiosk-modus** — iOS Guided Access vergrendelt de iPad op de app

## SumUp integratie

Bestand: `frontend/src/screens/PaymentScreen.jsx`

```js
const SUMUP_AFFILIATE_KEY = 'JOUW_AFFILIATE_KEY_HIER'  // ← nog in te vullen
const PRICE = 3.00
```

URL scheme formaat:
```
sumupmerchant://pay/1.0?affiliate-key=KEY&amount=3.00&currency=EUR
  &title=Fotostrip&foreign-tx-id=UNIEK_ID&skip-screen-success=true
  &callbacksuccess=https://jouwdomein.nl/payment?payment=success
  &callbackfail=https://jouwdomein.nl/payment?payment=fail
```

## Nog te doen

- [ ] SumUp affiliate key invullen
- [ ] Productie-URL instellen in PaymentScreen (nu localhost)
- [ ] App testen op iPad mini
- [ ] Canon SELPHY verbinden en AirPrint testen
- [ ] Prijs aanpasbaar maken via config
- [ ] QR-code voor digitaal delen implementeren in DoneScreen
- [ ] Thema / branding aanpassen

## Lokaal draaien

```bash
# Frontend
cd frontend && npm install && npm run dev
# → http://localhost:5173

# Backend
cd backend && npm install && npm run dev
# → http://localhost:3001
```

## Documentatie

- `docs/setup.md` — installatie handleiding
- `docs/admin.md` — Guided Access en kiosk-beheer op een event

## GitHub

https://github.com/AchimPieters/photobooth
