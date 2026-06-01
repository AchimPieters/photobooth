# ⚙️ Configuratie

Alle instellingen worden beheerd via GitHub Secrets. Je hoeft nooit in de code te komen.

---

## GitHub Secrets instellen

Ga naar: **GitHub → jouw photobooth-repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret | Beschrijving | Voorbeeld |
|---|---|---|
| `VITE_SUMUP_KEY` | SumUp affiliate key | `abc123xyz` |
| `VITE_PRICE` | Prijs per strip (optioneel, standaard 3.00) | `3.50` |

### Hoe stel je een secret in?

1. Ga naar [github.com/AchimPieters/photobooth/settings/secrets/actions](https://github.com/AchimPieters/photobooth/settings/secrets/actions)
2. Klik **New repository secret**
3. Naam: `VITE_SUMUP_KEY`
4. Waarde: jouw affiliate key
5. Klik **Add secret**
6. Push een lege commit om de deploy te triggeren:
   ```bash
   git commit --allow-empty -m "chore: update secrets"
   git push
   ```

---

## Prijs aanpassen

1. Ga naar GitHub Secrets (zie hierboven)
2. Voeg toe of bewerk: `VITE_PRICE` = `4.00`
3. Push een lege commit

De nieuwe prijs is binnen 2 minuten live op de iPad.

---

## Lokaal ontwikkelen met eigen instellingen

Maak een bestand `frontend/.env.local` (staat in `.gitignore`, nooit in git):

```
VITE_SUMUP_KEY=jouw_key_hier
VITE_PRICE=3.00
VITE_BASE_URL=http://localhost:5173/photobooth
```

---

## Andere aanpassingen

### Fotostrip footer tekst
In `frontend/src/utils/config.js`:
```js
stripFooter: 'Jouw Evenement ✦ 2026',
```

### Aantal foto's per strip
Dit is **geen vrije instelling** meer: het aantal ligt vast per papierformaat,
zodat het altijd matcht met de per-formaat opgeslagen event-template (net als
bij pasfoto's). Pas het aan in `frontend/src/utils/papers.js` via het
`strip`-veld per formaat:
```js
export const PAPERS = {
  postcard: { …, strip: 5 },  // 5 foto's per strip
  L:        { …, strip: 4 },  // 4 foto's per strip
  card:     { …, strip: 3 },  // 3 foto's per strip
}
```
In de admin zie je per gekozen strip-printer/papierformaat hoeveel foto's de
strip krijgt.

### Aftelling
```js
countdownSecs: 3,  // Seconden voor elke foto
```

### Auto-restart tijd
```js
autoRestartSecs: 15,  // Seconden na betaling voor auto-reset
```
