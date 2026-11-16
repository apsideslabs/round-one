import { describe, expect, it } from 'vitest'
import { currentStreak, lastSeven, today } from '@/lib/streak'

const dayAgo = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

describe('streak', () => {
  it('is zero with no activity', () => {
    expect(currentStreak([])).toBe(0)
  })

  it('counts consecutive days including today', () => {
    expect(currentStreak([dayAgo(0), dayAgo(1), dayAgo(2)])).toBe(3)
  })

  it('still counts a streak that ended yesterday', () => {
    expect(currentStreak([dayAgo(1), dayAgo(2)])).toBe(2)
  })

  it('stops at the first gap', () => {
    expect(currentStreak([dayAgo(0), dayAgo(2), dayAgo(3)])).toBe(1)
  })

  it('returns seven day cells ending today', () => {
    const week = lastSeven([today()])
    expect(week).toHaveLength(7)
    expect(week[6].isToday).toBe(true)
    expect(week[6].done).toBe(true)
    expect(week.slice(0, 6).every((d) => !d.done)).toBe(true)
  })
})
