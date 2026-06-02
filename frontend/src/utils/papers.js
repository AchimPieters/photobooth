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

/**
 * Papierformaten voor de Canon SELPHY CP1500 (dye-sub, 300×300 dpi).
 *
 * De maten hieronder komen overeen met de officiële ontwerp-templates in de
 * map Templates/ (Card 54×86, L 89×119, Postcard 10×15 cm = 100×150 mm). De
 * SELPHY print postcard borderless ~100×148; de onderste ~2 mm valt in de
 * overscan. Eén SELPHY heeft één formaat tegelijk geladen.
 */

export const PRINT_DPI = 300

export const mmToPx = (mm) => Math.round((mm / 25.4) * PRINT_DPI)

// id → definitie. wmm/hmm = printgebied in mm (portret).
// strip = vast aantal foto's per fotostrip op dit vel. Net als bij pasfoto's
// (waar het aantal uit de velmaat volgt) ligt het strip-aantal vast per
// papierformaat: zo kan het nooit losraken van de per-formaat opgeslagen
// event-template. Wil je een ander aantal? Pas het hier aan — één bron.
export const PAPERS = {
  postcard: { id: 'postcard', wmm: 100, hmm: 150, strip: 5, nl: 'Postcard 10×15 cm (4×6")', en: 'Postcard 4×6" (10×15 cm)' },
  L:        { id: 'L',        wmm: 89,  hmm: 119, strip: 4, nl: 'L-formaat 89×119 mm',       en: 'L size 89×119 mm' },
  card:     { id: 'card',     wmm: 54,  hmm: 86,  strip: 3, nl: 'Card 54×86 mm',             en: 'Card 54×86 mm' },
}

// Standaard zoals gevraagd: L-formaat (89×119 mm).
export const DEFAULT_PAPER = 'L'

export function getPaper(id) {
  return PAPERS[id] || PAPERS[DEFAULT_PAPER]
}

// Vast aantal fotostrip-foto's voor dit papierformaat (1–8).
export function stripPhotoCount(id) {
  return Math.max(1, Math.min(8, getPaper(id).strip || 4))
}

export function paperLabel(id, lang = 'nl') {
  const p = getPaper(id)
  return lang === 'en' ? p.en : p.nl
}

// Printgebied in pixels @ 300 dpi.
export function paperPx(id) {
  const p = getPaper(id)
  return { w: mmToPx(p.wmm), h: mmToPx(p.hmm), wmm: p.wmm, hmm: p.hmm, id: p.id }
}

// Werkt de @page-grootte voor de print bij naar het gekozen papierformaat.
// iOS AirPrint respecteert de @page size deels; de operator kiest in de
// printdialoog alsnog printer + formaat. Borderless = margin 0.
export function applyPrintPaper(id) {
  if (typeof document === 'undefined') return
  const p = getPaper(id)
  const css = `@media print {
  html, body { width: ${p.wmm}mm; height: ${p.hmm}mm; }
  #print-strip, #print-strip img { width: ${p.wmm}mm; height: ${p.hmm}mm; object-fit: contain; }
  @page { size: ${p.wmm}mm ${p.hmm}mm; margin: 0; }
}`
  let el = document.getElementById('print-page-size')
  if (!el) {
    el = document.createElement('style')
    el.id = 'print-page-size'
    document.head.appendChild(el)
  }
  el.textContent = css
}
