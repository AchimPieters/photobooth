import { Router } from 'express'

export const sessionRoutes = Router()

// In-memory sessie opslag (vervang door database voor productie)
const sessions = new Map()

// Nieuwe sessie aanmaken
sessionRoutes.post('/', (req, res) => {
  const id = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  sessions.set(id, {
    id,
    createdAt: new Date().toISOString(),
    status: 'pending', // pending | paid | printed
    stripUrl: null,
  })
  res.json({ sessionId: id })
})

// Sessie ophalen
sessionRoutes.get('/:id', (req, res) => {
  const session = sessions.get(req.params.id)
  if (!session) return res.status(404).json({ error: 'Sessie niet gevonden' })
  res.json(session)
})

// Sessie updaten (bijv. na betaling)
sessionRoutes.patch('/:id', (req, res) => {
  const session = sessions.get(req.params.id)
  if (!session) return res.status(404).json({ error: 'Sessie niet gevonden' })
  Object.assign(session, req.body)
  res.json(session)
})
