import { describe, it, expect, vi } from 'vitest'
import { buildStrip } from '../utils/photoStrip'

// Mock Image zodat onload direct vuurt
global.Image = class {
  constructor() {
    setTimeout(() => { if (this.onload) this.onload() }, 0)
  }
  set src(_) {}
}

describe('buildStrip', () => {
  it('geeft null terug voor lege array', async () => {
    const result = await buildStrip([])
    expect(result).toBeNull()
  })

  it('geeft een data-URL terug voor 4 foto\'s', async () => {
    const photos = ['a','b','c','d']
    const result = await buildStrip(photos)
    expect(result).toMatch(/^data:/)
  })

  it('geeft een data-URL terug voor 1 foto', async () => {
    const result = await buildStrip(['single'])
    expect(result).toMatch(/^data:/)
  })

  it('gebruikt aangepaste footerText', async () => {
    const result = await buildStrip(['a'], { footerText: 'Test Event' })
    expect(result).toBeTruthy()
  })
})
