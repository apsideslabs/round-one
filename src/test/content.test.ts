import { describe, expect, it } from 'vitest'
import { logic } from '@/data/logic'
import { riddles } from '@/data/riddles'
import { memory } from '@/data/memory'
import { interview } from '@/data/interview'
import { guides } from '@/data/guides'
import { tracks } from '@/data/tracks'

const banks = [
  ...logic.map((q) => ({ ...q, bank: 'logic' })),
  ...riddles.map((q) => ({ ...q, bank: 'riddles' })),
  ...memory.flatMap((b) => b.questions.map((q) => ({ ...q, bank: `memory:${b.id}` })))
]

describe('question banks', () => {
  it('gives every question four options and an in-range answer', () => {
    for (const q of banks) {
      expect(q.options, `${q.id} options`).toHaveLength(4)
      expect(q.answer, `${q.id} answer index`).toBeGreaterThanOrEqual(0)
      expect(q.answer, `${q.id} answer index`).toBeLessThan(q.options.length)
      expect(new Set(q.options).size, `${q.id} duplicate options`).toBe(q.options.length)
      expect(q.why.length, `${q.id} explanation`).toBeGreaterThan(10)
    }
  })

  it('keeps ids unique', () => {
    const ids = banks.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('writes every panel question with four checks and a model answer', () => {
    for (const q of interview) {
      expect(q.checks).toHaveLength(4)
      expect(q.skeleton.length).toBeGreaterThanOrEqual(3)
      expect(q.model.length).toBeGreaterThan(40)
    }
  })

  it('has no empty guides and a stable slug per guide', () => {
    const slugs = guides.map((g) => g.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const g of guides) {
      expect(g.sections.length).toBeGreaterThanOrEqual(2)
      expect(g.sections.every((s) => s.body.length > 0)).toBe(true)
    }
  })

  it('derives a sensible maximum for every track', () => {
    for (const t of tracks) {
      expect(t.max).toBeGreaterThan(0)
      expect(t.weight).toBeGreaterThan(0)
    }
    const totalWeight = tracks.reduce((sum, t) => sum + t.weight, 0)
    expect(totalWeight).toBeCloseTo(1, 5)
  })
})
