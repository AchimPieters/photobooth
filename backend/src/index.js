import express from 'express'
import cors from 'cors'
import { sessionRoutes } from './routes/sessions.js'
import { qrRoutes } from './routes/qr.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/sessions', sessionRoutes)
app.use('/api/qr', qrRoutes)

// Health check
app.get('/health', (_, res) => res.json({ ok: true }))

app.listen(PORT, () => {
  console.log(`Photobooth backend draait op http://localhost:${PORT}`)
})
