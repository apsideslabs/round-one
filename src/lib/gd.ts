/**
 * A group discussion as a timed simulation. Twelve minutes, six participants,
 * one floor. Evaluators score behaviour, not opinions: when you entered, whether
 * you built on anyone, whether you interrupted, and whether the conclusion had
 * anything of yours in it.
 */
export type Action = 'open' | 'connector' | 'structure' | 'fact' | 'include' | 'summarise' | 'interrupt' | 'wait'

export interface Speaker {
  id: string
  name: string
  archetype: 'dominator' | 'silent' | 'fact' | 'peacemaker' | 'summariser'
  colour: string
}

export const SPEAKERS: Speaker[] = [
  { id: 'r', name: 'Rahul', archetype: 'dominator', colour: '#2f5bff' },
  { id: 'p', name: 'Priya', archetype: 'silent', colour: '#be123c' },
  { id: 'a', name: 'Aman', archetype: 'fact', colour: '#0e8c6a' },
  { id: 's', name: 'Sneha', archetype: 'peacemaker', colour: '#b8860b' },
  { id: 'k', name: 'Kabir', archetype: 'summariser', colour: '#7c3aed' }
]

export interface Topic {
  title: string
  angles: string[]
  facts: string[]
}

export const TOPICS: Topic[] = [
  {
    title: 'AI will remove more jobs than it creates',
    angles: ['job displacement', 'new roles created', 'transition speed', 'policy response'],
    facts: [
      'IT services hiring in India grew 4% last year while support roles fell 11%.',
      'NASSCOM puts the reskilling gap at 1.4 million people.',
      'Every previous automation wave took 15–20 years to net out positive.'
    ]
  },
  {
    title: 'Work from home is better for freshers',
    angles: ['learning by osmosis', 'commute cost', 'mentorship', 'team culture'],
    facts: [
      'Freshers who worked remote for their first year report lower confidence in code review.',
      'A Mumbai commute costs about 90 minutes and ₹2,400 a month.',
      'Hybrid teams report 12% higher attrition among employees under 25.'
    ]
  },
  {
    title: 'Engineering colleges should teach skills, not theory',
    angles: ['employability', 'fundamentals', 'industry tie-ups', 'who pays'],
    facts: [
      'Only 9% of employers call fresh graduates job-ready on day one.',
      '42% of employers cite missing applied skills, not missing concepts.',
      'Companies spend 4–6 months retraining new hires regardless of college.'
    ]
  }
]

export interface Line { who: string; text: string; kind: 'speak' | 'you' | 'moderator' }

export interface GDState {
  topic: Topic
  minute: number // 0..12
  floor: string | null // speaker id currently holding the floor
  lastSpeaker: string | null
  log: Line[]
  entries: number
  interruptions: number
  builds: number // times you named and extended someone
  factsUsed: number
  invited: boolean
  summarised: boolean
  opened: boolean
  repeated: number
  airtime: number // your speaking ticks
  said: Record<string, number> // how many times each person has spoken
  scores: { content: number; communication: number; listening: number; leadership: number; teamwork: number; reasoning: number }
  over: boolean
}

const START_SCORES = { content: 2, communication: 2.5, listening: 2, leadership: 2, teamwork: 2.5, reasoning: 2 }

export function makeGD(topicIdx = 0): GDState {
  const topic = TOPICS[topicIdx % TOPICS.length]
  return {
    topic, minute: 0, floor: null, lastSpeaker: null, log: [],
    entries: 0, interruptions: 0, builds: 0, factsUsed: 0, invited: false, summarised: false,
    opened: false, repeated: 0, airtime: 0, said: {}, scores: { ...START_SCORES }, over: false
  }
}

const clamp = (n: number) => Math.max(0, Math.min(5, Number(n.toFixed(2))))

