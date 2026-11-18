/** A ninety-second interview, recorded as beats you can scrub through. */
export type Mood = 'neutral' | 'smile' | 'frown' | 'bored' | 'impressed' | 'sceptical'

export interface Beat {
  t: number // seconds
  who: 'panel' | 'you' | 'note'
  line: string
  moods: [Mood, Mood, Mood]
  attention: number // 0..100, how much of the panel is still with you
  note?: string // what one of them wrote at this moment
  ghost?: string // what a strong answer would have said here
}

export const TAPE: Beat[] = [
  { t: 0, who: 'panel', line: 'Take a seat. Tell me about yourself.', moods: ['neutral', 'smile', 'neutral'], attention: 72 },
  { t: 8, who: 'you', line: 'Sure. So, I did my schooling in Pune, then B.Tech in computer science…', moods: ['neutral', 'neutral', 'neutral'], attention: 64, note: 'chronological. wait for it' },
  { t: 18, who: 'you', line: '…and in second year I was in three clubs, and in third year I did a course on…', moods: ['bored', 'neutral', 'sceptical'], attention: 41, note: 'three clubs. no result yet', ghost: 'One line about you, then one result with a number.' },
  { t: 30, who: 'panel', line: 'Okay — what did you actually build?', moods: ['sceptical', 'neutral', 'neutral'], attention: 38 },
  { t: 36, who: 'you', line: 'A billing app. It was a team project, I did the frontend part.', moods: ['neutral', 'neutral', 'frown'], attention: 33, note: 'frontend "part" — did not say what he did' },
  { t: 46, who: 'panel', line: 'What broke, and how did you find it?', moods: ['sceptical', 'neutral', 'sceptical'], attention: 30 },
  { t: 52, who: 'you', line: 'GST rounding was wrong by one paisa. I found it when the shop owner complained.', moods: ['impressed', 'smile', 'smile'], attention: 68, note: 'finally — a real problem. note this one', ghost: 'Name the mechanism: stored paise as integers.' },
  { t: 64, who: 'panel', line: 'Why us, and not the company next door?', moods: ['neutral', 'smile', 'neutral'], attention: 62 },
  { t: 70, who: 'you', line: 'Good growth, good culture. Any company is fine really.', moods: ['frown', 'sceptical', 'bored'], attention: 22, note: 'he does not want us. do not proceed.', ghost: 'Name their product, then the gap in your own skills.' },
  { t: 84, who: 'panel', line: 'We will get back to you.', moods: ['neutral', 'neutral', 'bored'], attention: 18 }
]

export const tapeDuration = (tape: Beat[]) => tape[tape.length - 1].t

/** The beat in force at a given second. */
export function beatAt(tape: Beat[], t: number): Beat {
  let found = tape[0]
  for (const b of tape) if (b.t <= t) found = b
  return found
}

/** Attention interpolated between beats, so the line reads as a curve. */
export function attentionAt(tape: Beat[], t: number): number {
  for (let i = 0; i < tape.length - 1; i++) {
    const a = tape[i]
    const b = tape[i + 1]
    if (t >= a.t && t <= b.t) {
      const k = (t - a.t) / Math.max(1, b.t - a.t)
      return a.attention + (b.attention - a.attention) * k
    }
  }
  return tape[tape.length - 1].attention
}

/** The moment the room was lost, and the moment it was nearly won. */
export function turningPoints(tape: Beat[]) {
  let low = tape[0]
  let high = tape[0]
  for (const b of tape) {
    if (b.attention < low.attention) low = b
    if (b.attention > high.attention) high = b
  }
  return { low, high }
}
