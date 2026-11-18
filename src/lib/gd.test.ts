import { describe, expect, it } from 'vitest'
import { makeGD, act, step, verdict } from './gd'

describe('group discussion', () => {
  it('quality beats quantity: few good moves outscore many empty ones', () => {
    // a realistic strong run: open, build, evidence, include, structure, then
    // summarise late — five or six contributions across the round
    let good = makeGD(0)
    good = act(good, 'open')
    good = act(good, 'connector')
    good = act(good, 'fact')
    good = act(good, 'include')
    good = act(good, 'structure')
    for (let i = 0; i < 12; i++) good = step(good)
    good = act(good, 'summarise')

    let loud = makeGD(0)
    for (let i = 0; i < 6; i++) loud = act(loud, 'interrupt')

    expect(verdict(good).total).toBeGreaterThan(verdict(loud).total + 5)
    expect(verdict(good).advance).toBe(true)
    expect(verdict(loud).advance).toBe(false)
  })

  it('silence scores zero and says so', () => {
    const quiet = makeGD(0)
    const v = verdict(quiet)
    expect(v.total).toBeLessThan(10)
    expect(v.notes.join(' ')).toMatch(/never spoke/i)
  })

  it('naming someone else is what listening is scored on', () => {
    let s = makeGD(0)
    s = act(s, 'open')
    const before = s.scores.listening
    s = act(s, 'connector')
    expect(s.scores.listening).toBeGreaterThan(before)
    expect(s.log.at(-1)?.text).toMatch(/Building on/)
  })

  it('summarising too early is penalised, late is rewarded', () => {
    let early = makeGD(0)
    early = act(early, 'summarise')
    const earlyLeadership = early.scores.leadership

    let late = makeGD(0)
    for (let i = 0; i < 18; i++) late = step(late)
    late = act(late, 'summarise')
    expect(late.scores.leadership).toBeGreaterThan(earlyLeadership)
  })

  it('the discussion ends at twelve minutes', () => {
    let s = makeGD(0)
    for (let i = 0; i < 30; i++) s = step(s)
    expect(s.over).toBe(true)
    expect(s.minute).toBeGreaterThanOrEqual(12)
  })

  it('interrupting is the most expensive thing you can do', () => {
    let a = makeGD(0)
    a = act(a, 'open')
    const base = a.scores.teamwork
    a = act(a, 'interrupt')
    expect(a.scores.teamwork).toBeLessThan(base)
  })
})
