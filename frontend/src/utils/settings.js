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

import { stripPhotoCount, PAPERS, DEFAULT_PAPER } from './papers'
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
// Standaard één printer: de pasfoto deelt het papier van de fotostrip, dus de
// default volgt DEFAULT_PAPER (en het aantal de capaciteit van dat vel). Zo zijn
// de defaults intern consistent, ook zonder de normalisatie in getSettings.
export const DEFAULT_PASSPORT_TEMPLATE = {
  id: 'passport-default', name: 'Standaard pasfoto', product: 'passport',
  paper: DEFAULT_PAPER, photoCount: passportCount(DEFAULT_PAPER),
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
  // Digitale kopie (QR): URL van de upload-Worker (Cloudflare). Leeg = uit.
  // De optionele sleutel beschermt de Worker tegen misbruik.
  photoUploadUrl:     '',
  photoUploadKey:     '',
  // Printers, elk met eigen papier. Standaard één printer die voor beide
  // producten geldt (er kan fysiek maar één papier tegelijk geladen zijn). Voeg
  // een tweede toe om fotostrip en pasfoto's aan een eigen printer/papier te
  // koppelen. Het papier per product = papier van de gekoppelde printer.
  printers:           [ { id: 'printer-1', name: 'Printer 1', paper: DEFAULT_PAPER } ],
  stripPrinterId:     'printer-1',
  passportPrinterId:  'printer-1',
  // Welke producten op het welkomstscherm verschijnen. Minstens één staat aan.
  stripEnabled:       true,
  passportEnabled:    true,
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
  // Printers herbouwen uit de oude opstelling: gelijk papier → één printer voor
  // beide; verschillend papier → twee printers, elk product aan de zijne.
  if (stripPaper === passPaper) {
    merged.printers = [ { id: 'printer-1', name: stripPrinter?.name || 'Printer 1', paper: stripPaper } ]
    merged.stripPrinterId = merged.passportPrinterId = 'printer-1'
  } else {
    merged.printers = [
      { id: 'printer-1', name: stripPrinter?.name || 'Printer 1', paper: stripPaper },
      { id: 'printer-2', name: passPrinter?.name  || 'Printer 2', paper: passPaper },
    ]
    merged.stripPrinterId = 'printer-1'
    merged.passportPrinterId = 'printer-2'
  }
  merged.stripEnabled = true
  merged.passportEnabled = true
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
      for (const k of ['printerMode', 'stripTemplate',
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

      // Printers afleiden voor data die ze nog niet had (ouder block-paper model):
      // gelijk papier → één printer voor beide, anders twee printers.
      if (!Array.isArray(parsed.printers)) {
        const aStrip = strips.find(t => t.id === merged.activeStripTemplateId) || strips[0]
        const aPass  = passes.find(t => t.id === merged.activePassportTemplateId) || passes[0]
        const sp = PAPERS[aStrip?.paper] ? aStrip.paper : DEFAULT_PAPER
        const pp = PAPERS[aPass?.paper] ? aPass.paper : 'postcard'
        if (sp === pp) {
          merged.printers = [ { id: 'printer-1', name: 'Printer 1', paper: sp } ]
          merged.stripPrinterId = merged.passportPrinterId = 'printer-1'
        } else {
          merged.printers = [
            { id: 'printer-1', name: 'Printer 1', paper: sp },
            { id: 'printer-2', name: 'Printer 2', paper: pp },
          ]
          merged.stripPrinterId = 'printer-1'
          merged.passportPrinterId = 'printer-2'
        }
      }

      // Printers valideren + de één-printer-regel: bij één printer geldt die voor
      // beide producten. Het papier per product komt van de gekoppelde printer;
      // strip-aantal volgt dat papier, pasfoto-aantal blijft binnen de capaciteit.
      if (!Array.isArray(merged.printers) || merged.printers.length === 0) {
        merged.printers = [ { id: 'printer-1', name: 'Printer 1', paper: DEFAULT_PAPER } ]
      }
      merged.printers = merged.printers.map((p, i) => ({
        id: p.id || `printer-${i + 1}`,
        name: (p.name && String(p.name).trim()) || `Printer ${i + 1}`,
        paper: PAPERS[p.paper] ? p.paper : DEFAULT_PAPER,
      }))
      const pIds = merged.printers.map(p => p.id)
      if (merged.printers.length === 1) {
        merged.stripPrinterId = merged.passportPrinterId = merged.printers[0].id
      } else {
        if (!pIds.includes(merged.stripPrinterId)) merged.stripPrinterId = merged.printers[0].id
        if (!pIds.includes(merged.passportPrinterId)) merged.passportPrinterId = merged.printers[0].id
      }
      const stripPaper = merged.printers.find(p => p.id === merged.stripPrinterId).paper
      const passPaper  = merged.printers.find(p => p.id === merged.passportPrinterId).paper
      merged.templates = merged.templates.map(t => {
        if (t.product === 'strip')    return { ...t, paper: stripPaper, photoCount: stripPhotoCount(stripPaper) }
        if (t.product === 'passport') return { ...t, paper: passPaper,  photoCount: Math.max(1, Math.min(passportCount(passPaper), t.photoCount || passportCount(passPaper))) }
        return t
      })
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
