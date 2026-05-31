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
  // Event-templates: PNG met transparantie (data-URL) per papierformaat, als
  // overlay over de fotostrip geprint. Map papier-id → data-URL, bijv.
  // { L: 'data:...', postcard: 'data:...' }. Leeg = geen template.
  stripTemplates:       {},
  stripTemplateOpacity: 1,
  baseUrl:            '',
  passwordHash:       '',
  language:           'nl',
  inactivityResetSecs: 30,
  // Printers: lijst van SELPHY CP1500's, elk met een eigen papierformaat.
  // Per product (fotostrip / pasfoto's) wijs je een printer toe; de app
  // rendert dan op het juiste formaat. Welke fysieke printer de taak krijgt
  // kiest de operator in de iOS AirPrint-dialoog (browser kan dat niet sturen).
  printers: [{ id: 'p1', name: 'SELPHY CP1500 (1)', paper: 'L' }],
  stripPrinterId:    'p1',
  passportPrinterId: 'p1',
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const merged = { ...DEFAULTS, ...JSON.parse(raw) }
      // Migratie: oude losse stripTemplate → map onder het strip-papierformaat.
      if (merged.stripTemplate && (!merged.stripTemplates || Object.keys(merged.stripTemplates).length === 0)) {
        const printer = (merged.printers || []).find(p => p.id === merged.stripPrinterId) || (merged.printers || [])[0]
        const paper = printer?.paper || 'L'
        merged.stripTemplates = { [paper]: merged.stripTemplate }
      }
      delete merged.stripTemplate
      if (!merged.stripTemplates || typeof merged.stripTemplates !== 'object') merged.stripTemplates = {}
      return merged
    }
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
