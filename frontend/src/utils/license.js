// Publieke sleutel (ingebakken in de app — alleen voor verificatie)
const PUBLIC_KEY_JWK = {"key_ops":["verify"],"ext":true,"kty":"EC","x":"2ZEzRoyepR3YlqLK_0-ZCbPCjNhjch4JzOezYib_QrY","y":"qMXhzTkvqt6THitrFiiya_pPKJl4oN2Rbq7O4TYmejU","crv":"P-256"}

const STORAGE_KEY = 'pb_license'

let _pubKey = null
async function getPublicKey() {
  if (_pubKey) return _pubKey
  _pubKey = await crypto.subtle.importKey(
    'jwk', PUBLIC_KEY_JWK,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['verify'],
  )
  return _pubKey
}

function uint8ToBase64url(bytes) {
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64urlToUint8(str) {
  const pad = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4)
  const bin = atob(pad)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

export async function verifyAndParseLicense(raw) {
  if (!raw || !raw.startsWith('pb_')) return null
  try {
    const rest = raw.slice(3)
    const dot  = rest.lastIndexOf('.')
    if (dot < 1) return null

    const payloadBytes = base64urlToUint8(rest.slice(0, dot))
    const sigBytes     = base64urlToUint8(rest.slice(dot + 1))
    const key          = await getPublicKey()

    const valid = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' }, key, sigBytes, payloadBytes,
    )
    if (!valid) return null

    return JSON.parse(new TextDecoder().decode(payloadBytes))
  } catch {
    return null
  }
}

export async function getLicenseInfo() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  const payload = await verifyAndParseLicense(raw)
  if (!payload) return { valid: false, reason: 'invalid' }

  const expired = new Date(payload.expires) < new Date()
  if (expired) return { valid: false, reason: 'expired', ...payload }

  return { valid: true, ...payload }
}

export function saveLicense(raw) {
  localStorage.setItem(STORAGE_KEY, raw)
}

export function removeLicense() {
  localStorage.removeItem(STORAGE_KEY)
}

export function getRawLicense() {
  return localStorage.getItem(STORAGE_KEY) || ''
}
