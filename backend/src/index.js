import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'
import { sessionRoutes } from './routes/sessions.js'
import { qrRoutes } from './routes/qr.js'
import { configRoutes } from './routes/config.js'

const app = express()
const PORT = process.env.PORT || 3001
const __dir = dirname(fileURLToPath(import.meta.url))

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }))
app.use(express.json({ limit: '10mb' }))

// API routes
app.use('/api/sessions', sessionRoutes)
app.use('/api/qr', qrRoutes)
app.use('/api/config', configRoutes)

// Health check
app.get('/health', (_, res) => res.json({ ok: true }))

// Serve built frontend (production)
const frontendDist = join(__dir, '../../frontend/dist')
if (existsSync(frontendDist)) {
  app.use(express.static(frontendDist))
  app.get('*', (_, res) => res.sendFile(join(frontendDist, 'index.html')))
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Photobooth draait op http://0.0.0.0:${PORT}`)
})
