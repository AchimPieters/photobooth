# Beheerhandleiding

Handleiding voor het instellen en beheren van de photobooth als beveiligde kiosk op de iPad.

## Inhoudsopgave

- [Guided Access instellen](#guided-access-instellen)
- [Photobooth als PWA installeren](#photobooth-als-pwa-installeren)
- [Guided Access starten en stoppen](#guided-access-starten-en-stoppen)
- [iPad kiosk-instellingen](#ipad-kiosk-instellingen)
- [Wat Guided Access blokkeert](#wat-guided-access-blokkeert)
- [Opstarten op een event](#opstarten-op-een-event)
- [Problemen oplossen](#problemen-oplossen)

---

## Guided Access instellen

Guided Access is de ingebouwde kiosk-modus van iOS. Eenmalig instellen, daarna elke keer in drie tikken te activeren.

1. Ga naar **Instellingen → Toegankelijkheid → Guided Access**
2. Zet **Guided Access** aan
3. Tik op **Toegangscode-instellingen** → stel een pincode in die alleen jij kent (minimaal 6 cijfers)
4. Optioneel: zet **Touch ID** aan zodat je zonder pincode kunt afsluiten

> ⚠️ Noteer de pincode op een veilige plek. Bij vergeten moet de iPad volledig gereset worden.

---

## Photobooth als PWA installeren

De app draait als Progressive Web App vanuit Safari — volledig scherm, geen adresbalk.

1. Open **Safari** op de iPad
2. Ga naar de URL van de app (bijv. `http://192.168.1.10:5173`)
3. Tik op het **Delen-icoon** (vierkantje met pijl omhoog)
4. Tik op **"Zet op beginscherm"**
5. Geef de naam **Photobooth** en tik op **Voeg toe**

De app staat nu als icoon op het beginscherm en start fullscreen op zonder Safari-adresbalk.

---

## Guided Access starten en stoppen

### Starten

1. Open de **Photobooth app** via het beginscherm
2. Activeer Guided Access:
   - **iPad mini 4 / 5:** druk drie keer snel op de **Home-knop**
   - **iPad mini 6:** druk drie keer snel op de **zijknop**
3. Tik op **Start** (rechtsbovenin)

De iPad is nu vergrendeld op de photobooth. Gasten kunnen geen andere apps openen of de iPad afsluiten.

### Stoppen

1. Druk drie keer snel op de **Home-knop** of **zijknop**
2. Voer je **pincode** in of gebruik **Touch ID**
3. Tik op **Stop**

---

## iPad kiosk-instellingen

Stel dit eenmalig in voor een optimale kiosk-ervaring:

| Instelling | Pad | Waarde |
|---|---|---|
| Automatisch vergrendelen | Instellingen → Scherm en helderheid | **Nooit** |
| Niet storen | Instellingen → Focus | **Aan** |
| Helderheid | Instellingen → Scherm en helderheid | 80–100% |
| Automatische updates | Instellingen → Algemeen → Software-update | **Uit** |
| Locatieservices | Instellingen → Privacy → Locatieservices | **Uit** |

Laat de iPad altijd **aangesloten op de lader** tijdens een event.

---

## Wat Guided Access blokkeert

Zolang Guided Access actief is kan een gast:

- de app **niet verlaten** (Home-knop werkt niet)
- **niet naar andere apps** wisselen
- het scherm **niet uitschakelen**
- **geen notificaties** zien
- het **bedieningspaneel** niet openen
- niet naar het **beginscherm** gaan

> De betaling via SumUp werkt gewoon: de iPad schakelt tijdelijk naar de SumUp app en keert automatisch terug naar de photobooth via de callback URL. Guided Access staat deze specifieke app-switch toe.

---

## Opstarten op een event

Volg deze volgorde bij elk event:

1. Verbind de **Canon SELPHY** met het WiFi netwerk
2. Open de **SumUp app**, log in en controleer of de terminal verbonden is
3. Sluit SumUp af en open de **Photobooth app**
4. Activeer **Guided Access** (drie keer drukken → Start)
5. Controleer een testrun: foto maken → strip → betaalscherm (annuleer de betaling)
6. De photobooth is klaar voor gebruik

---

## Problemen oplossen

**Guided Access reageert niet op drie keer drukken**
Controleer of Guided Access ingeschakeld is via Instellingen → Toegankelijkheid → Guided Access.

**SumUp app opent niet vanuit de photobooth**
Zorg dat de SumUp app geïnstalleerd is op de iPad en dat je ingelogd bent. De app moet minimaal één keer handmatig geopend zijn.

**Printer wordt niet gevonden**
Controleer of iPad en SELPHY op hetzelfde WiFi netwerk zitten. Herstart de printer en probeer opnieuw.

**App toont een lege pagina na terugkeer van SumUp**
De backend draait niet of het IP-adres is veranderd. Controleer of de backend actief is en pas de URL aan in de app indien nodig.

**iPad vergrendelt zichzelf toch**
Zet Automatisch vergrendelen op Nooit (Instellingen → Scherm en helderheid) en controleer of de iPad aan de lader hangt.
