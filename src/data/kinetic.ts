/** Turns a written answer into beats a motion-graphics film can play. */
export type BeatKind = 'number' | 'specific' | 'connector' | 'vague' | 'plain'

export interface Beat {
  text: string
  kind: BeatKind
  start: number
  dur: number
}

const FILLER = /\b(basically|actually|kind of|sort of|you know|literally|honestly|very|really|stuff|things)\b/i
const CONNECTOR = /\b(because|so that|which (led|meant|cut|saved)|therefore|however|but)\b/i
const SPECIFIC = /\b(python|java|sql|react|node|flask|django|api|database|docker|git|excel|tableau|pandas|system|service|module|test|deploy|schema|query)\b/i
// people say numbers as words far more often than as digits
const NUMBER = /\b\d|\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|fifteen|twenty|thirty|forty|fifty|hundred|thousand|lakh|lakhs|crore|per cent|percent)\b/i

export function classify(chunk: string): BeatKind {
  if (NUMBER.test(chunk)) return 'number'
  if (FILLER.test(chunk)) return 'vague'
  if (CONNECTOR.test(chunk)) return 'connector'
  if (SPECIFIC.test(chunk)) return 'specific'
  return 'plain'
}

/** Split into mouthfuls of 3–7 words, then time them across the film. */
export function parseAnswer(text: string, total = 18): Beat[] {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return []
  const pieces = clean.split(/(?<=[.!?;])\s+|,\s+/).flatMap((part) => {
    const words = part.split(' ').filter(Boolean)
    if (words.length <= 7) return [part]
    const out: string[] = []
    for (let i = 0; i < words.length; i += 6) out.push(words.slice(i, i + 6).join(' '))
    return out
  })

  const weights = pieces.map((p) => 1 + p.split(' ').length * 0.22)
  const sum = weights.reduce((a, b) => a + b, 0)
  let t = 0
  return pieces.map((p, i) => {
    const dur = (weights[i] / sum) * total
    const beat: Beat = { text: p.replace(/[.;]$/, ''), kind: classify(p), start: t, dur }
    t += dur
    return beat
  })
}

export const beatAt = (beats: Beat[], t: number) => beats.find((b) => t >= b.start && t < b.start + b.dur) ?? beats[beats.length - 1]

/** How much of the answer actually carries weight — the film's verdict. */
export function substance(beats: Beat[]) {
  const scored = beats.filter((b) => b.kind === 'number' || b.kind === 'specific').length
  const vague = beats.filter((b) => b.kind === 'vague').length
  return { scored, vague, total: beats.length, ratio: beats.length ? scored / beats.length : 0 }
}
