import { describe, expect, it } from 'vitest'
import { parseAnswer, classify, substance, beatAt } from './kinetic'
import { sampleMonth, totalMinutes, longestGap } from './trails'
import { FRAMES, frameAt } from './zoetrope'

describe('kinetic typography', () => {
  const answer =
    'I am a final year student. Basically I did a project with my team. It was a billing app in Flask, and I found a GST rounding bug that cost one paisa. We reduced manual checks from four hours to twenty minutes.'

  it('splits an answer into timed beats that cover the whole film', () => {
    const beats = parseAnswer(answer, 18)
    expect(beats.length).toBeGreaterThan(4)
    expect(beats[0].start).toBe(0)
    const end = beats.at(-1)!.start + beats.at(-1)!.dur
    expect(end).toBeCloseTo(18, 1)
  })

  it('marks numbers, vague words and specifics differently', () => {
    expect(classify('we cut it from four hours to twenty minutes')).toBe('number')
    expect(classify('basically it was kind of good')).toBe('vague')
    expect(classify('I used Flask and Postgres')).toBe('specific')
  })

  it('scores how much of the answer carries weight', () => {
    const s = substance(parseAnswer(answer))
    expect(s.scored).toBeGreaterThan(1)
    expect(s.ratio).toBeGreaterThan(0)
    expect(s.ratio).toBeLessThanOrEqual(1)
  })

  it('finds the beat playing at a given second', () => {
    const beats = parseAnswer(answer)
    expect(beatAt(beats, 0).start).toBe(0)
    expect(beatAt(beats, 999)).toBe(beats.at(-1))
  })
})

describe('light trails', () => {
  it('produces thirty days with realistic gaps', () => {
    const days = sampleMonth(7)
    expect(days).toHaveLength(30)
    expect(days.some((d) => d.gap)).toBe(true)
    expect(days.some((d) => !d.gap)).toBe(true)
    expect(totalMinutes(days)).toBeGreaterThan(100)
  })

  it('is deterministic for a seed', () => {
    expect(sampleMonth(3).map((d) => d.minutes)).toEqual(sampleMonth(3).map((d) => d.minutes))
  })

  it('finds the longest stretch of nothing', () => {
    const days = sampleMonth(7)
    expect(longestGap(days)).toBeGreaterThanOrEqual(1)
  })
})

describe('zoetrope', () => {
  it('has twelve frames that tell a round', () => {
    expect(FRAMES).toHaveLength(12)
    expect(new Set(FRAMES.map((f) => f.note)).size).toBe(12)
  })

  it('advances frames with speed and wraps around', () => {
    expect(frameAt(0, 60).index).toBe(0)
    expect(frameAt(180, 60).index).toBe(0) // full revolution
    expect(frameAt(30, 60).index).toBeGreaterThan(0)
  })
})
