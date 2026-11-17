import { describe, expect, it } from 'vitest'
import { scoreAnswer, followUpFor } from './answerScore'

describe('answer rubric', () => {
  it('scores a strong answer high and a vague one low', () => {
    const strong = scoreAnswer(
      'I built the invoice generator in Flask for a 12-person shop. I stored paise as integers because float rounding broke the GST totals, which cut their monthly mismatch from about forty rows to zero.',
      { skill: 'Flask' }
    )
    const vague = scoreAnswer('We worked on a project together and it went well, basically it was good experience.', {})
    expect(strong.score).toBeGreaterThan(3.5)
    expect(vague.score).toBeLessThan(2.5)
  })

  it('names what is missing so the panel can ask for it', () => {
    const s = scoreAnswer('I made a website for our college fest and it was used by everyone in my batch.', {})
    expect(s.missing).toContain('number')
    expect(s.missing).toContain('result')
  })

  it('turns the weakest gap into the next question', () => {
    expect(followUpFor(['ownership', 'number']).ask).toMatch(/did you do yourself/i)
    expect(followUpFor(['number']).ask).toMatch(/give me a number/i)
    expect(followUpFor(['result']).ask).toMatch(/what changed/i)
  })
})
