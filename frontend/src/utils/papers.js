/**
 * Papierformaten voor de Canon SELPHY CP1500 (dye-sub, 300×300 dpi).
 *
 * De maten hieronder zijn de officiële PRINTGEBIEDEN (na het afscheuren van de
 * perforatieranden), bevestigd via de Canon-handleiding. Eén SELPHY heeft één
 * formaat tegelijk geladen; met meerdere printers kun je per product (fotostrip
 * vs. pasfoto's) een ander formaat printen.
 */

export const PRINT_DPI = 300

export const mmToPx = (mm) => Math.round((mm / 25.4) * PRINT_DPI)

// id → definitie. wmm/hmm = printgebied in mm (portret).
export const PAPERS = {
  postcard: { id: 'postcard', wmm: 100, hmm: 148, nl: 'Postcard 10×15 cm (4×6")', en: 'Postcard 4×6" (10×15 cm)' },
  L:        { id: 'L',        wmm: 89,  hmm: 119, nl: 'L-formaat 89×119 mm',       en: 'L size 89×119 mm' },
  card:     { id: 'card',     wmm: 54,  hmm: 86,  nl: 'Card 54×86 mm',             en: 'Card 54×86 mm' },
}

// Standaard zoals gevraagd: L-formaat (89×119 mm).
export const DEFAULT_PAPER = 'L'

export function getPaper(id) {
  return PAPERS[id] || PAPERS[DEFAULT_PAPER]
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

// Standaard-printerlijst (één SELPHY op L-formaat).
export function defaultPrinters() {
  return [{ id: 'p1', name: 'SELPHY CP1500 (1)', paper: DEFAULT_PAPER }]
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
