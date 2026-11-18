import { describe, expect, it } from 'vitest'
import { TAPE, beatAt, attentionAt, tapeDuration, turningPoints } from './tape'

describe('interview tape', () => {
  it('runs in order and ends at the last beat', () => {
    const times = TAPE.map((b) => b.t)
    expect([...times].sort((a, b) => a - b)).toEqual(times)
    expect(tapeDuration(TAPE)).toBe(84)
  })

  it('finds the beat in force at any second', () => {
    expect(beatAt(TAPE, 0).t).toBe(0)
    expect(beatAt(TAPE, 20).t).toBe(18)
    expect(beatAt(TAPE, 83).t).toBe(70)
    expect(beatAt(TAPE, 999).t).toBe(84)
  })

  it('interpolates attention between beats', () => {
    const mid = attentionAt(TAPE, 13) // between t=8 (64) and t=18 (41)
    expect(mid).toBeLessThan(64)
    expect(mid).toBeGreaterThan(41)
  })

  it('identifies where the room was lost and where it nearly came back', () => {
    const { low, high } = turningPoints(TAPE)
    expect(low.t).toBe(84) // the "we will get back to you"
    expect(high.t).toBe(0)
    expect(TAPE.some((b) => b.t === 52 && b.attention > 60)).toBe(true)
  })

  it('every beat that loses attention has something to learn from', () => {
    for (const b of TAPE) {
      if (b.who === 'you' && b.attention < 45) expect(b.ghost ?? b.note).toBeTruthy()
    }
  })
})
