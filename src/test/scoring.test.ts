import { describe, expect, it } from 'vitest'
import { readiness, bestOf } from '@/lib/scoring'
import { tracks } from '@/data/tracks'

const zero = { logic: 0, memory: 0, riddles: 0, panel: 0, morality: 0 }

describe('readiness', () => {
  it('is zero with no attempts', () => {
    expect(readiness(zero)).toBe(0)
  })

  it('is 100 when every round is maxed', () => {
    const full = Object.fromEntries(tracks.map((t) => [t.id, t.max])) as typeof zero
    expect(readiness(full)).toBe(100)
  })

  it('weights the rounds rather than averaging them', () => {
    const logicOnly = { ...zero, logic: tracks[0].max }
    const memoryOnly = { ...zero, memory: tracks[1].max }
    expect(readiness(logicOnly)).toBe(25)
    expect(readiness(memoryOnly)).toBe(15)
  })

  it('never lets a score exceed the maximum', () => {
    expect(bestOf({ ...zero, logic: 9999 }, 'logic')).toBe(tracks[0].max)
  })
})
