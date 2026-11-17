/**
 * Salary negotiation as a state machine with hidden information. The employer's
 * ceiling is never shown; you can only infer it from what they say and from the
 * annexure you ask for. Nothing is random — the same moves give the same result,
 * because negotiation is a game of information, not luck.
 */
export type Move =
  | 'justify' | 'anchor' | 'competing' | 'structure' | 'joining'
  | 'relocation' | 'annexure' | 'time' | 'concede' | 'walk'

export type Archetype = 'service' | 'product' | 'consultancy'

export interface Employer {
  id: Archetype
  name: string
  opening: number
  ceiling: number
  patience: number
  variablePct: number
  style: string
}

export const EMPLOYERS: Record<Archetype, Employer> = {
  service: { id: 'service', name: 'Meridian Services', opening: 5.9, ceiling: 7.2, patience: 7, variablePct: 12, style: 'volume hiring, standard bands, needs approvals' },
  product: { id: 'product', name: 'Kettle Labs', opening: 7.6, ceiling: 11.4, patience: 5, variablePct: 8, style: 'small team, fast decisions, hates process' },
  consultancy: { id: 'consultancy', name: 'Ardent Advisory', opening: 6.4, ceiling: 8.3, patience: 8, variablePct: 18, style: 'grades and bands, everything in writing' }
}

export interface Line { who: 'you' | 'them' | 'note'; text: string }

export interface NegState {
  emp: Employer
  offer: number
  opening: number
  leverage: number
  turns: number
  variablePct: number
  joining: number
  relocation: number
  usedCompeting: boolean
  usedJustify: number
  usedAnnexure: boolean
  revealedCeiling: boolean
  over: boolean
  outcome: 'deal' | 'lowball' | 'withdrawn' | 'walked' | null
  log: Line[]
  mood: 'neutral' | 'warm' | 'cold'
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))
const r1 = (n: number) => Number(n.toFixed(1))

export function makeState(id: Archetype = 'service'): NegState {
  const emp = EMPLOYERS[id]
  return {
    emp,
    offer: emp.opening,
    opening: emp.opening,
    leverage: 42,
    turns: emp.patience,
    variablePct: emp.variablePct,
    joining: 0,
    relocation: 0,
    usedCompeting: false,
    usedJustify: 0,
    usedAnnexure: false,
    revealedCeiling: false,
    over: false,
    outcome: null,
    mood: 'neutral',
    log: [{ who: 'them', text: `We can offer ₹${emp.opening.toFixed(1)} LPA CTC. The fixed part is about ${100 - emp.variablePct}% of that.` }]
  }
}

