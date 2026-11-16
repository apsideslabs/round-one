/* Pure game logic — kept out of the components so it can be tested. */

export type Peg = 0 | 1 | 2 | 3 | 4 | 5

export const PEG_COLOURS = ['#ff4b26', '#0e8c6a', '#f5b01b', '#2f5bff', '#be123c', '#7c3f00'] as const
export const CODE_LENGTH = 4

/** Exact matches (right colour, right slot) and partial matches (right colour, wrong slot). */
export function scoreGuess(secret: readonly number[], guess: readonly number[]): { exact: number; partial: number } {
  const s = [...secret]
  const g = [...guess]
  let exact = 0

  for (let i = 0; i < s.length; i++) {
    if (s[i] === g[i]) {
      exact++
      s[i] = -1
      g[i] = -2
    }
  }

  let partial = 0
  for (let i = 0; i < g.length; i++) {
    if (g[i] < 0) continue
    const hit = s.indexOf(g[i])
    if (hit !== -1) {
      partial++
      s[hit] = -1
    }
  }

  return { exact, partial }
}

export function randomCode(length = CODE_LENGTH, colours = PEG_COLOURS.length): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * colours))
}

/* ---------------- sequence (memory span) ---------------- */

export function extendSequence(sequence: readonly number[], pads = 4): number[] {
  return [...sequence, Math.floor(Math.random() * pads)]
}

export const sequenceScore = (reached: number) => Math.max(0, (reached - 1) * 10)

/* ---------------- maths sprint ---------------- */

export interface MathQuestion {
  prompt: string
  answer: number
  options: number[]
}

export function makeMathQuestion(level: number, rand: () => number = Math.random): MathQuestion {
  const scale = Math.min(3, Math.floor(level / 4))
  const op = ['+', '−', '×'][Math.floor(rand() * 3)] as '+' | '−' | '×'
  const cap = [20, 40, 90, 150][scale]

  let a = 2 + Math.floor(rand() * cap)
  let b = 2 + Math.floor(rand() * cap)
  if (op === '×') {
    a = 2 + Math.floor(rand() * (6 + scale * 4))
    b = 2 + Math.floor(rand() * (6 + scale * 4))
  }

  const answer = op === '+' ? a + b : op === '−' ? a - b : a * b
  const spread = Math.max(2, Math.round(Math.abs(answer) * 0.15) + 1)
  const options = new Set<number>([answer])
  while (options.size < 4) {
    const delta = Math.ceil(rand() * spread) * (rand() > 0.5 ? 1 : -1)
    const candidate = answer + delta
    if (candidate !== answer) options.add(candidate)
  }

  return {
    prompt: `${a} ${op} ${b}`,
    answer,
    options: [...options].sort(() => rand() - 0.5)
  }
}
