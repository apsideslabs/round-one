/**
 * A rubric, not a model. Scores a spoken-style answer on the five things an
 * interviewer actually marks, and reports what is missing so the panel can
 * ask for it — which is what makes the follow-up feel like a real one.
 */
export type Missing = 'number' | 'ownership' | 'result' | 'specific' | 'length' | 'filler'

export interface AnswerScore {
  score: number // 0..5
  notes: string[]
  missing: Missing[]
}

const FILLER = /\b(basically|actually|kind of|sort of|you know|like i said|obviously|literally|honestly just)\b/gi

export function scoreAnswer(text: string, ctx: { skill?: string; project?: string } = {}): AnswerScore {
  const t = text.trim()
  const words = t.split(/\s+/).filter(Boolean)
  const missing: Missing[] = []
  const notes: string[] = []
  let score = 1

  // length: an answer is 25–90 words; below is thin, above is a ramble
  if (words.length < 20) { missing.push('length'); notes.push(`only ${words.length} words — too thin to score`) }
  else if (words.length > 110) { missing.push('length'); notes.push(`${words.length} words — you are rambling, an answer is 30–60 seconds`) }
  else { score += 0.6 }

  // a number, any number
  if (/\d/.test(t)) score += 1
  else { missing.push('number'); notes.push('no number anywhere — no scale, no result') }

  // ownership: "I" beats "we"
  const iCount = (t.match(/\b(i|my|me)\b/gi) ?? []).length
  const weCount = (t.match(/\b(we|our|us)\b/gi) ?? []).length
  if (iCount > weCount) score += 1
  else if (weCount > 0) { missing.push('ownership'); notes.push('you said "we" more than "I" — they cannot score a team') }
  else { missing.push('ownership'); notes.push('nothing about what you personally did') }

  // a result clause
  if (/\b(because|so that|which (led|meant|cut|saved)|result(ed)?|reduced|increased|saved|cut|improved|from .* to )\b/i.test(t)) score += 1
  else { missing.push('result'); notes.push('what changed because of it? no outcome clause') }

  // specificity: a named tool, project or technology
  const named = [ctx.skill, ctx.project].filter(Boolean).some((s) => s && t.toLowerCase().includes(s.toLowerCase()))
  const techy = /\b(python|java|sql|react|node|docker|flask|django|api|database|git|linux|excel|tableau|pandas|numpy)\b/i.test(t)
  if (named || techy) score += 1
  else { missing.push('specific'); notes.push('nothing concrete — no tool, no system, no name') }

  // filler
  const filler = t.match(FILLER)
  if (filler && filler.length > 1) { missing.push('filler'); notes.push(`${filler.length} filler phrases`) ; score -= 0.5 }

  return { score: Math.max(0, Math.min(5, Number(score.toFixed(1)))), notes, missing }
}

/** The next question a real interviewer would ask, chosen from what is missing. */
export function followUpFor(missing: Missing[], ctx: { skill?: string; project?: string } = {}): { ask: string; hint: string } {
  const pick = (m: Missing) => missing.includes(m)
  if (pick('ownership'))
    return { ask: 'Which part of that did you do yourself?', hint: 'name the files, the decision or the bug that was yours' }
  if (pick('number'))
    return { ask: 'Give me a number — how big, how many, how long?', hint: 'users, records, hours saved, or the size of the dataset' }
  if (pick('result'))
    return { ask: 'And what changed because of it?', hint: 'a before and an after, in one line' }
  if (pick('specific'))
    return { ask: 'What was actually running — which tool, which system?', hint: `name the stack${ctx.skill ? `, starting with ${ctx.skill}` : ''}` }
  if (pick('length'))
    return { ask: 'Summarise that in two sentences.', hint: 'one line of context, one line of result' }
  return { ask: 'What would you do differently if you did it again?', hint: 'one concrete change, with the cost of not making it' }
}
