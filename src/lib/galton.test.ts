import { describe, expect, it } from 'vitest'
import { analytic, dropOne, band, ROWS_FROM_SCORES } from './galton'

describe('galton board', () => {
  it('a fair board is binomial and sums to one', () => {
    const rows = ROWS_FROM_SCORES(['ok', 'ok', 'ok', 'ok'], ['a', 'b', 'c', 'd'])
    const d = analytic(rows)
    expect(d.length).toBe(5)
    expect(d.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 6)
    expect(d[2]).toBeCloseTo(0.375, 4) // C(4,2)/16
  })

  it('strong answers shift the distribution right', () => {
    const strong = analytic(ROWS_FROM_SCORES(Array(8).fill('strong') as never, []))
    const weak = analytic(ROWS_FROM_SCORES(Array(8).fill('weak') as never, []))
    const mean = (d: number[]) => d.reduce((a, v, i) => a + v * i, 0)
    expect(mean(strong)).toBeGreaterThan(mean(weak) + 3)
  })

  it('simulation agrees with the exact distribution', () => {
    const rows = ROWS_FROM_SCORES(['strong', 'ok', 'weak', 'strong'], ['a', 'b', 'c', 'd'])
    const exact = analytic(rows)
    const counts = new Array(5).fill(0)
    const N = 40000
    let seed = 7
    const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648)
    for (let i = 0; i < N; i++) counts[dropOne(rows, rand).score]++
    counts.forEach((c, i) => expect(Math.abs(c / N - exact[i])).toBeLessThan(0.02))
  })

  it('bands a score against the number of rows', () => {
    expect(band(7, 8)).toBe('offer')
    expect(band(4, 8)).toBe('borderline')
    expect(band(2, 8)).toBe('reject')
  })
})