/** Someone takes the floor and says something in character. */
export function step(s: GDState): GDState {
  if (s.over) return s
  const st: GDState = { ...s, log: [...s.log], scores: { ...s.scores } }
  st.minute += 0.5

  if (st.floor) {
    // the current speaker finishes their turn
    const sp = SPEAKERS.find((x) => x.id === st.floor)!
    const times = st.said[sp.id] ?? 0
    st.said = { ...st.said, [sp.id]: times + 1 }
    st.log.push({ who: sp.name, text: lineFor(sp, st, times), kind: 'speak' })
    st.lastSpeaker = sp.id
    st.floor = null
  } else {
    // next speaker takes the floor — and the dominator takes it often
    const pool = SPEAKERS.filter((x) => x.archetype !== 'silent' || st.minute > 6)
    const weighted = pool.flatMap((x) => (x.archetype === 'dominator' ? [x, x, x] : [x]))
    const next = weighted[Math.floor(Math.random() * weighted.length)]
    st.floor = next.id
  }

  if (st.minute >= 12) { st.over = true; st.floor = null }
  return st
}

function lineFor(sp: Speaker, s: GDState, times: number): string {
  const angle = s.topic.angles[Math.min(s.topic.angles.length - 1, Math.floor(s.minute / 3))]
  const fact = s.topic.facts[(Math.floor(s.minute / 4) + times) % s.topic.facts.length]
  switch (sp.archetype) {
    case 'dominator': return [
      `I will say this again — the whole ${angle} argument is overrated. Nobody has answered me yet.`,
      `Let me finish. My point about ${angle} still stands and nobody has addressed it.`,
      `See, this is what I mean — we keep circling ${angle} instead of deciding.`,
      `I have said it three times now. ${angle} is the only thing that matters here.`
    ][times % 4]
    case 'fact': return [
      `One number worth putting on the table: ${fact}`,
      `There is data on this — ${fact}`,
      `I looked this up before coming: ${fact}`
    ][times % 3]
    case 'peacemaker': return [
      `Both of you are saying the same thing differently. Can we take ${angle} first?`,
      `Can we let someone else come in before we continue on ${angle}?`,
      `We agree more than we disagree here, honestly.`
    ][times % 3]
    case 'summariser': return [
      `So far we have two positions on ${angle} and no agreement.`,
      `We have spent most of the time on ${angle}. The other angles are untouched.`,
      `If we had to close now, we would only have half a conclusion.`
    ][times % 3]
    case 'silent': return [
      `…I think ${angle} matters too, but I am not sure of the data.`,
      `Sorry — can I say something? I agree with the last point about ${angle}.`,
      `I did not want to interrupt, but ${angle} affects smaller colleges more.`
    ][times % 3]
  }
}

