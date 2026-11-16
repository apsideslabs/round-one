import { describe, expect, it } from 'vitest'
import { estimates, triageScenarios, bugQuestions } from '@/data/simulations'
import { estimateScore, rubricOrder, triageScore } from '@/lib/simulations'

describe('estimate scoring', () => {
  it('gives full marks inside 50% either way', () => {
    expect(estimateScore(150, 150).points).toBe(100)
    expect(estimateScore(100, 150).points).toBe(100)
    expect(estimateScore(200, 150).points).toBe(100)
  })

  it('falls off with the ratio, not the absolute gap', () => {
    expect(estimateScore(450, 150).points).toBe(70) // 3×
    expect(estimateScore(50, 150).points).toBe(70) // 3× under
    expect(estimateScore(1500, 150).points).toBe(40) // 10×
    expect(estimateScore(15000, 150).points).toBe(10)
  })

  it('never divides by zero', () => {
    expect(estimateScore(0, 150).points).toBe(0)
    expect(estimateScore(-5, 150).points).toBe(0)
  })

  it('has a model chain for every question', () => {
    for (const e of estimates) {
      expect(e.model.length).toBeGreaterThanOrEqual(3)
      expect(e.answer).toBeGreaterThan(0)
      expect(e.unit.length).toBeGreaterThan(2)
    }
  })
})

describe('triage scoring', () => {
  it('ranks by impact × urgency', () => {
    const s = triageScenarios[0]
    const order = rubricOrder(s.items)
    expect(order[0]).toBe('checkout')
    expect(order[order.length - 1]).toBe('docs')
  })

  it('scores a perfect order at 100 and a reversed one lower', () => {
    const s = triageScenarios[0]
    const rubric = rubricOrder(s.items)
    expect(triageScore(s, rubric).points).toBe(100)
    expect(triageScore(s, [...rubric].reverse()).points).toBeLessThan(100)
  })

  it('gives every item a rationale and distinct ids', () => {
    for (const s of triageScenarios) {
      expect(s.items).toHaveLength(5)
      expect(new Set(s.items.map((i) => i.id)).size).toBe(5)
      for (const item of s.items) expect(item.why.length).toBeGreaterThan(40)
    }
  })
})

describe('bug questions', () => {
  it('has one correct answer and a mechanism-level explanation', () => {
    for (const q of bugQuestions) {
      expect(q.options).toHaveLength(4)
      expect(q.answer).toBeGreaterThanOrEqual(0)
      expect(q.answer).toBeLessThan(4)
      expect(q.why.length).toBeGreaterThan(50)
      expect(q.code.length).toBeGreaterThan(30)
    }
  })
})
