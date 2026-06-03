# 📲 Foto-upload Worker (digitale kopie / QR)

Een kleine Cloudflare Worker + R2-bucket die foto's **tijdelijk** host, zodat het
klaar-scherm van de photobooth een **QR-code** kan tonen waarmee de gast zijn
foto downloadt. Foto's verlopen automatisch (standaard na 24 uur).

Privacy: de foto's staan op **jouw eigen** Cloudflare-account, niet bij een derde
partij, en worden automatisch verwijderd.

## Eenmalige setup

Vereist een (gratis) Cloudflare-account en [`wrangler`](https://developers.cloudflare.com/workers/wrangler/).

```bash
cd upload-worker
npm install -g wrangler        # of: npx wrangler ...
wrangler login

# 1) Maak de R2-bucket
wrangler r2 bucket create photobooth-photos

# 2) Zet een upload-sleutel (VERPLICHT — zonder weigert de Worker uploads)
wrangler secret put UPLOAD_KEY      # verzin een willekeurige waarde

# 3) Deploy
wrangler deploy
```

> ⚠️ De `UPLOAD_KEY` is **verplicht**. Zonder secret antwoordt het upload-endpoint
> met `503` — dit voorkomt dat de Worker als open foto-hosting op internet komt
> te staan. Daarnaast accepteert de Worker uploads alleen vanaf de origins in
> `ALLOWED_ORIGINS` (`wrangler.toml`); pas die aan als je niet op GitHub Pages draait.

Wrangler toont na deploy de URL, bijv. `https://photobooth-photos.<jij>.workers.dev`.

## Koppelen aan de app
Open het admin-paneel (5× tik op het logo) → **📲 Digitale kopie (QR)**:
- **Upload-URL** = de Worker-URL van hierboven.
- **Upload-sleutel** = dezelfde waarde als `UPLOAD_KEY` (verplicht).

Klaar — na een betaalde sessie verschijnt er een QR-code op het scherm.

## Automatisch opruimen
Foto's verlopen na `RETENTION_HOURS` (in `wrangler.toml`, standaard 24 uur):
- bij het **opvragen** van een verlopen foto verwijdert de Worker 'm meteen, én
- een **uurlijkse cron-sweep** (`[triggers] crons`) ruimt verlopen foto's op die
  nooit meer worden opgevraagd.

Een extra **R2 lifecycle-regel** (Cloudflare dashboard → R2 → bucket → Settings →
Object lifecycle) mag, maar is niet nodig.

## Endpoints
- `POST /` (body = JPEG, `Content-Type: image/jpeg`, evt. `X-Upload-Key`) → `{ "url": "…/p/<id>" }`
- `GET /p/<id>` → mobiele downloadpagina
- `GET /p/<id>?raw=1` → de ruwe JPEG
