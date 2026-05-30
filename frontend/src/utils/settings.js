const KEY = 'pb_settings'

const DEFAULTS = {
  price:             Number(import.meta.env.VITE_PRICE ?? 3.00),
  passportPrice:     Number(import.meta.env.VITE_PASSPORT_PRICE ?? 10.00),
  currency:          'EUR',
  sumupAffiliateKey: '',
  totalPhotos:       4,
  countdownSecs:     3,
  autoRestartSecs:   15,
  stripFooter:       'Photobooth ✦ 2026',
  stripBg:           '#000000',
  baseUrl:      '',
  passwordHash: '',
  language:     'nl',
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {}
  return { ...DEFAULTS }
}

export function saveSettings(partial) {
  const current = getSettings()
  localStorage.setItem(KEY, JSON.stringify({ ...current, ...partial }))
}

export async function hashPassword(pw) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const DEFAULT_PASSWORD = 'photobooth'

export async function verifyPassword(input) {
  const { passwordHash } = getSettings()
  const inputHash = await hashPassword(input)
  if (!passwordHash) return inputHash === await hashPassword(DEFAULT_PASSWORD)
  return inputHash === passwordHash
}
