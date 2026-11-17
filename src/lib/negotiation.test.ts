import { describe, expect, it } from 'vitest'
import { makeState, play, monthlyInHand } from './negotiation'

describe('negotiation', () => {
  it('leveraged moves beat conceding', () => {
    let a = makeState(3)
    for (const m of ['justify', 'competing', 'anchor'] as const) a = play(a, m)

    let b = makeState(3)
    b = play(b, 'concede')

    expect(a.offer).toBeGreaterThan(b.offer)
    expect(b.outcome).toBe('lowball') // accepting the opening number is the lowball outcome
  })

  it('using a competing offer twice backfires', () => {
    let s = makeState(1)
    s = play(s, 'competing')
    const afterOne = s.offer
    s = play(s, 'competing')
    expect(s.offer).toBeLessThanOrEqual(afterOne)
    expect(s.leverage).toBeLessThan(70)
  })

  it('never exceeds the hidden ceiling', () => {
    let s = makeState(2)
    for (const m of ['justify', 'competing', 'anchor', 'structure'] as const) s = play(s, m)
    expect(s.offer).toBeLessThanOrEqual(s.ceiling + 0.001)
  })

  it('runs out of turns and settles', () => {
    let s = makeState(4)
    for (let i = 0; i < 8; i++) s = play(s, 'anchor')
    expect(s.over).toBe(true)
    expect(s.outcome).not.toBeNull()
  })

  it('converts CTC to a monthly number', () => {
    expect(monthlyInHand(6)).toBeGreaterThan(35000)
    expect(monthlyInHand(6)).toBeLessThan(45000)
  })
})
