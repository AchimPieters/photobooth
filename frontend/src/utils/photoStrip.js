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
 * Foto-vel voor de Canon SELPHY CP1500.
 *
 * Het hele vel is ÉÉN kant-en-klaar ontwerp: de foto's in een grid (Card 1,
 * L 2×2, Postcard 2×3), met footer en een optionele event-overlay over het
 * volledige vel. Borderless geprint; de klant krijgt het vel zo uit de printer
 * (geen knippen).
 *
 * - buildPrintSheet(): het volledige vel op options.paper-formaat.
 * - buildStrip(): één canvas (gebruikt voor tests).
 * - buildTemplateGuide(): download-bare ontwerpgids op exact velformaat,
 *   getagd op 300 dpi met maatvoering in px/mm/inch.
 *
 * Volledig client-side, werkt op iOS 12 Safari.
 */

import { paperPx, getPaper, PRINT_DPI as PAPER_DPI } from './papers'

// Aantal kolommen in het foto-grid voor dit papierformaat. Smalle vellen (card)
// krijgen 1 kolom, bredere (L, postcard) 2 — conform de officiële templates
// (Card 1, L 2×2, Postcard 2×3).
export function gridColumns(paper) {
  return getPaper(paper).wmm >= 80 ? 2 : 1
}

// 300 dpi. Het vel-formaat is nu instelbaar per printer (zie papers.js);
// de constanten hieronder houden de oude 4×6"-default aan en dienen als
// fallback-afmetingen voor buildStrip() wanneer geen width/height is opgegeven.
export const PRINT_DPI = PAPER_DPI
export const SHEET_W = 1200
export const SHEET_H = 1800
// Eén strip = halve velbreedte.
export const STRIP_W = SHEET_W / 2
export const STRIP_H = SHEET_H

// Fractie van elke foto die als "veilige zone" (min-kader) geldt: hier horen
// gezichten, dus overlay-decoratie zou dit deel vrij moeten laten. Daarbuiten
// (tot de fotorand = max-kader) mag de template gerust vallen.
export const SAFE_ZONE = 0.7

// DPI waarmee de ontwerpgids wordt getagd (zie injectDpi).
export const GUIDE_DPI = 300

// Berekent de indeling van één strip die een w×h-gebied exact vult: de
// fotocellen en de voettekst-zone. Gedeeld door de strip-render en de gids,
// zodat een aangeleverde template altijd 1-op-1 over de print past.
export function stripLayout(w, h, photoCount, hasFooter, cols = 1) {
  const n = Math.max(1, photoCount)
  const c = Math.max(1, Math.min(cols, n))
  const rows = Math.ceil(n / c)
  const pad = Math.round(w * 0.05)
  const footerH = hasFooter ? Math.round(h * 0.07) : 0
  const gap = Math.round(Math.min(w, h) * 0.02)
  const innerW = w - pad * 2
  const gridH = h - pad * 2 - footerH
  const cellW = (innerW - (c - 1) * gap) / c
  const cellH = (gridH - (rows - 1) * gap) / rows

  const cells = []
  for (let i = 0; i < n; i++) {
    const col = i % c
    const row = Math.floor(i / c)
    cells.push({ x: pad + col * (cellW + gap), y: pad + row * (cellH + gap), w: cellW, h: cellH })
  }
  const footer = footerH
    ? { x: pad, y: h - pad - footerH, w: innerW, h: footerH }
    : null

  return { cells, footer, pad, footerH, cols: c, rows }
}

