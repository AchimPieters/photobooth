# Photobooth — PWA

Progressive Web App photobooth voor iPad. Draait op iOS 12+, gehost op GitHub Pages.

## Stack
- React 18 + Vite 5
- vite-plugin-pwa (Service Worker + manifest)
- @vitejs/plugin-legacy (iOS 12 Safari)
- Vitest (unit tests)
- GitHub Actions (CI + deploy naar GitHub Pages)

## Structuur
```
frontend/
├── src/
│   ├── screens/     # WelcomeScreen, CameraScreen, PreviewScreen, PaymentScreen, DoneScreen
│   ├── hooks/       # useCamera.js
│   ├── utils/       # config.js, photoStrip.js
│   └── __tests__/   # unit tests
├── public/icons/    # PWA icons
├── vite.config.js   # base: '/photobooth/', legacy, PWA
└── package.json
```

## Lokaal draaien
```bash
cd frontend && npm install && npm run dev
# → http://localhost:5173/photobooth/
```

## Deploy
Push naar `main` → GitHub Actions bouwt en deployt automatisch naar:
https://achimpieters.github.io/photobooth

## Secrets (in GitHub → Settings → Secrets → Actions)
- `VITE_SUMUP_KEY` — SumUp affiliate key
- `VITE_PRICE` — prijs (optioneel, default 3.00)
