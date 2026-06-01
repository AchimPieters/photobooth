import { getSettings } from './settings'
import { stripPhotoCount } from './papers'

export function getConfig() {
  const s = getSettings()
  const printers = Array.isArray(s.printers) && s.printers.length ? s.printers : [{ id: 'p1', name: 'SELPHY CP1500 (1)', paper: 'L' }]
  const stripPrinterId = s.stripPrinterId || 'p1'
  const stripPaper = (printers.find(p => p.id === stripPrinterId) || printers[0])?.paper || 'L'
  return {
    price:             s.price,
    passportPrice:     s.passportPrice,
    currency:          s.currency,
    sumupAffiliateKey: s.sumupAffiliateKey || (import.meta.env.VITE_SUMUP_KEY ?? ''),
    // Aantal strip-foto's ligt vast per papierformaat (niet instelbaar), zodat
    // het altijd matcht met de per-formaat opgeslagen event-template.
    totalPhotos:       stripPhotoCount(stripPaper),
    countdownSecs:     s.countdownSecs,
    autoRestartSecs:   s.autoRestartSecs,
    inactivityResetSecs: s.inactivityResetSecs,
    stripFooter:       s.stripFooter,
    stripBg:           s.stripBg,
    stripTemplates:       s.stripTemplates || {},
    stripTemplateOpacity: s.stripTemplateOpacity,
    printers,
    stripPrinterId,
    passportPrinterId: s.passportPrinterId || 'p1',
    baseUrl:           s.baseUrl || (import.meta.env.VITE_BASE_URL ?? 'https://achimpieters.github.io/photobooth'),
  }
}

// Resolve't de paper-id voor een product ('strip' of 'passport') via de
// toegewezen printer. Valt terug op de eerste printer / L-formaat.
export function paperForProduct(kind) {
  const c = getConfig()
  const wantId = kind === 'passport' ? c.passportPrinterId : c.stripPrinterId
  const printer = c.printers.find(p => p.id === wantId) || c.printers[0]
  return printer?.paper || 'L'
}

// De event-template (data-URL of null) voor de fotostrip op het huidige
// strip-papierformaat. Elk papierformaat heeft een eigen template.
export function stripTemplateForPaper(paper) {
  const c = getConfig()
  return (c.stripTemplates && c.stripTemplates[paper]) || null
}

// Proxy zodat bestaande `config.price` etc. altijd vers uit localStorage leest
const config = new Proxy({}, {
  get(_, key) { return getConfig()[key] },
})

export default config
