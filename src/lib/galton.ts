/**
 * A Galton board where each row is one of your interview answers. A good answer
 * is a peg that leans right; a weak one leans left. The ball falling through
 * every row is one interview, and the pile at the bottom is what a hundred
 * interviews would look like.
 */
export interface Row {
  label: string
  p: number // probability the ball goes right at this row
  grade: 'strong' | 'ok' | 'weak'
}

export const ROWS_FROM_SCORES = (scores: Array<'strong' | 'ok' | 'weak'>, labels: string[]): Row[] =>
  scores.map((g, i) => ({
    label: labels[i] ?? `answer ${i + 1}`,
    p: g === 'strong' ? 0.82 : g === 'ok' ? 0.5 : 0.2,
    grade: g
  }))

/** Exact distribution over the number of right-turns, by dynamic programming. */
export function analytic(rows: Row[]): number[] {
  let dist = [1]
  for (const row of rows) {
    const next = new Array(dist.length + 1).fill(0)
    for (let k = 0; k < dist.length; k++) {
      next[k] += dist[k] * (1 - row.p)
      next[k + 1] += dist[k] * row.p
    }
    dist = next
  }
  return dist
}

export const band = (score: number, rows: number) => {
  const ratio = score / Math.max(1, rows)
  return ratio >= 0.68 ? 'offer' : ratio >= 0.45 ? 'borderline' : 'reject'
}

export interface PathPoint { row: number; side: 'left' | 'right' }

export function dropOne(rows: Row[], rand: () => number = Math.random) {
  let score = 0
  const path: PathPoint[] = []
  rows.forEach((row, i) => {
    const right = rand() < row.p
    if (right) score++
    path.push({ row: i, side: right ? 'right' : 'left' })
  })
  return { score, path }
}
