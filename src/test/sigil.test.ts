import { describe, expect, it } from 'vitest'
import { sigilPath, sigilPoints, sigilSeed } from '@/lib/sigil'
import { tracks } from '@/data/tracks'
import type { Scores } from '@/store/progress'

const empty = Object.fromEntries(tracks.map((t) => [t.id, 0])) as Scores
const full = Object.fromEntries(tracks.map((t) => [t.id, t.max])) as Scores

describe('sigil', () => {
  it('has one lobe per round', () => {
    expect(sigilPoints(empty)).toHaveLength(tracks.length)
  })

  it('grows the lobes as scores rise', () => {
    const a = sigilPoints(empty).map((p) => p.r)
    const b = sigilPoints(full).map((p) => p.r)
    b.forEach((r, i) => expect(r).toBeGreaterThan(a[i]))
  })

  it('draws a closed path with one curve per lobe', () => {
    const d = sigilPath(sigilPoints(empty, 120))
    expect(d.startsWith('M')).toBe(true)
    expect(d.endsWith('Z')).toBe(true)
    expect((d.match(/Q/g) ?? []).length).toBe(tracks.length)
    expect(d).not.toContain('NaN')
  })

  it('is deterministic for the same scores', () => {
    expect(sigilSeed(full)).toBe(sigilSeed(full))
    expect(sigilSeed(full)).not.toBe(sigilSeed(empty))
  })

  it('stays inside its box', () => {
    for (const p of sigilPoints(full, 120, 12)) {
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.x).toBeLessThanOrEqual(120)
      expect(p.y).toBeGreaterThanOrEqual(0)
      expect(p.y).toBeLessThanOrEqual(120)
    }
  })
})
