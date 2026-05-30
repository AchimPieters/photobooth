import { describe, it, expect, vi } from 'vitest'
import { buildStrip, buildPrintSheet, stripLayout } from '../utils/photoStrip'

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

describe('buildPrintSheet', () => {
  it('geeft null terug voor lege array', async () => {
    const result = await buildPrintSheet([])
    expect(result).toBeNull()
  })

  it('geeft een data-URL terug (4×6"-vel met 2 strips)', async () => {
    const result = await buildPrintSheet(['a', 'b', 'c', 'd'])
    expect(result).toMatch(/^data:/)
  })

  it('verwerkt een optionele event-template overlay', async () => {
    const result = await buildPrintSheet(['a'], { overlay: 'data:image/png;base64,AAAA' })
    expect(result).toMatch(/^data:/)
  })
})

describe('stripLayout', () => {
  it('verdeelt het gebied in evenveel cellen als foto\'s', () => {
    const { cells, footer } = stripLayout(600, 1800, 4, true)
    expect(cells).toHaveLength(4)
    expect(footer).not.toBeNull()
  })

  it('laat de footer-zone weg zonder footer', () => {
    const { footer } = stripLayout(600, 1800, 3, false)
    expect(footer).toBeNull()
  })

  it('houdt cellen binnen de breedte', () => {
    const { cells } = stripLayout(600, 1800, 4, true)
    cells.forEach(c => {
      expect(c.x).toBeGreaterThanOrEqual(0)
      expect(c.x + c.w).toBeLessThanOrEqual(600)
    })
  })
})
