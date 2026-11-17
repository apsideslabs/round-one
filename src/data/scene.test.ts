import { describe, expect, it } from 'vitest'
import { QUESTIONS, FOLLOWUPS, cvQuestions, drawQuestions, type Opt } from './scene'

describe('interview bank', () => {
  it('every question has four answers, a model line and a reason', () => {
    for (const q of QUESTIONS) {
      expect(q.opts.length, q.id).toBe(4)
      expect(q.model.length, q.id).toBeGreaterThan(60)
      expect(q.why.length, q.id).toBeGreaterThan(30)
      expect(q.opts.some((o) => o.grade === 'strong'), q.id).toBe(true)
      expect(q.opts.some((o) => o.grade === 'weak'), q.id).toBe(true)
    }
  })

  it('every follow-up belongs to a real question and is itself complete', () => {
    const ids = new Set(QUESTIONS.map((q) => q.id))
    for (const [id, f] of Object.entries(FOLLOWUPS)) {
      expect(ids.has(id), id).toBe(true)
      expect(f.opts.length).toBe(4)
      expect(f.model.length).toBeGreaterThan(50)
      expect(f.ask.length).toBeGreaterThan(10)
    }
  })

  it('a draw is twelve questions, two per round', () => {
    const picked = drawQuestions()
    expect(picked.length).toBeGreaterThanOrEqual(10)
    const byRound = new Map<string, number>()
    for (const q of picked) byRound.set(q.round, (byRound.get(q.round) ?? 0) + 1)
    for (const [, count] of byRound) expect(count).toBeLessThanOrEqual(2)
  })

  it('cv questions adapt to the skills and the gaps found', () => {
    const withInternship = cvQuestions({ skills: ['React', 'SQL'], hasInternship: true, cgpa: 8.2 })
    expect(withInternship.length).toBe(3)
    expect(withInternship[0].ask).toContain('React')
    expect(withInternship[1].ask.toLowerCase()).toContain('internship')

    const without = cvQuestions({ skills: ['Python'], hasInternship: false, cgpa: 6.1 })
    expect(without.length).toBe(4)
    expect(without.some((q) => q.id === 'cv-cgpa')).toBe(true)
  })
})

describe('follow-up pressure', () => {
  it('a strong answer earns a push-back, a weak one does not', async () => {
    const { followFor } = await import('./scene')
    const strong: Opt = { label: 'x', fx: [1, 1, 1], grade: 'strong', heard: 'x' }
    const weak: Opt = { label: 'y', fx: [-1, -1, -1], grade: 'weak', heard: 'y' }
    expect(followFor('i1', strong)).toBeDefined()
    expect(followFor('i1', weak)).toBeUndefined()
    expect(followFor('i2', strong)).toBeUndefined()
  })

  it('every draw contains at least two follow-ups', async () => {
    const { drawQuestions, FOLLOWUPS } = await import('./scene')
    for (let i = 0; i < 25; i++) {
      const picked = drawQuestions()
      expect(picked.filter((q) => FOLLOWUPS[q.id]).length).toBeGreaterThanOrEqual(2)
    }
  })
})