/** Your move. Every action costs time; only some of them earn score. */
export function act(s: GDState, action: Action): GDState {
  if (s.over) return s
  const st: GDState = { ...s, log: [...s.log], scores: { ...s.scores } }
  const last = st.lastSpeaker ? SPEAKERS.find((x) => x.id === st.lastSpeaker)!.name : 'the group'
  st.minute += 0.5
  st.entries++
  st.airtime += 1

  switch (action) {
    case 'open': {
      if (st.opened) {
        st.scores.content = clamp(st.scores.content - 0.2)
        st.log.push({ who: 'You', text: 'I will restate my opening point.', kind: 'you' })
        break
      }
      st.opened = true
      st.scores.content = clamp(st.scores.content + 1.2)
      st.scores.communication = clamp(st.scores.communication + 0.8)
      st.scores.leadership = clamp(st.scores.leadership + 1.2)
      st.log.push({
        who: 'You',
        text: `Let me frame this — the question is ${st.topic.title.toLowerCase()}. There are ${st.topic.angles.length} angles: ${st.topic.angles.slice(0, 3).join(', ')}. I suggest we take them in order.`,
        kind: 'you'
      })
      break
    }
    case 'connector': {
      st.builds++
      st.scores.listening = clamp(st.scores.listening + 1.1)
      st.scores.content = clamp(st.scores.content + 0.6)
      st.scores.reasoning = clamp(st.scores.reasoning + 0.6)
      st.log.push({
        who: 'You',
        text: `Building on ${last}'s point — the constraint is not the technology, it is who pays for the transition. That is why ${st.topic.angles[1]} comes before ${st.topic.angles[0]}.`,
        kind: 'you'
      })
      break
    }
    case 'structure': {
      st.scores.leadership = clamp(st.scores.leadership + 1.0)
      st.scores.reasoning = clamp(st.scores.reasoning + 0.8)
      st.scores.listening = clamp(st.scores.listening + 0.4)
      st.log.push({
        who: 'You',
        text: `Can I suggest we separate the short-term effect from the long-term one? We are mixing ${st.topic.angles[0]} with ${st.topic.angles[2]}.`,
        kind: 'you'
      })
      break
    }
    case 'fact': {
      if (st.factsUsed >= st.topic.facts.length) {
        st.scores.content = clamp(st.scores.content - 0.3)
        st.log.push({ who: 'You', text: 'As I said, the numbers support it.', kind: 'you' })
        break
      }
      st.factsUsed++
      st.scores.content = clamp(st.scores.content + 1.0)
      st.scores.reasoning = clamp(st.scores.reasoning + 0.5)
      st.log.push({ who: 'You', text: st.topic.facts[st.factsUsed - 1], kind: 'you' })
      break
    }
    case 'include': {
      if (st.invited) {
        st.scores.teamwork = clamp(st.scores.teamwork - 0.2)
        break
      }
      st.invited = true
      st.scores.teamwork = clamp(st.scores.teamwork + 1.4)
      st.scores.leadership = clamp(st.scores.leadership + 0.8)
      st.log.push({ who: 'You', text: 'Priya, you have been trying to come in — what is your read on this?', kind: 'you' })
      break
    }
    case 'summarise': {
      if (st.minute < 8) {
        st.scores.leadership = clamp(st.scores.leadership - 0.4)
        st.log.push({ who: 'You', text: 'To summarise so far…', kind: 'you' })
        break
      }
      if (st.summarised) {
        st.scores.leadership = clamp(st.scores.leadership - 0.5)
        st.log.push({ who: 'You', text: 'To summarise again…', kind: 'you' })
        break
      }
      st.summarised = true
      st.scores.leadership = clamp(st.scores.leadership + 1.3)
      st.scores.listening = clamp(st.scores.listening + 0.8)
      st.scores.communication = clamp(st.scores.communication + 0.6)
      st.log.push({
        who: 'You',
        text: `Pulling it together: the group agrees on ${st.topic.angles[0]}, is split on ${st.topic.angles[1]}, and nobody has touched ${st.topic.angles[3]}. If we had to decide now, we would say yes with a transition plan.`,
        kind: 'you'
      })
      break
    }
    case 'interrupt': {
      st.interruptions++
      st.scores.listening = clamp(st.scores.listening - 1.4)
      st.scores.teamwork = clamp(st.scores.teamwork - 1.2)
      st.scores.communication = clamp(st.scores.communication - 0.4)
      st.log.push({ who: 'You', text: 'Sorry — just to cut in, my point is more important here.', kind: 'you' })
      break
    }
    case 'wait': {
      st.airtime -= 1
      st.entries--
      st.scores.listening = clamp(st.scores.listening + 0.15)
      break
    }
  }

  if (st.minute >= 12) { st.over = true; st.floor = null }
  return st
}

export interface Verdict {
  total: number
  outOf: number
  advance: boolean
  notes: string[]
}

/** The evaluator's sheet, with the reason written next to each number. */
export function verdict(s: GDState): Verdict {
  const scores = { ...s.scores }
  const notes: string[] = []

  if (s.entries === 0) { scores.content = 0; scores.communication = 0; notes.push('You never spoke. A blank row scores nothing — silence is not maturity here.') }
  if (s.entries === 1) notes.push('One contribution is not a discussion. Evaluators need three or four to score you.')
  if (s.interruptions > 0) notes.push(`You cut in ${s.interruptions} time${s.interruptions > 1 ? 's' : ''}. Nothing costs more on listening and teamwork.`)
  if (s.builds === 0 && s.entries > 0) notes.push('You never named anyone else. Independent points read as a monologue.')
  if (!s.opened) notes.push('You did not frame the discussion. The first fifteen seconds are the only free floor.')
  if (!s.summarised) notes.push('You did not summarise. It is the most under-used opportunity in the round.')
  if (!s.invited && s.minute > 6) notes.push('You never brought a quiet member in. That single sentence is what leadership looks like here.')
  if (s.factsUsed === 0) notes.push('No numbers anywhere. Content without evidence is opinion.')
  if (s.airtime > 6) notes.push('You took a large share of the airtime. Dominating scores below contributing.')

  const total = Object.values(scores).reduce((a, b) => a + b, 0)
  const outOf = 30
  return { total: Number(total.toFixed(1)), outOf, advance: total >= outOf * 0.68, notes }
}
