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

import { stripPhotoCount } from './papers'
import { passportCount } from './passportStrip'

const KEY = 'pb_settings'

// Eén "template" is de eenheid van configuratie: hij legt papier + aantal foto's
// + (voor strips) footer/achtergrond/overlay vast. De operator kiest per product
// één actieve template; papier en aantal komen daar volledig uit. Zo zijn er
// minder losse keuzes en kan een overlay nooit losraken van zijn aantal/papier.
//
// Strip-template:    { id, name, product:'strip',    paper, photoCount, footer, bg,
//                      overlay(dataUrl|null), overlayOpacity, designedFor }
// Pasfoto-template:  { id, name, product:'passport', paper, photoCount }
export const DEFAULT_STRIP_TEMPLATE = {
  id: 'strip-default', name: 'Standaard strip', product: 'strip',
  paper: 'L', photoCount: 4,
  footer: 'Photobooth ✦ 2026', bg: '#000000',
  overlay: null, overlayOpacity: 1, designedFor: null,
}
export const DEFAULT_PASSPORT_TEMPLATE = {
  id: 'passport-default', name: 'Standaard pasfoto', product: 'passport',
  paper: 'postcard', photoCount: 6,
}

const DEFAULTS = {
  price:             Number(import.meta.env.VITE_PRICE ?? 3.00),
  passportPrice:     Number(import.meta.env.VITE_PASSPORT_PRICE ?? 10.00),
  currency:          'EUR',
  sumupAffiliateKey: '',
  countdownSecs:     3,
  autoRestartSecs:   15,
  baseUrl:            '',
  passwordHash:       '',
  language:           'nl',
  inactivityResetSecs: 30,
  // Alle papier-/aantal-/overlay-instellingen zitten nu in templates.
  templates: [ { ...DEFAULT_STRIP_TEMPLATE }, { ...DEFAULT_PASSPORT_TEMPLATE } ],
  activeStripTemplateId:    DEFAULT_STRIP_TEMPLATE.id,
  activePassportTemplateId: DEFAULT_PASSPORT_TEMPLATE.id,
}

// Zet de oude (printers + per-papier templates) structuur om naar het nieuwe
// template-model, zodat bestaande installaties hun instellingen behouden.
function migrate(merged) {
  const printers = Array.isArray(merged.printers) ? merged.printers : []
  const stripPrinter = printers.find(p => p.id === merged.stripPrinterId) || printers[0]
  const passPrinter  = printers.find(p => p.id === merged.passportPrinterId) || printers[0]
  const stripPaper = stripPrinter?.paper || 'L'
  const passPaper  = passPrinter?.paper || 'postcard'

  // Oude losse stripTemplate → per-papier map (tussenstap), dan overlay pakken.
  const tplMap = (merged.stripTemplates && typeof merged.stripTemplates === 'object') ? merged.stripTemplates : {}
  if (merged.stripTemplate && !tplMap[stripPaper]) tplMap[stripPaper] = merged.stripTemplate
  const opacMap = (merged.stripTemplateOpacities && typeof merged.stripTemplateOpacities === 'object') ? merged.stripTemplateOpacities : {}
  const metaMap = (merged.stripTemplateMeta && typeof merged.stripTemplateMeta === 'object') ? merged.stripTemplateMeta : {}

  merged.templates = [
    {
      ...DEFAULT_STRIP_TEMPLATE,
      paper: stripPaper,
      photoCount: stripPhotoCount(stripPaper),
      footer: typeof merged.stripFooter === 'string' ? merged.stripFooter : DEFAULT_STRIP_TEMPLATE.footer,
      bg: merged.stripBg || DEFAULT_STRIP_TEMPLATE.bg,
      overlay: tplMap[stripPaper] || null,
      overlayOpacity: typeof opacMap[stripPaper] === 'number' ? opacMap[stripPaper] : 1,
      designedFor: metaMap[stripPaper] || null,
    },
    {
      ...DEFAULT_PASSPORT_TEMPLATE,
      paper: passPaper,
      photoCount: passportCount(passPaper),
    },
  ]
  merged.activeStripTemplateId = DEFAULT_STRIP_TEMPLATE.id
  merged.activePassportTemplateId = DEFAULT_PASSPORT_TEMPLATE.id
  return merged
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      let merged = { ...DEFAULTS, ...parsed }
      // Alleen migreren als de opgeslagen data nog géén templates-array had.
      if (!Array.isArray(parsed.templates)) merged = migrate(merged)
      // Verouderde sleutels opruimen.
      for (const k of ['printers', 'stripPrinterId', 'passportPrinterId', 'stripTemplate',
                       'stripTemplates', 'stripTemplateOpacity', 'stripTemplateOpacities',
                       'stripTemplateMeta', 'stripFooter', 'stripBg', 'totalPhotos']) {
        delete merged[k]
      }
      // Borg een geldige array + geldige actieve-ids.
      if (!Array.isArray(merged.templates) || merged.templates.length === 0) {
        merged.templates = [ { ...DEFAULT_STRIP_TEMPLATE }, { ...DEFAULT_PASSPORT_TEMPLATE } ]
      }
      const strips = merged.templates.filter(t => t.product === 'strip')
      const passes = merged.templates.filter(t => t.product === 'passport')
      if (!strips.some(t => t.id === merged.activeStripTemplateId)) merged.activeStripTemplateId = strips[0]?.id
      if (!passes.some(t => t.id === merged.activePassportTemplateId)) merged.activePassportTemplateId = passes[0]?.id
      return merged
    }
  } catch {}
  return JSON.parse(JSON.stringify(DEFAULTS))
}

// Geeft true bij succes, false als opslaan mislukt (bijv. quota vol door te
// grote event-templates). De aanroeper kan dan een foutmelding tonen.
export function saveSettings(partial) {
  const current = getSettings()
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...current, ...partial }))
    return true
  } catch {
    return false
  }
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
