# 🔧 Troubleshooting

Oplossingen voor de meest voorkomende problemen.

---

## Camera

### "Camera toegang vereist" in de app
**Oplossing:**
1. Ga naar **Instellingen → Safari → Camera**
2. Selecteer **Toestaan**
3. Herlaad de app

### Camera is zwart scherm
**Oorzaak:** Andere app gebruikt de camera nog.
**Oplossing:** Sluit alle andere apps en heropen de photobooth.

### Camera is spiegelverkeerd
Dit is normaal voor de selfie-camera — foto's worden correct gespiegeld opgeslagen.

---

## Printer

### Printer niet gevonden bij printen
**Controleer:**
- Staat de printer aan? (groene LED)
- Zit de iPad op hetzelfde WiFi als de printer?
- Is de printer verbonden met WiFi? (niet via USB)

**Oplossing:**
1. Herstart de printer
2. Herstart de WiFi-verbinding van de printer via het menu
3. Wacht 30 seconden en probeer opnieuw

### Print is te klein of afgesneden
De SELPHY CP1500 print op 54×86mm (visitekaartformaat). De fotostrip past hier precies op als je **"Passend schalen"** kiest in het printdialoog.

### Papier/inkt op
Vervang de **RP-108** papiercassette en/of **KP-108IN** inktcassette.
Na vervangen: herstart de printer en print opnieuw.

---

## Betaling (SumUp)

### SumUp app opent niet
- Installeer de SumUp app via de App Store
- Controleer of de affiliate key correct is ingesteld (zie [configuratie](configuration.md))

### Betaling mislukt
- Controleer of de betaalterminal opgeladen is
- Zorg dat de terminal verbinding heeft (Bluetooth of mobiele data)
- Probeer de betaling opnieuw

### App keert niet terug na betaling
SumUp stuurt de gast terug via een URL. De app leidt die URL **automatisch** af
van waar hij draait, dus daar hoef je niets in te stellen. Dit werkt het best als:
- De app als PWA geïnstalleerd is via "Zet op beginscherm"
- De iPad een werkende internetverbinding heeft

---

## App / PWA

### App laadt niet (geen internet)
De Service Worker cached de app na de eerste keer. Maar de allereerste keer is internet vereist.
**Oplossing:** Zorg voor internet bij het eerste gebruik, daarna werkt hij offline.

### App is niet bijgewerkt na een aanpassing
De Service Worker cached de oude versie.
**Oplossing:**
1. Sluit de app volledig
2. Open Safari → Instellingen → Geavanceerd → Websitedata → Verwijder "github.io"
3. Open de app opnieuw — nu laadt de nieuwe versie

### Volledig scherm werkt niet
De app moet als PWA geïnstalleerd zijn, niet gewoon in Safari geopend.
**Oplossing:** Tik op het Delen-icoon → "Zet op beginscherm" → Open via het icoon op het beginscherm.

### Aftelling gaat te snel of te langzaam
Dit is zelden een bug — controleer of de iPad-batterij niet te laag is (onder 20% wordt de CPU vertraagd).

---

## GitHub / Deploy

### App is niet bijgewerkt na een push
1. Ga naar [GitHub Actions](https://github.com/AchimPieters/photobooth/actions)
2. Controleer of de deploy geslaagd is (groen vinkje)
3. Wacht 2-3 minuten na een succesvolle deploy
4. Herlaad de app op de iPad (zie "App is niet bijgewerkt" hierboven)

### Deploy mislukt (rood kruis in Actions)
1. Klik op de mislukte run
2. Lees de foutmelding
3. Meestal is het een test die faalt — kijk in de test-output

---

## Contact

Problemen die hier niet bij staan? Open een [GitHub Issue](https://github.com/AchimPieters/photobooth/issues).
