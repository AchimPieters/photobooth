import { Router } from 'express'

export const sessionRoutes = Router()

const sessions = new Map()

// Prune sessions older than 4 hours every 15 minutes
setInterval(() => {
  const cutoff = Date.now() - 4 * 60 * 60 * 1000
  for (const [id, s] of sessions) {
    if (new Date(s.createdAt).getTime() < cutoff) sessions.delete(id)
  }
}, 15 * 60 * 1000)

sessionRoutes.post('/', (req, res) => {
  const id = `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  sessions.set(id, {
    id,
    createdAt: new Date().toISOString(),
    status: 'pending',   // pending | paid | printed
    txId: `photobooth-${Date.now()}`,
    email: null,
    filter: null,
    stripUrl: null,
  })
  res.json({ sessionId: id, txId: sessions.get(id).txId })
})

sessionRoutes.get('/', (req, res) => {
  // Admin: list all sessions
  res.json([...sessions.values()].sort((a, b) =>
    new Date(b.createdAt) - new Date(a.createdAt)
  ))
})

sessionRoutes.get('/:id', (req, res) => {
  const session = sessions.get(req.params.id)
  if (!session) return res.status(404).json({ error: 'Sessie niet gevonden' })
  res.json(session)
})

sessionRoutes.patch('/:id', (req, res) => {
  const session = sessions.get(req.params.id)
  if (!session) return res.status(404).json({ error: 'Sessie niet gevonden' })
  const allowed = ['status', 'stripUrl', 'email', 'filter']
  for (const key of allowed) {
    if (req.body[key] !== undefined) session[key] = req.body[key]
  }
  res.json(session)
})
