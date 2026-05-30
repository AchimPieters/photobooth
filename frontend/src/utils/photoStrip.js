/**
 * Bouwt een fotostrip van N foto's op een Canvas.
 * Volledig client-side, werkt op iOS 12 Safari.
 *
 * Optioneel kan een event-template (PNG met transparantie) als overlay
 * bovenop de strip worden geprint. Decoratie/iconen mogen daarbij deels
 * over de foto's vallen.
 */

// Fractie van elke foto die als "veilige zone" (min-kader) geldt: hier
// horen gezichten, dus overlay-decoratie zou dit deel vrij moeten laten.
// Daarbuiten (tot de fotorand = max-kader) mag de template gerust vallen.
export const SAFE_ZONE = 0.7

// Berekent de exacte stripafmetingen + de positie van elke fotocel en de
// voettekst-zone. Gedeeld door buildStrip en buildTemplateGuide zodat een
// aangeleverde template altijd 1-op-1 over de print past.
export function stripDimensions(options = {}) {
  const {
    photoCount = 4,
    photoWidth = 600,
    aspectRatio = 4 / 3,
    padding = 20,
    spacing = 12,
    footerHeight = 80,
  } = options

  const photoHeight = photoWidth / aspectRatio
  const width = photoWidth + padding * 2
  const height =
    padding +
    photoCount * photoHeight +
    (photoCount - 1) * spacing +
    footerHeight +
    padding

  const cells = []
  for (let i = 0; i < photoCount; i++) {
    cells.push({
      x: padding,
      y: padding + i * (photoHeight + spacing),
      w: photoWidth,
      h: photoHeight,
    })
  }

  const footer = {
    x: padding,
    y: height - footerHeight - padding,
    w: photoWidth,
    h: footerHeight,
  }

  return { width, height, cells, footer }
}

export function buildStrip(photos, options = {}) {
  const {
    photoWidth = 600,
    aspectRatio = 4 / 3,
    padding = 20,
    spacing = 12,
    footerHeight = 80,
    footerText = 'Photobooth ✦ 2026',
    bgColor = '#000000',
    overlay = null,        // data-URL van event-template (PNG met transparantie)
    overlayOpacity = 1,
  } = options

  return new Promise((resolve) => {
    if (!photos || photos.length === 0) { resolve(null); return }

    const dims = stripDimensions({
      photoCount: photos.length,
      photoWidth, aspectRatio, padding, spacing, footerHeight,
    })

    const canvas = document.createElement('canvas')
    canvas.width  = dims.width
    canvas.height = dims.height
    const ctx = canvas.getContext('2d')

    // Achtergrond
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const finish = () => {
      // Footer
      ctx.fillStyle = 'rgba(255,255,255,0.9)'
      ctx.font = `300 28px -apple-system, Helvetica, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(footerText, canvas.width / 2, dims.footer.y + dims.footer.h / 2)

      // Event-template als overlay bovenop alles (wordt mee geprint).
      if (overlay) {
        const ov = new Image()
        ov.onload = () => {
          const prev = ctx.globalAlpha
          ctx.globalAlpha = Math.max(0, Math.min(1, overlayOpacity))
          ctx.drawImage(ov, 0, 0, canvas.width, canvas.height)
          ctx.globalAlpha = prev
          resolve(canvas.toDataURL('image/jpeg', 0.92))
        }
        // Ongeldige template => strip zonder overlay i.p.v. crashen.
        ov.onerror = () => resolve(canvas.toDataURL('image/jpeg', 0.92))
        ov.src = overlay
      } else {
        resolve(canvas.toDataURL('image/jpeg', 0.92))
      }
    }

    // Foto's laden en tekenen
    let loaded = 0
    photos.forEach((src, index) => {
      const img = new Image()
      img.onload = () => {
        const cell = dims.cells[index]
        ctx.save()
        roundedRect(ctx, cell.x, cell.y, cell.w, cell.h, 8)
        ctx.clip()
        drawAspectFill(ctx, img, cell.x, cell.y, cell.w, cell.h)
        ctx.restore()

        loaded++
        if (loaded === photos.length) finish()
      }
      img.onerror = () => { loaded++; if (loaded === photos.length) finish() }
      img.src = src
    })
  })
}

/**
 * Genereert een download-bare ontwerpgids (PNG, transparante achtergrond)
 * met de exacte stripafmetingen, het fotoraster, het min-kader (vrijhouden
 * voor gezichten), het max-kader (fotorand waar decoratie mag vallen) en de
 * voettekst-zone. De admin levert hierop zijn event-template aan.
 */
export function buildTemplateGuide(options = {}) {
  const dims = stripDimensions(options)
  const canvas = document.createElement('canvas')
  canvas.width  = dims.width
  canvas.height = dims.height
  const ctx = canvas.getContext('2d')

  // Transparante achtergrond met subtiel raster zodat de ontwerper de
  // transparantie ziet.
  drawChecker(ctx, dims.width, dims.height)

  // Max-kader / bleed (volledige canvas).
  ctx.strokeStyle = '#e0245e'
  ctx.lineWidth = 4
  ctx.setLineDash([])
  ctx.strokeRect(2, 2, dims.width - 4, dims.height - 4)
  ctx.fillStyle = '#e0245e'
  ctx.font = 'bold 16px sans-serif'
  ctx.textAlign = 'left'
  ctx.textBaseline = 'top'
  ctx.fillText('MAX — bleed', 8, 8)

  // Fotocellen + min-kaders.
  dims.cells.forEach((cell, i) => {
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

    ctx.fillStyle = '#5f6368'
    ctx.font = '14px sans-serif'
    ctx.textAlign = 'left'
    ctx.textBaseline = 'top'
    ctx.fillText(`foto ${i + 1}`, cell.x + insetW + 4, cell.y + insetH + 4)
  })

  // Voettekst-zone.
  ctx.setLineDash([])
  ctx.fillStyle = 'rgba(241,243,244,0.85)'
  ctx.fillRect(dims.footer.x, dims.footer.y, dims.footer.w, dims.footer.h)
  ctx.strokeStyle = '#9aa0a6'
  ctx.lineWidth = 2
  ctx.strokeRect(dims.footer.x, dims.footer.y, dims.footer.w, dims.footer.h)
  ctx.fillStyle = '#5f6368'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('Voettekst-zone', dims.footer.x + dims.footer.w / 2, dims.footer.y + dims.footer.h / 2)

  return canvas.toDataURL('image/png')
}

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
