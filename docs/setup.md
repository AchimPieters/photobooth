# Setup handleiding

## Vereisten

- Node.js 20 of hoger
- iPad mini met iOS 15+
- Canon SELPHY CP1500 (op zelfde WiFi netwerk als iPad)
- SumUp account met affiliate key

## 1. Repository klonen

```bash
git clone https://github.com/JOUW_GEBRUIKERSNAAM/photobooth.git
cd photobooth
```

## 2. Frontend installeren

```bash
cd frontend
npm install
npm run dev
```

De app draait nu op `http://localhost:5173`

## 3. Backend installeren

```bash
cd backend
npm install
npm run dev
```

De backend draait op `http://localhost:3001`

## 4. SumUp configureren

1. Ga naar [me.sumup.com/developers](https://me.sumup.com/developers)
2. Maak een affiliate key aan
3. Vul de key in `frontend/src/screens/PaymentScreen.jsx`:
   ```js
   const SUMUP_AFFILIATE_KEY = 'jouw-key-hier'
   ```
4. Installeer de **SumUp app** op de iPad en log in

## 5. iPad instellen

1. Open Safari op de iPad
2. Ga naar het IP-adres van de computer waarop de frontend draait
   (bijv. `http://192.168.1.10:5173`)
3. Tik op "Delen" → "Zet op beginscherm" om als PWA te installeren
4. Zet iPad in **Guided Access** (Instellingen → Toegankelijkheid → Guided Access)
   zodat gasten niet uit de app kunnen

## 6. Printer instellen

1. Verbind de Canon SELPHY CP1500 met hetzelfde WiFi netwerk
2. Op de iPad: Instellingen → WiFi → zelfde netwerk als de printer
3. AirPrint werkt automatisch — geen drivers nodig

## Prijzen aanpassen

In `frontend/src/screens/PaymentScreen.jsx`:
```js
const PRICE = 3.00  // Verander naar gewenste prijs
```

## Productie deployment

Voor een productie-opstelling kun je de frontend hosten op:
- [Vercel](https://vercel.com) (gratis)
- [Netlify](https://netlify.com) (gratis)
- Of lokaal op een Raspberry Pi
