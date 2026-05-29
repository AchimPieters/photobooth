#!/usr/bin/env node
// Photobooth licentie-generator
// Gebruik: node generate-license.js "Naam Klant" "2027-12-31"
// Of via GitHub Actions (zie workflow.yml)

const { webcrypto } = require('crypto')
const crypto = webcrypto

async function main() {
  const licensee = process.argv[2]
  const expires  = process.argv[3]

  if (!licensee || !expires || !/^\d{4}-\d{2}-\d{2}$/.test(expires)) {
    console.error('Gebruik: node generate-license.js "Naam Klant" "YYYY-MM-DD"')
    process.exit(1)
  }

  if (new Date(expires) <= new Date()) {
    console.error('Vervaldatum moet in de toekomst liggen.')
    process.exit(1)
  }

  const keyJson = process.env.PB_LICENSE_PRIVATE_KEY
  if (!keyJson) {
    console.error('Omgevingsvariabele PB_LICENSE_PRIVATE_KEY ontbreekt.')
    process.exit(1)
  }

  let privateKeyJwk
  try {
    privateKeyJwk = JSON.parse(keyJson)
  } catch {
    console.error('PB_LICENSE_PRIVATE_KEY is geen geldige JSON.')
    process.exit(1)
  }

  const privKey = await crypto.subtle.importKey(
    'jwk', privateKeyJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign'],
  )

  const payload      = JSON.stringify({ licensee, issued: new Date().toISOString().slice(0, 10), expires, v: 1 })
  const payloadBytes = Buffer.from(payload, 'utf8')
  const sigBuffer    = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privKey, payloadBytes)

  function toBase64url(buf) {
    return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  }

  const code = 'pb_' + toBase64url(payloadBytes) + '.' + toBase64url(sigBuffer)

  console.log('')
  console.log('╔══════════════════════════════════════════════════╗')
  console.log('║           PHOTOBOOTH LICENTIECODE                ║')
  console.log('╠══════════════════════════════════════════════════╣')
  console.log(`║  Naam   : ${licensee.padEnd(39)}║`)
  console.log(`║  Geldig : ${new Date().toISOString().slice(0, 10)} → ${expires.padEnd(25)}║`)
  console.log('╠══════════════════════════════════════════════════╣')
  console.log('║  Stuur deze code naar de klant:                  ║')
  console.log('╚══════════════════════════════════════════════════╝')
  console.log('')
  console.log(code)
  console.log('')
}

main().catch(e => { console.error(e); process.exit(1) })
