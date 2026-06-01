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

---

## Printers, papierformaten & event-templates

De app print op de **Canon SELPHY CP1500** (één mediaformaat per printer tegelijk).
In het admin-paneel (5× tikken op het icoon) koppel je één of meer printers, elk
met een eigen papierformaat, en wijs je per product een printer toe:

- **Fotostrip** → printer A
- **Pasfoto's** → printer B

Elk product staat volledig los van het andere. Beide mogen dezelfde printer
(en hetzelfde papier) gebruiken; dat is de standaard.

### Papierformaten
Gedefinieerd in `frontend/src/utils/papers.js` (`PAPERS`): printgebied in mm +
het vaste aantal strip-foto's (`strip`). Standaard: L (89×119 mm, 4 foto's),
Postcard (100×148 mm, 5), Card (54×86 mm, 3).

### Pasfoto's — maat ligt fysiek vast
Een pasfoto is **altijd 35×45 mm**, ongeacht het papierformaat. Het papier
bepaalt alleen hoeveel pasfoto's er op het vel passen (Card→1, L→4, Postcard→6).
Pasfoto's gebruiken **geen** template, dus de officiële voorschriften kunnen niet
verstoord worden door een papier- of templatewijziging.

### Event-templates (alleen fotostrip)
Een template is een **transparante PNG-overlay (300 dpi)** die over de strip
wordt geprint, **per papierformaat** opgeslagen. Werkwijze in de admin:

1. Kies het papierformaat in de template-sectie.
2. Download de **ontwerpgids** — die opent op exact de juiste maat, met het juiste
   aantal fotovakken en (alleen) een footer-zone als je een footer hebt ingesteld.
3. Ontwerp je overlay op die gids en upload de PNG.
4. De **live preview** toont de strip met voorbeeldfoto's + jouw overlay, precies
   zoals geprint wordt. De dekking stel je per papierformaat in.

### Waarborg: template past altijd bij de instellingen
Bij het uploaden legt de app vast **waarvoor** de template is gemaakt
(aantal foto's + wel/geen footer). Daarna geldt:

- **Admin** toont groen *"past bij de huidige instellingen"* of rood met wat
  afwijkt (bijv. footer aan/uit gewijzigd), met een knop *"Toch toepassen —
  markeer als passend"* als je zeker weet dat het klopt.
- Gebruikt de strip-printer een papierformaat **zonder** template, dan meldt de
  admin dat de strip zonder overlay print.
- **Bij het printen** wordt de overlay **weggelaten** als hij niet (meer) past →
  liever een schone strip dan een scheve print.
- Templates van vóór deze functie hebben geen vastgelegde parameters en gelden
  als "passend" (ze verliezen hun overlay dus niet automatisch).

Omdat het aantal strip-foto's vastligt per papierformaat én de template per
papierformaat wordt bewaard, lopen aantal en template nooit uit elkaar; de enige
variabele die nog kan afwijken (footer aan/uit) wordt door bovenstaande waarborg
afgevangen.
