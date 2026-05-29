import { getSettings } from './settings'

export function getConfig() {
  const s = getSettings()
  return {
    price:             s.price,
    currency:          s.currency,
    sumupAffiliateKey: s.sumupAffiliateKey || (import.meta.env.VITE_SUMUP_KEY ?? ''),
    totalPhotos:       s.totalPhotos,
    countdownSecs:     s.countdownSecs,
    autoRestartSecs:   s.autoRestartSecs,
    stripFooter:       s.stripFooter,
    stripBg:           s.stripBg,
    baseUrl:           s.baseUrl || (import.meta.env.VITE_BASE_URL ?? 'https://achimpieters.github.io/photobooth'),
  }
}

// Proxy zodat bestaande `config.price` etc. altijd vers uit localStorage leest
const config = new Proxy({}, {
  get(_, key) { return getConfig()[key] },
})

export default config
