import { describe, expect, it } from 'vitest'
import { CODE_LENGTH, extendSequence, makeMathQuestion, randomCode, scoreGuess, sequenceScore } from '@/lib/games'
import { games } from '@/data/games'

describe('mastermind scoring', () => {
  it('counts exact and partial matches the way the board does', () => {
    expect(scoreGuess([1, 2, 3, 4], [1, 2, 3, 4])).toEqual({ exact: 4, partial: 0 })
    expect(scoreGuess([1, 2, 3, 4], [4, 3, 2, 1])).toEqual({ exact: 0, partial: 4 })
    expect(scoreGuess([1, 1, 2, 3], [1, 2, 3, 1])).toEqual({ exact: 1, partial: 3 })
    expect(scoreGuess([0, 0, 1, 1], [1, 1, 0, 0])).toEqual({ exact: 0, partial: 4 })
    expect(scoreGuess([0, 0, 0, 0], [5, 5, 5, 5])).toEqual({ exact: 0, partial: 0 })
  })

  it('never double-counts a peg', () => {
    // one peg of colour 2 in the secret cannot answer for two guesses of it
    expect(scoreGuess([2, 3, 4, 5], [2, 2, 2, 2])).toEqual({ exact: 1, partial: 0 })
  })

  it('generates a code of the right shape', () => {
    const code = randomCode()
    expect(code).toHaveLength(CODE_LENGTH)
    expect(code.every((c) => c >= 0 && c < 6)).toBe(true)
  })
})

describe('sequence', () => {
  it('grows by exactly one pad', () => {
    const a = extendSequence([])
    const b = extendSequence(a)
    expect(a).toHaveLength(1)
    expect(b).toHaveLength(2)
    expect(b.slice(0, 1)).toEqual(a)
  })

  it('scores nothing for a first-step failure and rises with span', () => {
    expect(sequenceScore(0)).toBe(0)
    expect(sequenceScore(1)).toBe(0)
    expect(sequenceScore(6)).toBe(50)
  })
})

describe('maths sprint', () => {
  it('always includes the answer among four distinct options', () => {
    for (let i = 0; i < 200; i++) {
      const q = makeMathQuestion(i % 12)
      expect(q.options).toHaveLength(4)
      expect(new Set(q.options).size).toBe(4)
      expect(q.options).toContain(q.answer)
      expect(q.prompt).toMatch(/^\d+ [+−×] \d+$/)
    }
  })

  it('computes the arithmetic it prints', () => {
    for (let i = 0; i < 100; i++) {
      const q = makeMathQuestion(3)
      const [a, op, b] = q.prompt.split(' ')
      const expected = op === '+' ? +a + +b : op === '−' ? +a - +b : +a * +b
      expect(q.answer).toBe(expected)
    }
  })
})

describe('arcade catalogue', () => {
  it('has a page for every game', () => {
    for (const game of games) {
      expect(game.path.startsWith('/arcade/')).toBe(true)
      expect(game.how.length).toBeGreaterThan(40)
    }
    expect(new Set(games.map((g) => g.id)).size).toBe(games.length)
  })
})
