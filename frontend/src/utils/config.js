/**
   Copyright 2026 Achim Pieters | StudioPieters®

   Permission is hereby granted, free of charge, to any person obtaining a copy
   of this software and associated documentation files (the "Software"), to deal
   in the Software without restriction, including without limitation the rights
   to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   copies of the Software, and to permit persons to whom the Software is
   furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in all
   copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   FITNESS FOR A PARTICULAR PURPOSE AND NON INFRINGEMENT. IN NO EVENT SHALL THE
   AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
   WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
   CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

   for more information visit https://www.studiopieters.nl
 **/

import { getSettings, DEFAULT_STRIP_TEMPLATE, DEFAULT_PASSPORT_TEMPLATE } from './settings'

// De actieve template voor een product ('strip' of 'passport'). Valt terug op
// de eerste template van dat product, en uiteindelijk op de ingebouwde default.
export function getActiveTemplate(product) {
  const s = getSettings()
  const id = product === 'passport' ? s.activePassportTemplateId : s.activeStripTemplateId
  const list = (s.templates || []).filter(t => t.product === product)
  return list.find(t => t.id === id) || list[0] ||
    (product === 'passport' ? { ...DEFAULT_PASSPORT_TEMPLATE } : { ...DEFAULT_STRIP_TEMPLATE })
}

export function getConfig() {
  const s = getSettings()
  const strip = getActiveTemplate('strip')
  const pass  = getActiveTemplate('passport')
  return {
    price:             s.price,
    passportPrice:     s.passportPrice,
    currency:          s.currency,
    sumupAffiliateKey: s.sumupAffiliateKey || (import.meta.env.VITE_SUMUP_KEY ?? ''),
    countdownSecs:     s.countdownSecs,
    autoRestartSecs:   s.autoRestartSecs,
    inactivityResetSecs: s.inactivityResetSecs,
    baseUrl:           s.baseUrl || (import.meta.env.VITE_BASE_URL ?? 'https://achimpieters.github.io/photobooth'),
    // Afgeleid uit de actieve templates — de schermen blijven dezelfde velden lezen.
    totalPhotos:       strip.photoCount,
    stripFooter:       strip.footer || '',
    stripBg:           strip.bg || '#000000',
    passportPhotoCount: pass.photoCount,
    // Voor de admin.
    templates:                s.templates,
    activeStripTemplateId:    s.activeStripTemplateId,
    activePassportTemplateId: s.activePassportTemplateId,
  }
}

// Het papierformaat voor een product = papier van de actieve template.
export function paperForProduct(kind) {
  return getActiveTemplate(kind).paper
}

// Past de overlay van de actieve strip-template nog bij zijn eigen aantal/footer?
// designedFor legt vast waarvoor de overlay is gemaakt; onbekend = passend
// (overlay van vóór deze waarborg verliest z'n overlay niet stilletjes).
export function stripTemplateStatus() {
  const t = getActiveTemplate('strip')
  if (!t.overlay) return { hasTemplate: false, matches: false, meta: null, template: t }
  const meta = t.designedFor
  const curFooter = !!(t.footer && t.footer.trim())
  if (!meta) return { hasTemplate: true, matches: true, meta: null, curFooter, curCount: t.photoCount, template: t }
  const matches = meta.hasFooter === curFooter && meta.photoCount === t.photoCount
  return { hasTemplate: true, matches, meta, curFooter, curCount: t.photoCount, template: t }
}

// De overlay-data-URL voor de print, of null als er geen (passende) is.
export function stripOverlayActive() {
  const st = stripTemplateStatus()
  return (st.hasTemplate && st.matches) ? st.template.overlay : null
}

export function stripOverlayOpacityActive() {
  const v = getActiveTemplate('strip').overlayOpacity
  return typeof v === 'number' ? v : 1
}

// Proxy zodat bestaande `config.price` etc. altijd vers uit localStorage leest
const config = new Proxy({}, {
  get(_, key) { return getConfig()[key] },
})

export default config
