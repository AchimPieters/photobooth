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
    stripTemplateOpacities: s.stripTemplateOpacities || {},
    stripTemplateMeta:    s.stripTemplateMeta || {},
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

// De template-dekking (0..1) voor het gegeven papierformaat. Default 1.
export function stripTemplateOpacityForPaper(paper) {
  const c = getConfig()
  const v = c.stripTemplateOpacities && c.stripTemplateOpacities[paper]
  return typeof v === 'number' ? v : 1
}

// Bepaalt of een opgeslagen template nog past bij de huidige strip-instellingen.
// Vergelijkt de bewaarde ontwerp-parameters (aantal foto's + footer) met de
// actuele situatie. Onbekende meta (template van vóór deze functie) = passend,
// zodat bestaande setups niet stilletjes hun overlay verliezen.
export function stripTemplateStatus(paper) {
  const c = getConfig()
  const url = c.stripTemplates && c.stripTemplates[paper]
  if (!url) return { hasTemplate: false, matches: false, meta: null }
  const meta = c.stripTemplateMeta && c.stripTemplateMeta[paper]
  const curFooter = !!(c.stripFooter && c.stripFooter.trim())
  const curCount = stripPhotoCount(paper)
  if (!meta) return { hasTemplate: true, matches: true, meta: null, curFooter, curCount }
  const matches = meta.hasFooter === curFooter && meta.photoCount === curCount
  return { hasTemplate: true, matches, meta, curFooter, curCount }
}

// De overlay-data-URL voor de print, of null als er geen (passende) template is.
// Bij een mismatch wordt de overlay bewust weggelaten → liever een schone strip
// dan een scheve print.
export function stripOverlayForPaper(paper) {
  const st = stripTemplateStatus(paper)
  if (!st.hasTemplate || !st.matches) return null
  return getConfig().stripTemplates[paper]
}

// Proxy zodat bestaande `config.price` etc. altijd vers uit localStorage leest
const config = new Proxy({}, {
  get(_, key) { return getConfig()[key] },
})

export default config
