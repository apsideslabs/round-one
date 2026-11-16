import { describe, expect, it } from 'vitest'
import { makeRound } from '@/lib/oddTile'

/** Deterministic pseudo-random so the generator can be tested. */
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

describe('odd tile generator', () => {
  it('makes a square grid with exactly one odd tile', () => {
    for (let level = 0; level < 20; level++) {
      const round = makeRound(level, seeded(level + 1))
      expect(round.tiles).toHaveLength(round.size * round.size)
      expect(round.oddIndex).toBeGreaterThanOrEqual(0)
      expect(round.oddIndex).toBeLessThan(round.tiles.length)
    }
  })

  it('grows the grid with level', () => {
    expect(makeRound(0, seeded(3)).size).toBe(3)
    expect(makeRound(8, seeded(3)).size).toBe(5)
    expect(makeRound(20, seeded(3)).size).toBe(6)
  })

  it('differs from the rest in exactly one attribute', () => {
    for (let level = 0; level < 25; level++) {
      const round = makeRound(level, seeded(level + 7))
      const odd = round.tiles[round.oddIndex]
      const base = round.tiles.find((_, i) => i !== round.oddIndex)!
      const diffs = [
        odd.shape !== base.shape,
        odd.colour !== base.colour,
        odd.size !== base.size,
        odd.rotate !== base.rotate,
        odd.radius !== base.radius
      ].filter(Boolean).length
      expect(diffs, `level ${level}`).toBe(1)
    }
  })

  it('keeps the difference findable but not trivial', () => {
    const round = makeRound(10, seeded(11))
    const odd = round.tiles[round.oddIndex]
    const base = round.tiles.find((_, i) => i !== round.oddIndex)!
    const magnitude = Math.abs(odd.rotate - base.rotate) + Math.abs(odd.size - base.size) * 100 + Math.abs(odd.radius - base.radius)
    expect(magnitude).toBeGreaterThan(2)
    expect(magnitude).toBeLessThan(40)
  })
})
