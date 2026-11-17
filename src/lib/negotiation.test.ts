import { describe, expect, it } from 'vitest'
import { makeState, play, payslip, score, taxNewRegime, EMPLOYERS } from './negotiation'

describe('negotiation', () => {
  it('leveraged moves beat conceding on the same employer', () => {
    let a = makeState('service')
    for (const m of ['justify', 'competing', 'anchor'] as const) a = play(a, m)

    const b = play(makeState('service'), 'concede')

    expect(a.offer).toBeGreaterThan(b.offer)
    expect(b.outcome).toBe('lowball')
  })

  it('using a competing offer twice backfires', () => {
    let s = makeState('product')
    s = play(s, 'competing')
    const afterOne = s.offer
    const levOne = s.leverage
    s = play(s, 'competing')
    expect(s.offer).toBeLessThanOrEqual(afterOne)
    expect(s.leverage).toBeLessThan(levOne)
  })

  it('never exceeds the hidden ceiling', () => {
    let s = makeState('consultancy')
    for (const m of ['justify', 'competing', 'anchor', 'structure', 'justify'] as const) s = play(s, m)
    expect(s.offer).toBeLessThanOrEqual(EMPLOYERS.consultancy.ceiling + 0.001)
  })

  it('runs out of turns and settles', () => {
    let s = makeState('product')
    for (let i = 0; i < 10; i++) s = play(s, 'anchor')
    expect(s.over).toBe(true)
    expect(s.outcome).not.toBeNull()
  })

  it('asking for the annexure reveals the ceiling', () => {
    let s = makeState('consultancy')
    expect(s.revealedCeiling).toBe(false)
    s = play(s, 'annexure')
    expect(s.revealedCeiling).toBe(true)
    expect(s.log.at(-1)?.text).toMatch(/closes near/)
  })

  it('a product company pays more for the same moves than a service company', () => {
    const run = (id: 'service' | 'product') => {
      let s = makeState(id)
      for (const m of ['justify', 'competing', 'anchor'] as const) s = play(s, m)
      return s.offer - s.opening
    }
    expect(run('product')).toBeGreaterThan(run('service'))
  })

  it('builds a letter that adds up to the rupee', () => {
    const p = payslip(6, 12)
    expect(p.basic + p.hra + p.special).toBeCloseTo(p.fixedGross, 0)
    expect(p.variable).toBeCloseTo(72000, 0)
    expect(p.inHandMonthly).toBeGreaterThan(30000)
    expect(p.inHandMonthly).toBeLessThan(46000)
  })

  it('taxes the new regime correctly at the rebate edge', () => {
    expect(taxNewRegime(1200000)).toBe(0) // 87A wipes it
    expect(taxNewRegime(1600000)).toBeGreaterThan(90000)
    expect(taxNewRegime(0)).toBe(0)
  })

  it('charges the terms: a bond and a long notice cost real money', () => {
    const clean = { ...makeState('product') }
    const bound = { ...makeState('service'), bond: 2, notice: 3 }
    expect(score(bound).termsCost).toBeGreaterThan(score(clean).termsCost)
    expect(score(bound).notes.join(' ')).toMatch(/bond/)
  })

  it('trading a longer notice for fixed money moves the offer up', () => {
    const a = makeState('consultancy')
    const b = play(a, 'tradeNotice')
    expect(b.offer).toBeGreaterThan(a.offer)
    expect(b.notice).toBeGreaterThanOrEqual(3)
  })

  it('asking about urgency and variable payout reveals what they would hide', () => {
    let s = makeState('service')
    s = play(s, 'askUrgency')
    expect(s.log.at(-1)?.text).toMatch(/Thursday|seats/)
    s = play(s, 'askVariable')
    expect(s.log.at(-1)?.text).toMatch(/per cent of target/)
  })
})
