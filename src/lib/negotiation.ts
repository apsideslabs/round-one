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
  tell: string
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))
const r1 = (n: number) => Number(n.toFixed(1))

const OPENINGS: Record<Archetype, string> = {
  service: 'Right — sorry, I am double-booked today, so. Five point nine lakh CTC. Fixed is about eighty-eight per cent of that. …That is the standard fresher band, I did not make it up.',
  product: 'Hey. Straight to it — seven point six. Variable is small, eight per cent. What number were you carrying in your head?',
  consultancy: 'Good afternoon. The grade for this role is G2. The band opens at six point four lakh. — sorry, six point four, and eighteen per cent of that is variable. I will send the annexure.'
}

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
    tell: 'checks the time',
    log: [{ who: 'them', text: OPENINGS[id] }]
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
        say('them', 'You have said that. Twice. — It is not that I disagree, it is that repeating it does not move a grade.')
      } else {
        st.usedJustify++
        st.leverage = clamp(st.leverage + 13); nudgeMood(1)
        raise(st.emp.id === 'product' ? 0.5 : 0.35)
        say('you', 'The band for this role in this city is published — I am asking inside it, not above it.')
        say('them', st.emp.id === 'product'
          ? 'Yeah — that sheet, I have seen it. Fair. I can move the fixed.'
          : 'Hm. …Look, the band is public, you are not wrong. I can move the fixed a little. Not the variable.')
      }
      break
    }
    case 'anchor': {
      st.leverage = clamp(st.leverage + 7)
      raise(0.25 + st.leverage / 260)
      say('you', 'I was expecting closer to the top of the band for this role.')
      say('them', st.emp.id === 'product'
        ? 'Bold. — I like it, but no. I can come up slightly.'
        : 'That is above what we open with. …I will ask. I am not promising anything.')
      break
    }
    case 'competing': {
      if (st.usedCompeting) {
        st.leverage = clamp(st.leverage - 28); nudgeMood(-2)
        say('you', 'I do have another offer.')
        say('them', 'You have said that. — I will be blunt: the first time it is information, the second time it is a script.')
        st.offer = r1(Math.max(st.opening, st.offer - 0.2))
      } else {
        st.usedCompeting = true
        st.leverage = clamp(st.leverage + 24); nudgeMood(1)
        raise(st.emp.id === 'product' ? 0.9 : 0.6)
        say('you', 'I have an offer at a higher fixed number, but your team is my first choice.')
        say('them', st.emp.id === 'product'
          ? 'Then let us not lose you over process. I can do better — do not tell my founder.'
          : 'Thank you for telling me. …I would rather not lose you over two thousand a month. Give me a day.')
      }
      break
    }
    case 'structure': {
      st.leverage = clamp(st.leverage + 5)
      st.variablePct = Math.max(0, st.variablePct - 6)
      raise(0.2)
      say('you', 'Can we move some of the variable into fixed? I would rather have certainty.')
      say('them', `I can shift a little — the headline does not change, it just looks different. About ${st.variablePct}% variable now. …Honestly, it is the same money.`)
      break
    }
    case 'joining': {
      st.joining = Math.max(st.joining, st.emp.id === 'product' ? 100000 : 50000)
      st.leverage = clamp(st.leverage - 3)
      say('you', 'If the fixed number is tight, could we look at a joining bonus instead?')
      say('them', `…I can do ₹${(st.joining / 100000).toFixed(1)} lakh one time. Clawback if you leave inside twelve months. Sorry — that is the policy, not me.`)
      break
    }
    case 'relocation': {
      st.relocation = Math.max(st.relocation, 40000)
      st.leverage = clamp(st.leverage - 2)
      say('you', 'Is there a relocation allowance for moving cities?')
      say('them', 'Yes. Forty thousand, once, with the first salary. — It is taxable, before you ask.')
      break
    }
    case 'annexure': {
      if (st.usedAnnexure) {
        say('you', 'Could you resend the annexure?')
        say('them', 'It is the same document. — I have not changed a line since Tuesday.')
      } else {
        st.usedAnnexure = true
        st.revealedCeiling = true
        st.leverage = clamp(st.leverage + 9)
        say('you', 'Before we talk numbers, can you send the full breakup — fixed, variable, PF, gratuity?')
        say('them', `Yes. — hold on, the sheet I have is from last quarter. Fixed ₹${(st.offer * (1 - st.variablePct / 100)).toFixed(1)} L, variable ₹${(st.offer * st.variablePct / 100).toFixed(1)} L. The band for this grade closes near ₹${st.emp.ceiling.toFixed(1)} L. I should not have said that out loud.`)
      }
      break
    }
    case 'time': {
      st.turns += 1
      st.leverage = clamp(st.leverage - 4)
      say('you', 'Could I have a day to look at the numbers properly?')
      say('them', 'Yes — but not past tomorrow evening. I have a review on Thursday and I need this closed.')
      break
    }
    case 'concede': {
      st.leverage = clamp(st.leverage - 12); nudgeMood(1)
      say('you', 'I am happy to accept what you have on the table.')
      say('them', 'Good. — I mean, that is great news. I will get the letter out today. Or tomorrow morning.')
      st.over = true
      st.outcome = st.offer < st.opening + 0.7 ? 'lowball' : 'deal'
      break
    }
    case 'walk': {
      say('you', 'I do not think we will get there. Thank you for your time.')
      if (st.offer >= st.emp.ceiling - 0.15) {
        say('them', 'Wait — wait. Do not walk yet. Let me check one thing with my manager.')
        raise(0.3)
        st.over = true
        st.outcome = 'deal'
      } else if (st.mood === 'cold' && st.leverage < 30) {
        say('them', 'Then I think we should stop here. — I will be honest, we will fill this by Friday.')
        st.over = true
        st.outcome = 'withdrawn'
      } else {
        say('them', 'Understood. …All the best, genuinely.')
        st.over = true
        st.outcome = 'walked'
      }
      break
    }
  }

  st.tell = st.over
    ? 'closes the laptop'
    : st.leverage > 70 ? 'leans back, pen down'
    : st.leverage > 45 ? 'takes a note'
    : st.mood === 'cold' ? 'checks the phone, not you'
    : 'taps the pen twice'

  if (!st.over && st.turns <= 0) {
    st.over = true
    st.outcome = st.offer > st.opening + 0.5 ? 'deal' : 'lowball'
    say('them', 'I have to close this today — my manager is asking. Let me put the final number in writing.')
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
