import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'
import { qrRoutes } from '../routes/qr.js'

function createApp() {
  const app = express()
  app.use('/api/qr', qrRoutes)
  return app
}

describe('QR routes', () => {
  const app = createApp()

  it('GET /api/qr?url=... — returns a PNG data URL', async () => {
    const res = await request(app)
      .get('/api/qr')
      .query({ url: 'https://example.com' })
      .expect(200)
    expect(res.body).toHaveProperty('qr')
    expect(res.body.qr).toMatch(/^data:image\/png;base64,/)
  })

  it('GET /api/qr — returns 400 when url param is missing', async () => {
    const res = await request(app).get('/api/qr').expect(400)
    expect(res.body).toHaveProperty('error')
  })

  it('GET /api/qr?url=... — generates different QR codes for different URLs', async () => {
    const [res1, res2] = await Promise.all([
      request(app).get('/api/qr').query({ url: 'https://foo.example.com' }),
      request(app).get('/api/qr').query({ url: 'https://bar.example.com' }),
    ])
    expect(res1.body.qr).not.toBe(res2.body.qr)
  })
})
