/**
 * Bouwt een fotostrip van 4 foto's op een Canvas.
 * Volledig client-side, werkt op iOS 12 Safari.
 */
export function buildStrip(photos, options = {}) {
  const {
    photoWidth = 600,
    aspectRatio = 4 / 3,
    padding = 20,
    spacing = 12,
    footerHeight = 80,
    footerText = 'Photobooth ✦ 2026',
    bgColor = '#000000',
  } = options

  return new Promise((resolve) => {
    if (!photos || photos.length === 0) { resolve(null); return }

    const photoHeight = photoWidth / aspectRatio
    const totalHeight =
      padding +
      photos.length * photoHeight +
      (photos.length - 1) * spacing +
      footerHeight +
      padding

    const canvas = document.createElement('canvas')
    canvas.width  = photoWidth + padding * 2
    canvas.height = totalHeight
    const ctx = canvas.getContext('2d')

    // Achtergrond
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Foto's laden en tekenen
    let loaded = 0
    photos.forEach((src, index) => {
      const img = new Image()
      img.onload = () => {
        const y = padding + index * (photoHeight + spacing)
        // Aspect-fill in afgerond rechthoek
        ctx.save()
        roundedRect(ctx, padding, y, photoWidth, photoHeight, 8)
        ctx.clip()
        drawAspectFill(ctx, img, padding, y, photoWidth, photoHeight)
        ctx.restore()

        loaded++
        if (loaded === photos.length) {
          // Footer
          ctx.fillStyle = 'rgba(255,255,255,0.9)'
          ctx.font = `300 28px -apple-system, Helvetica, sans-serif`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(
            footerText,
            canvas.width / 2,
            totalHeight - footerHeight / 2 - padding / 2
          )
          resolve(canvas.toDataURL('image/jpeg', 0.92))
        }
      }
      img.onerror = () => { loaded++; if (loaded === photos.length) resolve(null) }
      img.src = src
    })
  })
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
