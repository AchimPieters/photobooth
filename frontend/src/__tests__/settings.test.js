import { describe, it, expect, beforeEach } from 'vitest'
import { getSettings, saveSettings } from '../utils/settings'

const KEY = 'pb_settings'

describe('settings — stripTemplates per papierformaat', () => {
  beforeEach(() => localStorage.clear())

  it('default heeft een lege stripTemplates-map', () => {
    const s = getSettings()
    expect(s.stripTemplates).toEqual({})
  })

  it('migreert oude losse stripTemplate naar de map onder het strip-papier', () => {
    // Simuleer opgeslagen oude data (losse template + L-printer).
    localStorage.setItem(KEY, JSON.stringify({
      stripTemplate: 'data:image/png;base64,OLD',
      printers: [{ id: 'p1', name: 'SELPHY', paper: 'L' }],
      stripPrinterId: 'p1',
    }))
    const s = getSettings()
    expect(s.stripTemplates).toEqual({ L: 'data:image/png;base64,OLD' })
    expect(s.stripTemplate).toBeUndefined()
  })

  it('bewaart aparte templates per papierformaat', () => {
    saveSettings({ stripTemplates: { L: 'data:L', postcard: 'data:PC' } })
    const s = getSettings()
    expect(s.stripTemplates.L).toBe('data:L')
    expect(s.stripTemplates.postcard).toBe('data:PC')
  })
})
