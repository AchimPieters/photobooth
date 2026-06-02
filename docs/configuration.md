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
Het aantal zit nu **in de template** (zie hieronder), niet meer als losse
instelling. Het `strip`-veld in `frontend/src/utils/papers.js` bepaalt alleen
nog het *voorgestelde* aantal bij het aanmaken van een nieuwe strip-template
(L→4, Postcard→5, Card→3).

### Aftelling
```js
countdownSecs: 3,  // Seconden voor elke foto
```

### Auto-restart tijd
```js
autoRestartSecs: 15,  // Seconden na betaling voor auto-reset
```

---

## Templates (de eenheid van configuratie)

Alles draait om **templates**. Eén template legt vast: **product** (fotostrip of
pasfoto), **papierformaat**, **aantal foto's**, en voor strips ook **footer**,
**achtergrond** en de **overlay-PNG**. Je kiest in het admin-paneel (5× tikken op
het icoon) per product de **actieve** template; de klant tikt gewoon
*Fotostrip* of *Pasfoto's* en krijgt die template.

Daarmee zijn er geen losse, los van elkaar in te stellen knoppen meer voor
papier en aantal — en kan een overlay nooit losraken van zijn aantal/papier.

> De fysieke printer kies je in de **iOS AirPrint-dialoog** (de browser kan dat
> niet sturen). Zorg dat de printer met het juiste papier geladen is; het
> papierformaat in de app komt uit de gekozen template (`@page`-grootte).

### Een template instellen
1. **Templates**-sectie → *Nieuwe strip-template* of *Nieuwe pasfoto-template*.
2. Geef **naam**, **papierformaat** en **aantal foto's**.
   - Strip: aantal vrij (1–8), met een voorstel per papier.
   - Pasfoto: aantal geklemd op wat fysiek past (Card→1, L→4, Postcard→6).
3. Strip: zet **footer** + **achtergrond**; download de **ontwerpgids** (exacte
   maat + aantal vakken) of de **officiële InDesign-template** (met 3 mm bleed,
   cyan = fotokader, magenta = max. aanbevolen overlay), ontwerp je overlay en
   upload de transparante PNG.
4. De **live preview** toont de strip met voorbeeldfoto's + overlay zoals geprint.
5. Kies bovenaan de **actieve** strip- en pasfoto-template.

### Ontwerp-templates voor vormgevers
In de map [`Templates/`](../Templates) staan per papierformaat een **InDesign**-
bestand + **PNG**-preview, met **3 mm bleed**. **Cyan** = het fotokader, **magenta**
= de maximale aanbevolen overlay over de foto (de vormgever is vrij). Maten:
Card 54×86 mm, L 89×119 mm, Postcard 10×15 cm (100×150 mm). Lever de uiteindelijke
overlay aan als **transparante PNG @ 300 dpi**.

### Pasfoto's — maat ligt fysiek vast
Een pasfoto is **altijd 35×45 mm**, ongeacht het papierformaat. Het papier
bepaalt alleen hoeveel er op het vel passen. Pasfoto's gebruiken **geen** overlay,
dus de officiële voorschriften kunnen niet verstoord worden.

### Waarborg: overlay past altijd
Bij het uploaden legt de app vast waarvoor de overlay is gemaakt (aantal +
wel/geen footer). Daarna:
- **Admin** toont groen *"past"* of rood met wat afwijkt, met *"Toch toepassen —
  markeer als passend"* voor als je het zeker weet.
- **Bij het printen** wordt de overlay **weggelaten** als hij niet (meer) past →
  liever een schone strip dan een scheve print.
- Overlays van vóór deze functie gelden als "passend" (verliezen hun overlay niet
  automatisch).
