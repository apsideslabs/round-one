/**
 * A 3×3×3 cube as a real model: 27 cubies, each with an integer position and a
 * rotation matrix. Moves are matrix multiplication, not animation state, so the
 * cube is always consistent no matter how the render animates it.
 */
export type Vec3 = [number, number, number]
export type Mat3 = [number, number, number, number, number, number, number, number, number]

export interface Cubie {
  id: string
  pos: Vec3
  rot: Mat3
  home: Vec3
}

export type Face = 'U' | 'D' | 'L' | 'R' | 'F' | 'B'
export interface Move { face: Face; prime: boolean }

const I: Mat3 = [1, 0, 0, 0, 1, 0, 0, 0, 1]

export function mul(a: Mat3, b: Mat3): Mat3 {
  const out = new Array(9).fill(0) as unknown as Mat3
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++) {
      let s = 0
      for (let k = 0; k < 3; k++) s += a[r * 3 + k] * b[k * 3 + c]
      out[r * 3 + c] = s
    }
  return out
}

const apply = (m: Mat3, v: Vec3): Vec3 => [
  m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
  m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
  m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
]

const round = (n: number) => (Math.abs(n) < 1e-9 ? 0 : Math.round(n))

/** +90° about an axis, right-handed. */
export function rotAxis(axis: 0 | 1 | 2, sign: 1 | -1): Mat3 {
  const s = sign
  if (axis === 0) return [1, 0, 0, 0, 0, -s, 0, s, 0]
  if (axis === 1) return [0, 0, s, 0, 1, 0, -s, 0, 0]
  return [0, -s, 0, s, 0, 0, 0, 0, 1]
}

export const AXIS: Record<Face, 0 | 1 | 2> = { R: 0, L: 0, U: 1, D: 1, F: 2, B: 2 }
export const LAYER: Record<Face, number> = { R: 1, L: -1, U: 1, D: -1, F: 1, B: -1 }
/** A clockwise turn seen from outside that face. */
export const SIGN: Record<Face, 1 | -1> = { R: -1, L: 1, U: -1, D: 1, F: -1, B: 1 }

export function makeCube(): Cubie[] {
  const out: Cubie[] = []
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue
        out.push({ id: `${x}${y}${z}`, pos: [x, y, z], rot: [...I] as Mat3, home: [x, y, z] })
      }
  return out
}

export function turn(cube: Cubie[], move: Move): Cubie[] {
  const axis = AXIS[move.face]
  const layer = LAYER[move.face]
  const sign = (SIGN[move.face] * (move.prime ? -1 : 1)) as 1 | -1
  const m = rotAxis(axis, sign)
  return cube.map((c) => {
    if (c.pos[axis] !== layer) return c
    const pos = apply(m, c.pos).map(round) as Vec3
    return { ...c, pos, rot: mul(m, c.rot).map(round) as Mat3 }
  })
}

export const applyMoves = (cube: Cubie[], moves: Move[]): Cubie[] => moves.reduce(turn, cube)

export function isSolved(cube: Cubie[]): boolean {
  return cube.every((c) => c.rot.every((v, i) => v === I[i]) && c.pos.every((v, i) => v === c.home[i]))
}

export function parseMove(s: string): Move {
  const face = s[0].toUpperCase() as Face
  return { face, prime: s.includes("'") }
}

export const invert = (m: Move): Move => ({ face: m.face, prime: !m.prime })

const FACES: Face[] = ['U', 'D', 'L', 'R', 'F', 'B']

/** A scramble that never repeats the same face twice in a row. */
export function scramble(n = 20): Move[] {
  const out: Move[] = []
  let last: Face | null = null
  for (let i = 0; i < n; i++) {
    let face = FACES[Math.floor(Math.random() * FACES.length)]
    while (face === last) face = FACES[Math.floor(Math.random() * FACES.length)]
    last = face
    out.push({ face, prime: Math.random() < 0.5 })
  }
  return out
}

export const notation = (m: Move) => `${m.face}${m.prime ? "'" : ''}`

/** CSS matrix3d for a cubie's orientation (column-major, 4×4). */
export function matrix3d(m: Mat3): string {
  return `matrix3d(${[
    m[0], m[3], m[6], 0,
    m[1], m[4], m[7], 0,
    m[2], m[5], m[8], 0,
    0, 0, 0, 1
  ].join(',')})`
}
