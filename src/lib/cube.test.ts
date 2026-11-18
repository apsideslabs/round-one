import { describe, expect, it } from 'vitest'
import { makeCube, turn, applyMoves, isSolved, parseMove, invert, scramble, notation } from './cube'

describe('rubik cube model', () => {
  it('starts solved with 26 cubies', () => {
    const c = makeCube()
    expect(c).toHaveLength(26)
    expect(isSolved(c)).toBe(true)
  })

  it('four turns of one face return the cube to solved', () => {
    let c = makeCube()
    for (let i = 0; i < 4; i++) c = turn(c, parseMove('R'))
    expect(isSolved(c)).toBe(true)
  })

  it('a move and its inverse cancel', () => {
    let c = makeCube()
    c = turn(c, parseMove("U'"))
    c = turn(c, invert(parseMove("U'")))
    expect(isSolved(c)).toBe(true)
  })

  it('a scramble is never solved, and its inverse solves it', () => {
    for (let trial = 0; trial < 20; trial++) {
      const moves = scramble(18)
      const c = applyMoves(makeCube(), moves)
      expect(isSolved(c)).toBe(false)
      const back = applyMoves(c, [...moves].reverse().map(invert))
      expect(isSolved(back)).toBe(true)
    }
  })

  it('turning a face moves exactly the nine cubies in that layer', () => {
    const c = makeCube()
    const after = turn(c, parseMove('U'))
    const moved = after.filter((x, i) => x.pos.join() !== c[i].pos.join() || x.rot.join() !== c[i].rot.join())
    // nine cubies sit in the layer; the face centre spins in place, so its
    // position is unchanged but its orientation is not
    expect(moved).toHaveLength(9)
    const centre = after.find((x) => x.pos.join() === '0,1,0')!
    expect(centre.rot.join()).not.toBe('1,0,0,0,1,0,0,0,1')
  })

  it('does not repeat a face twice in a row when scrambling', () => {
    for (let i = 0; i < 50; i++) {
      const s = scramble(20).map(notation)
      for (let k = 1; k < s.length; k++) expect(s[k][0]).not.toBe(s[k - 1][0])
    }
  })
})
