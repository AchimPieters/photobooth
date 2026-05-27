import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'

const app = express()
app.get('/health', (_, res) => res.json({ ok: true }))

describe('GET /health', () => {
  it('returns { ok: true }', async () => {
    const res = await request(app).get('/health').expect(200)
    expect(res.body).toEqual({ ok: true })
  })
})