export function play(s: NegState, move: Move): NegState {
  if (s.over) return s
  const st: NegState = { ...s, log: [...s.log], turns: s.turns - 1 }
  const say = (who: Line['who'], text: string) => st.log.push({ who, text })
  const raise = (by: number) => { st.offer = r1(Math.min(st.emp.ceiling, st.offer + by)) }
  const nudgeMood = (d: number) => {
    const v = (st.mood === 'warm' ? 1 : st.mood === 'cold' ? -1 : 0) + d
    st.mood = v > 0 ? 'warm' : v < 0 ? 'cold' : 'neutral'
  }

  switch (move) {
    case 'justify': {
      if (st.usedJustify >= 2) {
        st.leverage = clamp(st.leverage - 8); nudgeMood(-1)
        say('you', 'As I mentioned, the published band is higher.')
        say('them', 'You have said that. Repeating it does not change the band.')
      } else {
        st.usedJustify++
        st.leverage = clamp(st.leverage + 13); nudgeMood(1)
        raise(st.emp.id === 'product' ? 0.5 : 0.35)
        say('you', 'The band for this role in this city is published — I am asking inside it, not above it.')
        say('them', st.emp.id === 'product' ? 'Fair. I can move the fixed number.' : 'Let me see what approval I can get for that.')
      }
      break
    }
    case 'anchor': {
      st.leverage = clamp(st.leverage + 7)
      raise(0.25 + st.leverage / 260)
      say('you', 'I was expecting closer to the top of the band for this role.')
      say('them', 'That is above what we open with. I will see what is possible.')
      break
    }
    case 'competing': {
      if (st.usedCompeting) {
        st.leverage = clamp(st.leverage - 28); nudgeMood(-2)
        say('you', 'I do have another offer.')
        say('them', 'You mentioned that already. It is starting to sound like a tactic.')
        st.offer = r1(Math.max(st.opening, st.offer - 0.2))
      } else {
        st.usedCompeting = true
        st.leverage = clamp(st.leverage + 24); nudgeMood(1)
        raise(st.emp.id === 'product' ? 0.9 : 0.6)
        say('you', 'I have an offer at a higher fixed number, but your team is my first choice.')
        say('them', st.emp.id === 'product' ? 'Then let us not lose you over process. I can do better.' : 'Thank you for telling me. Let me take that to my manager.')
      }
      break
    }
    case 'structure': {
      st.leverage = clamp(st.leverage + 5)
      st.variablePct = Math.max(0, st.variablePct - 6)
      raise(0.2)
      say('you', 'Can we move some of the variable into fixed? I would rather have certainty.')
      say('them', `I can shift a little. The headline stays the same — about ${st.variablePct}% variable now.`)
      break
    }
    case 'joining': {
      st.joining = Math.max(st.joining, st.emp.id === 'product' ? 100000 : 50000)
      st.leverage = clamp(st.leverage - 3)
      say('you', 'If the fixed number is tight, could we look at a joining bonus instead?')
      say('them', `I can do ₹${(st.joining / 100000).toFixed(1)} lakh one time, with a twelve-month clawback.`)
      break
    }
    case 'relocation': {
      st.relocation = Math.max(st.relocation, 40000)
      st.leverage = clamp(st.leverage - 2)
      say('you', 'Is there a relocation allowance for moving cities?')
      say('them', 'Yes — a one-time ₹40,000, paid with the first salary.')
      break
    }
    case 'annexure': {
      if (st.usedAnnexure) {
        say('you', 'Could you resend the annexure?')
        say('them', 'It is the same document.')
      } else {
        st.usedAnnexure = true
        st.revealedCeiling = true
        st.leverage = clamp(st.leverage + 9)
        say('you', 'Before we talk numbers, can you send the full breakup — fixed, variable, PF, gratuity?')
        say('them', `Of course. Fixed is ₹${(st.offer * (1 - st.variablePct / 100)).toFixed(1)} L, variable ₹${(st.offer * st.variablePct / 100).toFixed(1)} L, and the band for this grade closes near ₹${st.emp.ceiling.toFixed(1)} L.`)
      }
      break
    }
    case 'time': {
      st.turns += 1
      st.leverage = clamp(st.leverage - 4)
      say('you', 'Could I have a day to look at the numbers properly?')
      say('them', 'Of course. I will hold the offer until tomorrow evening.')
      break
    }
    case 'concede': {
      st.leverage = clamp(st.leverage - 12); nudgeMood(1)
      say('you', 'I am happy to accept what you have on the table.')
      say('them', 'Wonderful. I will send the letter today.')
      st.over = true
      st.outcome = st.offer < st.opening + 0.7 ? 'lowball' : 'deal'
      break
    }
    case 'walk': {
      say('you', 'I do not think we will get there. Thank you for your time.')
      if (st.offer >= st.emp.ceiling - 0.15) {
        say('them', 'Wait — let me check one more thing with my manager.')
        raise(0.3)
        st.over = true
        st.outcome = 'deal'
      } else if (st.mood === 'cold' && st.leverage < 30) {
        say('them', 'Then I think we should stop here.')
        st.over = true
        st.outcome = 'withdrawn'
      } else {
        say('them', 'Understood. All the best.')
        st.over = true
        st.outcome = 'walked'
      }
      break
    }
  }

  if (!st.over && st.turns <= 0) {
    st.over = true
    st.outcome = st.offer > st.opening + 0.5 ? 'deal' : 'lowball'
    say('them', 'I need to close this today, so let me put the final number in writing.')
  }
  return st
}

export interface Payslip {
  ctc: number
  fixedGross: number
  basic: number
  hra: number
  special: number
  variable: number
  employerPf: number
  gratuity: number
  employeePf: number
  tax: number
  inHandMonthly: number
  firstYearCash: number
}

/** The offer letter, decomposed — same maths as the offer desk, kept honest. */
export function payslip(ctcLakh: number, variablePct: number, joining = 0): Payslip {
  const ctc = ctcLakh * 100000
  const variable = (ctc * variablePct) / 100
  const fixedCtc = ctc - variable
  const basic = fixedCtc * 0.5 * 0.88
  const employerPf = 0.12 * basic
  const gratuity = 0.0481 * basic
  const insurance = 8000
  const fixedGross = fixedCtc - employerPf - gratuity - insurance
  const hra = basic * 0.4
  const special = fixedGross - basic - hra
  const employeePf = 0.12 * basic
  const taxable = Math.max(0, fixedGross - 75000)
  const slab = taxable <= 1200000 ? 0 : taxable * 0.1
  const tax = slab * 1.04
  const inHandMonthly = Math.round((fixedGross - employeePf - 2400 - tax) / 12)
  return {
    ctc, fixedGross, basic, hra, special, variable, employerPf, gratuity,
    employeePf, tax, inHandMonthly, firstYearCash: fixedGross - employeePf - tax + joining
  }
}
