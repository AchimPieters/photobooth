function uint8ToBase64url(bytes) {
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

export async function generateLicense({ licensee, expires, privateKeyJwk }) {
  const privKey = await crypto.subtle.importKey(
    'jwk', privateKeyJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign'],
  )

  const payload      = JSON.stringify({ licensee: licensee.trim(), issued: new Date().toISOString().slice(0, 10), expires, v: 1 })
  const payloadBytes = new TextEncoder().encode(payload)
  const sigBuffer    = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privKey, payloadBytes)
  const sigBytes     = new Uint8Array(sigBuffer)

  return 'pb_' + uint8ToBase64url(payloadBytes) + '.' + uint8ToBase64url(sigBytes)
}
