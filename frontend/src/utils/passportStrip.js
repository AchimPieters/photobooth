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

export async function buildPassportStrip(photoDataUrl, options = {}) {
  if (!photoDataUrl) return null

  const sheet = paperPx(options.paper)
  const sheetW = sheet.w
  const sheetH = sheet.h

  // Hoeveel pasfoto's passen er op dit vel (max 2 kolommen)?
  const maxCols = Math.max(1, Math.min(2, Math.floor((sheetW - 2 * MARGIN + GAP) / (PHOTO_W + GAP))))
  const maxRows = Math.max(1, Math.floor((sheetH - 2 * MARGIN + GAP) / (PHOTO_H + GAP)))
  const cols = maxCols
  const rows = maxRows
  const count = cols * rows

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
