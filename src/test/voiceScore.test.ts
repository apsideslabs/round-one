import { describe, expect, it } from 'vitest'
import { scoreDelivery } from '@/lib/voiceScore'

describe('delivery scoring', () => {
  it('calls a three-second answer too brief', () => {
    expect(scoreDelivery(3, 'yes I did').verdict).toBe('too-brief')
  })

  it('flags a rushed pace', () => {
    const words = Array.from({ length: 200 }, () => 'word').join(' ')
    expect(scoreDelivery(40, words).verdict).toBe('rushed')
  })

  it('accepts a measured answer', () => {
    const words = Array.from({ length: 150 }, () => 'word').join(' ')
    const d = scoreDelivery(70, words)
    expect(d.verdict).toBe('measured')
    expect(d.pace).toBeGreaterThan(100)
  })

  it('counts fillers and rates them', () => {
    const d = scoreDelivery(30, 'um so like I basically did um the thing')
    expect(d.fillers).toBeGreaterThanOrEqual(3)
    expect(d.fillerRate).toBeGreaterThan(0)
  })

  it('survives an empty transcript', () => {
    const d = scoreDelivery(20, '')
    expect(d.words).toBe(0)
    expect(d.notes.join(' ')).toMatch(/No transcript/)
  })

  it('flags rambling past two and a half minutes', () => {
    const words = Array.from({ length: 330 }, () => 'word').join(' ')
    expect(scoreDelivery(170, words).verdict).toBe('rambling')
  })
})
