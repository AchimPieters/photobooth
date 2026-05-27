import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'
import { sessionRoutes } from '../routes/sessions.js'

function createApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/sessions', sessionRoutes)
  return app
}

describe('Session routes', () => {
  const app = createApp()

  it('POST /api/sessions — creates a session with a valid id', async () => {
    const res = await request(app).post('/api/sessions').expect(200)
    expect(res.body).toHaveProperty('sessionId')
    expect(res.body.sessionId).toMatch(/^session-/)
  })

  it('GET /api/sessions/:id — returns the session', async () => {
    const { body: { sessionId } } = await request(app).post('/api/sessions')
    const res = await request(app).get(`/api/sessions/${sessionId}`).expect(200)
    expect(res.body.id).toBe(sessionId)
    expect(res.body.status).toBe('pending')
    expect(res.body.stripUrl).toBeNull()
    expect(res.body).toHaveProperty('createdAt')
  })

  it('GET /api/sessions/:id — returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/sessions/does-not-exist').expect(404)
    expect(res.body).toHaveProperty('error')
  })

  it('PATCH /api/sessions/:id — updates the status field', async () => {
    const { body: { sessionId } } = await request(app).post('/api/sessions')
    const res = await request(app)
      .patch(`/api/sessions/${sessionId}`)
      .send({ status: 'paid' })
      .expect(200)
    expect(res.body.status).toBe('paid')
    expect(res.body.id).toBe(sessionId)
  })

  it('PATCH /api/sessions/:id — updates the stripUrl field', async () => {
    const { body: { sessionId } } = await request(app).post('/api/sessions')
    const res = await request(app)
      .patch(`/api/sessions/${sessionId}`)
      .send({ stripUrl: 'https://example.com/strip.jpg' })
      .expect(200)
    expect(res.body.stripUrl).toBe('https://example.com/strip.jpg')
  })

  it('PATCH /api/sessions/:id — returns 404 for unknown id', async () => {
    const res = await request(app)
      .patch('/api/sessions/does-not-exist')
      .send({ status: 'paid' })
      .expect(404)
    expect(res.body).toHaveProperty('error')
  })
})
