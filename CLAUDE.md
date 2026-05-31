# Photobooth — PWA

Progressive Web App photobooth voor iPad. Draait op iOS 12+, gehost op GitHub Pages.

## ⚠️ Gerelateerde repository — hoort bij `photobooth-licenses`

Deze app werkt samen met de **privé**-repo
**[AchimPieters/photobooth-licenses](https://github.com/AchimPieters/photobooth-licenses)**.
Ze delen één **ECDSA P-256 sleutelpaar**:

- **Deze repo (`photobooth`)** bevat de **publieke** sleutel, ingebakken in
  `frontend/src/utils/license.js` (`PUBLIC_KEY_JWK`). Daarmee *verifieert* de app
  licentiecodes (formaat `pb_<payload>.<signature>`).
- **`photobooth-licenses`** bevat de **private** sleutel (GitHub-secret
  `PB_LICENSE_PRIVATE_KEY`) en *genereert/ondertekent* de codes via de
  Actions-workflow `generate-license.js`.

**Belangrijk bij wijzigingen:** publieke en private sleutel zijn een paar.
Roteer je de sleutel, werk dan **beide** repo's bij (publieke sleutel hier +
private sleutel als secret in `photobooth-licenses`), anders accepteert de app
de codes niet. Bij rotatie worden alle eerder uitgegeven codes ongeldig.

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
