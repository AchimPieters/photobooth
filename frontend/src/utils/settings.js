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

const KEY = 'pb_settings'

const DEFAULTS = {
  price:             Number(import.meta.env.VITE_PRICE ?? 3.00),
  passportPrice:     Number(import.meta.env.VITE_PASSPORT_PRICE ?? 10.00),
  currency:          'EUR',
  sumupAffiliateKey: '',
  // Aantal strip-foto's is GEEN instelling meer: het ligt vast per
  // papierformaat (zie PAPERS[...].strip in papers.js) en wordt afgeleid in
  // config.getConfig(). Zo blijft het altijd consistent met de event-template.
  countdownSecs:     3,
  autoRestartSecs:   15,
  stripFooter:       'Photobooth ✦ 2026',
  stripBg:           '#000000',
  // Event-templates: PNG met transparantie (data-URL) per papierformaat, als
  // overlay over de fotostrip geprint. Map papier-id → data-URL, bijv.
  // { L: 'data:...', postcard: 'data:...' }. Leeg = geen template.
  stripTemplates:       {},
  // Dekking per papierformaat (map papier-id → 0..1), net als stripTemplates.
  stripTemplateOpacities: {},
  // Ontwerp-parameters per template (map papier-id → { photoCount, hasFooter }):
  // waarvoor de template is gemaakt. Hiermee waarschuwt de admin bij afwijkende
  // instellingen en laat de print de overlay weg als die niet meer past.
  stripTemplateMeta: {},
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
      // Migratie: oude globale dekking → per-papier map voor elk papier dat een
      // template heeft.
      if (!merged.stripTemplateOpacities || typeof merged.stripTemplateOpacities !== 'object') merged.stripTemplateOpacities = {}
      if (typeof merged.stripTemplateOpacity === 'number') {
        for (const paper of Object.keys(merged.stripTemplates)) {
          if (merged.stripTemplateOpacities[paper] === undefined) {
            merged.stripTemplateOpacities[paper] = merged.stripTemplateOpacity
          }
        }
      }
      delete merged.stripTemplateOpacity
      if (!merged.stripTemplateMeta || typeof merged.stripTemplateMeta !== 'object') merged.stripTemplateMeta = {}
      return merged
    }
  } catch {}
  return { ...DEFAULTS }
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