// Rendert één strip in een eigen canvas (w×h). Laadt foto's + optionele
// event-template asynchroon. Resolve't met het canvas-element.
function renderStripCanvas(photos, w, h, opts = {}) {
  const {
    bgColor = '#000000',
    footerText = '',
    overlay = null,
    overlayOpacity = 1,
    cols = 1,
  } = opts

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, w, h)

    const layout = stripLayout(w, h, photos.length, !!footerText, cols)
    const cell0 = layout.cells[0]
    const radius = cell0 ? Math.round(Math.min(cell0.w, cell0.h) * 0.06) : Math.round(w * 0.02)

    const finish = () => {
      // Voettekst
      if (footerText && layout.footer) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)'
        ctx.font = `300 ${Math.round(layout.footerH * 0.42)}px -apple-system, Helvetica, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(
          footerText,
          layout.footer.x + layout.footer.w / 2,
          layout.footer.y + layout.footer.h / 2
        )
      }

      // Event-template als overlay bovenop alles (wordt mee geprint).
      if (overlay) {
        const ov = new Image()
        ov.onload = () => {
          const prev = ctx.globalAlpha
          ctx.globalAlpha = Math.max(0, Math.min(1, overlayOpacity))
          ctx.drawImage(ov, 0, 0, w, h)
          ctx.globalAlpha = prev
          resolve(canvas)
        }
        ov.onerror = () => resolve(canvas) // ongeldige template → zonder overlay
        ov.src = overlay
      } else {
        resolve(canvas)
      }
    }

    if (!photos || photos.length === 0) { finish(); return }

    let loaded = 0
    photos.forEach((src, index) => {
      const img = new Image()
      img.onload = () => {
        const cell = layout.cells[index]
        if (cell) {
          ctx.save()
          roundedRect(ctx, cell.x, cell.y, cell.w, cell.h, radius)
          ctx.clip()
          drawAspectFill(ctx, img, cell.x, cell.y, cell.w, cell.h)
          ctx.restore()
        }
        loaded++
        if (loaded === photos.length) finish()
      }
      img.onerror = () => { loaded++; if (loaded === photos.length) finish() }
      img.src = src
    })
  })
}

/**
 * Bouwt het volledige print-vel voor het gekozen papierformaat als ÉÉN
 * kant-en-klaar ontwerp: de foto's in een grid (Card 1, L 2×2, Postcard 2×3),
 * met footer en de event-overlay één keer over het hele vel. Geen duplicatie,
 * geen snijlijn — de klant krijgt het vel zo uit de printer. Velformaat uit
 * options.paper.
 */
export async function buildPrintSheet(photos, options = {}) {
  if (!photos || photos.length === 0) return null

  const sheetPx = paperPx(options.paper)
  const cols = gridColumns(options.paper)
  const canvas = await renderStripCanvas(photos, sheetPx.w, sheetPx.h, { ...options, cols })
  return canvas.toDataURL('image/jpeg', 0.92)
}

/**
 * Bouwt één losse strip (gebruikt voor on-screen preview en tests).
 * Geeft null terug voor een lege fotolijst.
 */
export async function buildStrip(photos, options = {}) {
  if (!photos || photos.length === 0) return null
  const w = options.width || STRIP_W
  const h = options.height || STRIP_H
  const canvas = await renderStripCanvas(photos, w, h, {
    bgColor: options.bgColor,
    footerText: options.footerText,
    overlay: options.overlay,
    overlayOpacity: options.overlayOpacity,
  })
  return canvas.toDataURL('image/jpeg', 0.92)
}

/**
 * Genereert een download-bare ontwerpgids (PNG, transparante achtergrond) op
 * exact het volledige velformaat. Toont het foto-grid, het min-kader
 * (vrijhouden voor gezichten), het max-kader (fotorand waar decoratie mag
 * vallen) en de voettekst-zone. Getagd op 300 dpi met maatvoering.
 */
export function buildTemplateGuide(options = {}) {
  const sheetPx = paperPx(options.paper)
  const w = sheetPx.w // volledig vel
  const h = sheetPx.h
  const photoCount = Math.max(1, Math.min(8, options.photoCount || 4))
  const cols = gridColumns(options.paper)
  // Volg de werkelijke footer-status van de strip: anders reserveert de gids
  // een footer-zone die de echte print niet heeft (of omgekeerd) → template
  // past niet meer. Default true voor terugwaartse compatibiliteit.
  const hasFooter = options.hasFooter !== false

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')

  // Transparante achtergrond met subtiel raster zodat de ontwerper de
  // transparantie ziet.
  drawChecker(ctx, w, h)

  const layout = stripLayout(w, h, photoCount, hasFooter, cols)

  // Max-kader / bleed (volledige canvas).
  ctx.strokeStyle = '#e0245e'
  ctx.lineWidth = 4
  ctx.setLineDash([])
  ctx.strokeRect(2, 2, w - 4, h - 4)
  ctx.fillStyle = '#e0245e'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('MAX — bleed', 8, 8)

  // Maatvoering (px / mm / inch) rechtsboven.
  const mmW = Math.round((w / GUIDE_DPI) * 25.4)
  const mmH = Math.round((h / GUIDE_DPI) * 25.4)
  const inW = (w / GUIDE_DPI).toFixed(2)
  const inH = (h / GUIDE_DPI).toFixed(2)
  ctx.textAlign = 'right'
  ctx.fillText(`${w} × ${h} px @ ${GUIDE_DPI} dpi`, w - 8, 8)
  ctx.fillText(`${mmW} × ${mmH} mm`, w - 8, 28)
  ctx.fillText(`${inW}" × ${inH}"`, w - 8, 48)

  // Fotocellen + min-kaders.
  layout.cells.forEach((cell, i) => {
    // Fotorand (= max-kader voor decoratie over de foto).
    ctx.strokeStyle = '#9aa0a6'
    ctx.lineWidth = 2
    ctx.setLineDash([10, 6])
    ctx.strokeRect(cell.x, cell.y, cell.w, cell.h)

    // Min-kader: veilige binnenzone (vrijhouden voor gezichten).
    const insetW = (cell.w * (1 - SAFE_ZONE)) / 2
    const insetH = (cell.h * (1 - SAFE_ZONE)) / 2
    ctx.strokeStyle = '#1da1f2'
    ctx.lineWidth = 3
    ctx.setLineDash([])
    ctx.strokeRect(cell.x + insetW, cell.y + insetH, cell.w - insetW * 2, cell.h - insetH * 2)

    ctx.fillStyle = '#1da1f2'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('MIN — vrijhouden', cell.x + cell.w / 2, cell.y + cell.h / 2)

    const cellMmW = Math.round((cell.w / GUIDE_DPI) * 25.4)
    const cellMmH = Math.round((cell.h / GUIDE_DPI) * 25.4)
    ctx.fillStyle = '#5f6368'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(`foto ${i + 1} — ${cellMmW} × ${cellMmH} mm`, cell.x + insetW + 4, cell.y + insetH + 4)
  })

  // Voettekst-zone.
  if (layout.footer) {
    ctx.setLineDash([])
    ctx.fillStyle = 'rgba(241,243,244,0.85)'
    ctx.fillRect(layout.footer.x, layout.footer.y, layout.footer.w, layout.footer.h)
    ctx.strokeStyle = '#9aa0a6'
    ctx.lineWidth = 2
    ctx.strokeRect(layout.footer.x, layout.footer.y, layout.footer.w, layout.footer.h)
    ctx.fillStyle = '#5f6368'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Voettekst-zone', layout.footer.x + layout.footer.w / 2, layout.footer.y + layout.footer.h / 2)
  }

  return injectDpi(canvas.toDataURL('image/png'), GUIDE_DPI)
}

// ─── PNG DPI-tag ──────────────────────────────────────────────────────────
// Voegt een pHYs-chunk (fysieke pixelafmetingen) toe aan een PNG-data-URL,
// zodat ontwerptools het bestand op de juiste fysieke maat openen. Canvas zelf
// schrijft geen DPI; de pixelinhoud blijft ongewijzigd.
function injectDpi(dataUrl, dpi) {
  try {
    const bytes = dataUrlToBytes(dataUrl)
    const ppm = Math.round(dpi / 0.0254) // pixels per meter

    // pHYs: length(4) + type(4) + data(9) + crc(4)
    const chunk = new Uint8Array(21)
    const dv = new DataView(chunk.buffer)
    dv.setUint32(0, 9)
    chunk[4] = 0x70; chunk[5] = 0x48; chunk[6] = 0x59; chunk[7] = 0x73 // "pHYs"
    dv.setUint32(8, ppm)   // X pixels-per-meter
    dv.setUint32(12, ppm)  // Y pixels-per-meter
    chunk[16] = 1          // eenheid = meter
    dv.setUint32(17, crc32(chunk.subarray(4, 17)))

    // IHDR is altijd eerst: 8 (signatuur) + 4+4+13+4 = 33.
    const insertAt = 33
    const out = new Uint8Array(bytes.length + chunk.length)
    out.set(bytes.subarray(0, insertAt), 0)
    out.set(chunk, insertAt)
    out.set(bytes.subarray(insertAt), insertAt + chunk.length)
    return bytesToDataUrl(out)
  } catch {
    return dataUrl // bij twijfel: gewone PNG i.p.v. crashen
  }
}

function dataUrlToBytes(dataUrl) {
  const bin = atob(dataUrl.split(',')[1])
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

function bytesToDataUrl(bytes) {
  let bin = ''
  const CHUNK = 0x8000 // in stukken, anders stack-overflow bij grote arrays
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode.apply(null, bytes.subarray(i, i + CHUNK))
  }
  return 'data:image/png;base64,' + btoa(bin)
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
    t[n] = c >>> 0
  }
  return t
})()

function crc32(bytes) {
  let c = 0xFFFFFFFF
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8)
  return (c ^ 0xFFFFFFFF) >>> 0
}

// ─── Canvas-helpers ───────────────────────────────────────────────────────

function drawChecker(ctx, w, h) {
  const t = 16
  for (let y = 0; y < h; y += t) {
    for (let x = 0; x < w; x += t) {
      ctx.fillStyle = ((x / t + y / t) % 2 === 0) ? '#ffffff' : '#e9eaec'
      ctx.fillRect(x, y, t, t)
    }
  }
}

function drawAspectFill(ctx, img, x, y, w, h) {
  const scale = Math.max(w / img.width, h / img.height)
  const sw = img.width * scale
  const sh = img.height * scale
  const dx = x + (w - sw) / 2
  const dy = y + (h - sh) / 2
  ctx.drawImage(img, dx, dy, sw, sh)
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
