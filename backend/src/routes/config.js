import { Router } from 'express'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))
const CONFIG_PATH = join(__dir, '../config.json')

function readConfig() {
  return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))
}

function writeConfig(data) {
  writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf8')
}

export const configRoutes = Router()

// Public: get config (minus adminPin and sumupKey)
configRoutes.get('/', (_, res) => {
  const cfg = readConfig()
  const { adminPin: _pin, sumupKey: _key, ...pub } = cfg
  res.json(pub)
})

// Admin: get full config (requires PIN in header)
configRoutes.get('/admin', (req, res) => {
  const cfg = readConfig()
  if (req.headers['x-admin-pin'] !== cfg.adminPin) {
    return res.status(401).json({ error: 'Ongeldige PIN' })
  }
  res.json(cfg)
})

// Admin: update config fields
configRoutes.patch('/admin', (req, res) => {
  const cfg = readConfig()
  if (req.headers['x-admin-pin'] !== cfg.adminPin) {
    return res.status(401).json({ error: 'Ongeldige PIN' })
  }
  const allowed = [
    'eventName', 'tagline', 'price', 'currency',
    'accentColor', 'logoUrl', 'brandText',
    'showEmailCapture', 'showFilters', 'adminPin',
    'sumupKey', 'printWidth',
  ]
  for (const key of allowed) {
    if (req.body[key] !== undefined) cfg[key] = req.body[key]
  }
  writeConfig(cfg)
  res.json(cfg)
})
