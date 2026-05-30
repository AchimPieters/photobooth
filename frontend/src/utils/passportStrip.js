import { SHEET_W, SHEET_H, PRINT_DPI } from './photoStrip'

// Pasfoto's worden op hetzelfde 4×6" SELPHY-vel geprint als de fotostrip,
// zodat er nooit van media gewisseld hoeft te worden. De foto's hebben het
// officiële formaat 35×45 mm; ze staan gecentreerd op het vel met snijlijnen.
const MM = PRINT_DPI / 25.4              // px per mm @ 300 dpi
const PHOTO_W = Math.round(35 * MM)      // 413 px
const PHOTO_H = Math.round(45 * MM)      // 531 px

export async function buildPassportStrip(photoDataUrl, options = {}) {
  if (!photoDataUrl) return null

  // 2 kolommen × 3 rijen = 6 pasfoto's (standaard NL-pasfotovel). Vult het
  // 4×6"-vel netjes. Aantal is desgewenst aan te passen via options.count.
  const cols = options.cols || 2
  const count = Math.max(1, options.count || 6)
  const rows = Math.ceil(count / cols)
  const gap = Math.round(2 * MM)         // 2 mm tussenruimte

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = SHEET_W
      canvas.height = SHEET_H
      const ctx = canvas.getContext('2d')

      // Wit vel (borderless print vult het volledige 4×6"-vel).
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, SHEET_W, SHEET_H)

      // Raster gecentreerd op het vel.
      const gridW = cols * PHOTO_W + (cols - 1) * gap
      const gridH = rows * PHOTO_H + (rows - 1) * gap
      const startX = Math.round((SHEET_W - gridW) / 2)
      const startY = Math.round((SHEET_H - gridH) / 2)

      for (let i = 0; i < count; i++) {
        const col = i % cols
        const row = Math.floor(i / cols)
        const x = startX + col * (PHOTO_W + gap)
        const y = startY + row * (PHOTO_H + gap)
        ctx.drawImage(img, x, y, PHOTO_W, PHOTO_H)

        // Snijlijn rond elke pasfoto.
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'
        ctx.lineWidth = 1
        ctx.strokeRect(x, y, PHOTO_W, PHOTO_H)
      }

      // Voettekst onder het raster.
      ctx.fillStyle = 'rgba(0,0,0,0.45)'
      ctx.font = `${Math.round(3 * MM)}px sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        'Pasfoto 35 × 45 mm  ·  Knip langs de lijnen',
        SHEET_W / 2,
        startY + gridH + Math.round(6 * MM)
      )

      resolve(canvas.toDataURL('image/jpeg', 0.95))
    }
    img.onerror = () => resolve(null)
    img.src = photoDataUrl
  })
}
