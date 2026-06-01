import { describe, it, expect } from 'vitest'
import { passportGrid, passportCount } from '../utils/passportStrip'

describe('passportGrid / passportCount', () => {
  it('L-formaat (89×119 mm) → 2×2 = 4 pasfoto\'s', () => {
    expect(passportGrid('L')).toMatchObject({ cols: 2, rows: 2, count: 4 })
    expect(passportCount('L')).toBe(4)
  })

  it('Postcard (100×148 mm) → meer foto\'s dan L', () => {
    expect(passportCount('postcard')).toBeGreaterThan(passportCount('L'))
  })

  it('Card (54×86 mm) → past maar één pasfoto', () => {
    expect(passportCount('card')).toBe(1)
  })

  it('max 2 kolommen, ongeacht velbreedte', () => {
    expect(passportGrid('postcard').cols).toBeLessThanOrEqual(2)
  })

  it('onbekend formaat valt terug op default (L) → 4', () => {
    expect(passportCount(undefined)).toBe(4)
  })
})
