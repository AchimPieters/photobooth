import { Router } from 'express'
import QRCode from 'qrcode'

export const qrRoutes = Router()

// Genereer QR-code als data URL voor een gegeven URL
qrRoutes.get('/', async (req, res) => {
  const { url } = req.query
  if (!url) return res.status(400).json({ error: 'url parameter verplicht' })

  try {
    const qr = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    })
    res.json({ qr })
  } catch (err) {
    res.status(500).json({ error: 'QR generatie mislukt' })
  }
})
