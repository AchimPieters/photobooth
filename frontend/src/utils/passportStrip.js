const PX_PER_MM = 11.8  // ~300 dpi equivalent

export async function buildPassportStrip(photoDataUrl) {
  if (!photoDataUrl) return null

  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const photoW = Math.round(35 * PX_PER_MM)  // 413 px
      const photoH = Math.round(45 * PX_PER_MM)  // 531 px
      const padding = 32
      const gap     = 6
      const cols    = 2
      const rows    = 2
      const footerH = 28

      const canvasW = cols * photoW + (cols - 1) * gap + 2 * padding
      const canvasH = rows * photoH + (rows - 1) * gap + 2 * padding + footerH

      const canvas = document.createElement('canvas')
      canvas.width  = canvasW
      canvas.height = canvasH
      const ctx = canvas.getContext('2d')

      // Witte achtergrond
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvasW, canvasH)

      // 4 pasfoto's in 2×2 raster
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = padding + col * (photoW + gap)
          const y = padding + row * (photoH + gap)
          ctx.drawImage(img, x, y, photoW, photoH)

          // Kniplijnen
          ctx.strokeStyle = 'rgba(0,0,0,0.2)'
          ctx.lineWidth   = 0.8
          ctx.strokeRect(x, y, photoW, photoH)
        }
      }

      // Voettekst
      ctx.fillStyle  = 'rgba(0,0,0,0.45)'
      ctx.font       = `${Math.round(PX_PER_MM * 2.6)}px sans-serif`
      ctx.textAlign  = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(
        'Pasfoto 35 × 45 mm  ·  Knip langs de lijnen',
        canvasW / 2,
        canvasH - footerH / 2,
      )

      resolve(canvas.toDataURL('image/jpeg', 0.95))
    }
    img.src = photoDataUrl
  })
}
