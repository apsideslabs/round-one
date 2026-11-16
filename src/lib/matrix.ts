/** Raven-style matrices: three attributes vary along rows and columns. */

export type Shape = 'circle' | 'square' | 'triangle' | 'diamond' | 'hex'
export const SHAPES: Shape[] = ['circle', 'square', 'triangle', 'diamond', 'hex']

export interface Cell {
  shape: Shape
  count: number
  rotation: number
  filled: boolean
}

export interface Puzzle {
  grid: Array<Cell | null>
  options: Cell[]
  answer: number
  rule: string
}

const ROTATIONS = [0, 45, 90, 135]

function cellAt(row: number, col: number, shapeOffset: number): Cell {
  return {
    shape: SHAPES[(col + shapeOffset) % SHAPES.length],
    count: row + 1,
    rotation: ROTATIONS[col % ROTATIONS.length],
    filled: (row + col) % 2 === 0
  }
}

const same = (a: Cell, b: Cell) =>
  a.shape === b.shape && a.count === b.count && a.rotation === b.rotation && a.filled === b.filled

function differsInOne(a: Cell, b: Cell): boolean {
  let diffs = 0
  if (a.shape !== b.shape) diffs++
  if (a.count !== b.count) diffs++
  if (a.rotation !== b.rotation) diffs++
  if (a.filled !== b.filled) diffs++
  return diffs === 1
}

export function makePuzzle(shapeOffset = Math.floor(Math.random() * SHAPES.length)): Puzzle {
  const grid: Array<Cell | null> = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      grid.push(r === 2 && c === 2 ? null : cellAt(r, c, shapeOffset))
    }
  }

  const answerCell = cellAt(2, 2, shapeOffset)

  // three near misses, each wrong in exactly one attribute
  const shapeIdx = SHAPES.indexOf(answerCell.shape)
  const candidates: Cell[] = [
    { ...answerCell, shape: SHAPES[(shapeIdx + 1) % SHAPES.length] },
    { ...answerCell, count: (answerCell.count % 3) + 1 },
    { ...answerCell, rotation: ROTATIONS[(ROTATIONS.indexOf(answerCell.rotation) + 1) % ROTATIONS.length] },
    { ...answerCell, filled: !answerCell.filled }
  ].filter((c) => differsInOne(c, answerCell))

  const options = [answerCell, ...candidates.slice(0, 3)]
  // deterministic-ish shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[options[i], options[j]] = [options[j], options[i]]
  }

  return {
    grid,
    options,
    answer: options.findIndex((o) => same(o, answerCell)),
    rule: 'Shape and rotation shift across each row, the number of shapes grows down each column, and the fill alternates like a chessboard.'
  }
}
