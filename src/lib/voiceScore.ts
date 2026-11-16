const FILLERS = ['um', 'uh', 'erm', 'like', 'actually', 'basically', 'you know', 'sort of', 'kind of', 'i mean']

export interface Delivery {
  seconds: number
  words: number
  pace: number
  fillers: number
  fillerRate: number
  verdict: 'too-brief' | 'brisk' | 'measured' | 'rushed' | 'rambling'
  notes: string[]
}

/** Scores the delivery, not the content — pace, length and filler words. */
export function scoreDelivery(seconds: number, transcript: string): Delivery {
  const words = transcript ? transcript.split(/\s+/).filter(Boolean).length : 0
  const pace = seconds > 0 ? Math.round((words / seconds) * 60) : 0
  const lower = ` ${transcript.toLowerCase()} `
  const fillers = FILLERS.reduce((n, f) => n + (lower.match(new RegExp(`\\b${f}\\b`, 'g'))?.length ?? 0), 0)
  const fillerRate = words > 0 ? Math.round((fillers / words) * 100) : 0

  let verdict: Delivery['verdict'] = 'measured'
  const notes: string[] = []

  if (seconds < 8) {
    verdict = 'too-brief'
    notes.push('Under ten seconds reads as a reflex, not an answer. Give the situation, then what you did.')
  } else if (words > 0 && pace > 175) {
    verdict = 'rushed'
    notes.push(`${pace} words a minute is fast for a room. Land each sentence before starting the next.`)
  } else if (words > 0 && pace < 95) {
    verdict = 'brisk'
    notes.push(`${pace} words a minute is slow enough to sound unsure. Aim for 120–150.`)
  } else if (seconds > 150) {
    verdict = 'rambling'
    notes.push('Over two and a half minutes — a panel will cut in. Cap the story at 90 seconds.')
  } else {
    notes.push('Length and pace sit in the range an interviewer can follow.')
  }

  if (fillers > 3) notes.push(`${fillers} filler words (${fillerRate}% of what you said). Silence reads as thinking; "um" reads as stalling.`)
  else if (fillers > 0) notes.push(`${fillers} filler word${fillers === 1 ? '' : 's'} — close to clean.`)

  if (words === 0) notes.push('No transcript was captured, so pace could not be measured — only length.')

  return { seconds, words, pace, fillers, fillerRate, verdict, notes }
}
