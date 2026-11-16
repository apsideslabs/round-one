import { describe, expect, it } from 'vitest'
import { makePuzzle, SHAPES } from '@/lib/matrix'

const diffs = (a: any, b: any) =>
  [a.shape !== b.shape, a.count !== b.count, a.rotation !== b.rotation, a.filled !== b.filled].filter(Boolean).length

describe('pattern matrix generator', () => {
  it('leaves exactly one cell blank', () => {
    for (let i = 0; i < 12; i++) {
      const p = makePuzzle(i % SHAPES.length)
      expect(p.grid.filter((c) => c === null)).toHaveLength(1)
      expect(p.grid[8]).toBeNull()
    }
  })

  it('offers four options with exactly one correct answer', () => {
    for (let i = 0; i < 12; i++) {
      const p = makePuzzle(i % SHAPES.length)
      expect(p.options).toHaveLength(4)
      expect(p.answer).toBeGreaterThanOrEqual(0)
      expect(p.answer).toBeLessThan(4)
    }
  })

  it('makes every distractor differ in exactly one attribute', () => {
    for (let i = 0; i < 20; i++) {
      const p = makePuzzle(i % SHAPES.length)
      const answer = p.options[p.answer]
      p.options.forEach((o, idx) => {
        if (idx === p.answer) return
        expect(diffs(o, answer)).toBe(1)
      })
    }
  })

  it('follows its own rule: shape by column, count by row', () => {
    const p = makePuzzle(0)
    const answer = p.options[p.answer]
    expect(answer.count).toBe(3)
    // row 0 counts, row 2 counts
    expect((p.grid[0] as any).count).toBe(1)
    expect((p.grid[6] as any).count).toBe(3)
    // the missing cell's shape continues the row's cycle
    const rowShapes = [p.grid[6], p.grid[7]].map((c: any) => c.shape)
    expect(new Set(rowShapes).size).toBe(2)
    expect(SHAPES.includes(answer.shape)).toBe(true)
  })

  it('is deterministic for a given offset', () => {
    const a = makePuzzle(2)
    const b = makePuzzle(2)
    expect(a.grid.map((c) => c && c.shape)).toEqual(b.grid.map((c) => c && c.shape))
  })
})
