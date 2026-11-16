/** Visual attention: one tile in the grid differs in exactly one attribute. */
export type Shape = 'square' | 'circle' | 'diamond' | 'triangle'

export interface TileStyle {
  shape: Shape
  colour: string
  size: number
  rotate: number
  radius: number
}

export interface OddTileRound {
  size: number
  tiles: TileStyle[]
  oddIndex: number
}

const COLOURS = ['#ff4b26', '#0e8c6a', '#2f5bff', '#be123c', '#7c3f00', '#0e7490']
const SHAPES: Shape[] = ['square', 'circle', 'diamond', 'triangle']

const pick = <T,>(arr: T[], rand: () => number) => arr[Math.floor(rand() * arr.length)]

/**
 * Difficulty rises two ways: the grid grows, and the difference between the
 * odd tile and its neighbours shrinks.
 */
export function makeRound(level: number, rand: () => number = Math.random): OddTileRound {
  const gridSize = level < 3 ? 3 : level < 7 ? 4 : level < 12 ? 5 : 6
  const subtlety = Math.min(0.9, level / 14)

  const base: TileStyle = {
    shape: pick(SHAPES, rand),
    colour: pick(COLOURS, rand),
    size: 1,
    rotate: 0,
    radius: 18
  }

  const attribute = pick(['rotate', 'size', 'radius'] as const, rand)
  const odd: TileStyle = { ...base }

  if (attribute === 'rotate') odd.rotate = 12 + subtlety * 18
  if (attribute === 'size') odd.size = 1 - (0.14 - subtlety * 0.06)
  if (attribute === 'radius') odd.radius = base.radius + 30 - subtlety * 18

  const count = gridSize * gridSize
  const oddIndex = Math.floor(rand() * count)
  const tiles = Array.from({ length: count }, (_, i) => (i === oddIndex ? odd : { ...base }))

  return { size: gridSize, tiles, oddIndex }
}
