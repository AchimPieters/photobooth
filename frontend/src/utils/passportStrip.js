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

import { paperPx, mmToPx } from './papers'

// Pasfoto's worden op een SELPHY-vel geprint; het velformaat komt uit de aan
// het pasfoto-product toegewezen printer (options.paper). De foto's hebben het
// officiële formaat 35×45 mm; ze staan in een raster gecentreerd op het vel,
// met snijlijnen. Het aantal pasfoto's past zich aan de velgrootte aan: zo
// veel als er passen (max 2 kolommen).
const PHOTO_W = mmToPx(35)
const PHOTO_H = mmToPx(45)
const GAP = mmToPx(2)
const MARGIN = mmToPx(4) // veilige rand zodat niets tegen de velrand valt

// Hoeveel pasfoto's (35×45 mm) passen er op een vel van dit papierformaat?
// Max 2 kolommen. Gedeeld door de render én de UI, zodat de getoonde prijs/
// aantal altijd klopt met wat er daadwerkelijk wordt geprint.
export function passportGrid(paper) {
  const sheet = paperPx(paper)
  const cols = Math.max(1, Math.min(2, Math.floor((sheet.w - 2 * MARGIN + GAP) / (PHOTO_W + GAP))))
  const rows = Math.max(1, Math.floor((sheet.h - 2 * MARGIN + GAP) / (PHOTO_H + GAP)))
  return { cols, rows, count: cols * rows }
}

export function passportCount(paper) {
  return passportGrid(paper).count
}

export async function buildPassportStrip(photoDataUrl, options = {}) {
  if (!photoDataUrl) return null

  const sheet = paperPx(options.paper)
  const sheetW = sheet.w
  const sheetH = sheet.h

  // Aantal komt uit de template (options.count), geklemd op wat fysiek past.
  const grid = passportGrid(options.paper)
  const cols = grid.cols
  const count = Math.max(1, Math.min(grid.count, options.count || grid.count))
  const rows = Math.ceil(count / cols)

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = sheetW
      canvas.height = sheetH
      const ctx = canvas.getContext('2d')

      // Wit vel (borderless print vult het volledige vel).
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, sheetW, sheetH)

      // Raster gecentreerd op het vel.
      const gridW = cols * PHOTO_W + (cols - 1) * GAP
      const gridH = rows * PHOTO_H + (rows - 1) * GAP
      const startX = Math.round((sheetW - gridW) / 2)
      const startY = Math.round((sheetH - gridH) / 2)

      for (let i = 0; i < count; i++) {
        const col = i % cols
        const row = Math.floor(i / cols)
        const x = startX + col * (PHOTO_W + GAP)
        const y = startY + row * (PHOTO_H + GAP)
        ctx.drawImage(img, x, y, PHOTO_W, PHOTO_H)

        // Snijlijn rond elke pasfoto.
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'
        ctx.lineWidth = 1
        ctx.strokeRect(x, y, PHOTO_W, PHOTO_H)
      }

      resolve(canvas.toDataURL('image/jpeg', 0.95))
    }
    img.onerror = () => resolve(null)
    img.src = photoDataUrl
  })
}
