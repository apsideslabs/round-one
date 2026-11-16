import { describe, expect, it } from 'vitest'
import { dilemmas, stageNames, type MoralOption } from '@/data/morality'
import { rate, schemaOf, schemas } from '@/lib/morality'

describe('moral dilemmas', () => {
  it('gives every dilemma four distinct, defensible options', () => {
    for (const d of dilemmas) {
      expect(d.options, d.id).toHaveLength(4)
      expect(new Set(d.options.map((o) => o.text)).size, d.id).toBe(4)
      for (const option of d.options) {
        expect(option.stage, `${d.id} stage`).toBeGreaterThanOrEqual(1)
        expect(option.stage, `${d.id} stage`).toBeLessThanOrEqual(6)
        expect(option.why.length, `${d.id} rationale`).toBeGreaterThan(30)
        expect(stageNames[option.stage]).toBeTruthy()
      }
    }
  })

  it('spreads options across all three schemas in every dilemma', () => {
    for (const d of dilemmas) {
      const buckets = new Set(d.options.map((o) => schemaOf(o.stage)))
      expect(buckets.size, `${d.id} covers only ${[...buckets].join(',')}`).toBe(3)
    }
  })

  it('keeps dilemma ids unique', () => {
    const ids = dilemmas.map((d) => d.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('rating', () => {
  const pick = (stage: 1 | 2 | 3 | 4 | 5 | 6, care = false): MoralOption => ({
    text: 'x',
    stage,
    care,
    why: 'x'
  })

  it('reports the dominant schema and its share', () => {
    const r = rate([pick(5), pick(6), pick(4), pick(2)])
    expect(r.dominant).toBe('post')
    expect(r.share.post).toBe(50)
    expect(r.share.norms).toBe(25)
    expect(r.share.personal).toBe(25)
    expect(r.mixed).toBe(false)
  })

  it('counts care choices separately from stage', () => {
    const r = rate([pick(3, true), pick(5, true), pick(4)])
    expect(r.care).toBe(2)
    expect(r.bySchema.personal).toBe(1)
    expect(r.bySchema.post).toBe(1)
    expect(r.bySchema.norms).toBe(1)
    expect(r.mixed).toBe(true)
  })

  it('never divides by zero', () => {
    const r = rate([])
    expect(r.total).toBe(0)
    expect(r.share.personal).toBe(0)
    expect(r.band.title).toBeTruthy()
  })

  it('maps stages onto Rest’s three schemas', () => {
    expect(schemaOf(1)).toBe('personal')
    expect(schemaOf(3)).toBe('personal')
    expect(schemaOf(4)).toBe('norms')
    expect(schemaOf(6)).toBe('post')
    expect(Object.keys(schemas)).toHaveLength(3)
  })
})
