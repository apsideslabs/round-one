/**
 * A negotiation engine with real Indian payroll and real multi-dimensional
 * trades. Money is only one axis: bond, notice period, probation and grade all
 * cost or buy something later. The employer's ceiling and urgency are hidden;
 * you buy information with turns.
 */
export type Move =
  | 'justify' | 'anchor' | 'competing' | 'structure' | 'joining' | 'relocation'
  | 'annexure' | 'askBand' | 'askVariable' | 'askBond' | 'askUrgency'
  | 'tradeNotice' | 'time' | 'concede' | 'walk'

export type Archetype = 'service' | 'product' | 'consultancy'

export interface Employer {
  id: Archetype
  name: string
  recruiter: string
  role: string
  opening: number
  ceiling: number
  patience: number
  variablePct: number
  variablePaid: number // what they actually paid last year, as % of target
  bond: number // years of service agreement, 0 if none
  notice: number // months
  probation: number // months
  style: string
}

export const EMPLOYERS: Record<Archetype, Employer> = {
  service: { id: 'service', name: 'Meridian Services', recruiter: 'Priya Raman', role: 'Talent Acquisition', opening: 5.9, ceiling: 7.2, patience: 7, variablePct: 12, variablePaid: 55, bond: 2, notice: 3, probation: 6, style: 'volume hiring · standard bands · approvals' },
  product: { id: 'product', name: 'Kettle Labs', recruiter: 'Ananya Rao', role: 'Engineering Manager', opening: 7.6, ceiling: 11.4, patience: 5, variablePct: 8, variablePaid: 90, bond: 0, notice: 2, probation: 3, style: 'small team · fast decisions · hates process' },
  consultancy: { id: 'consultancy', name: 'Ardent Advisory', recruiter: 'Meera Iyer', role: 'Campus Hiring Lead', opening: 6.4, ceiling: 8.3, patience: 8, variablePct: 18, variablePaid: 70, bond: 1, notice: 3, probation: 6, style: 'grades and bands · everything in writing' }
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
  bond: number
  notice: number
  grade: number
  usedCompeting: boolean
  usedJustify: number
  usedAnnexure: boolean
  usedVariable: boolean
  usedBond: boolean
  usedUrgency: boolean
  usedTrade: boolean
  revealedCeiling: boolean
  over: boolean
  outcome: 'deal' | 'lowball' | 'withdrawn' | 'walked' | null
  log: Line[]
  mood: 'neutral' | 'warm' | 'cold'
  tell: string
  typing: boolean
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
    emp, offer: emp.opening, opening: emp.opening, leverage: 42, turns: emp.patience,
    variablePct: emp.variablePct, joining: 0, relocation: 0, bond: emp.bond, notice: emp.notice, grade: 2,
    usedCompeting: false, usedJustify: 0, usedAnnexure: false, usedVariable: false, usedBond: false,
    usedUrgency: false, usedTrade: false, revealedCeiling: false, over: false, outcome: null,
    mood: 'neutral', tell: 'checks the time', typing: false,
    log: [{ who: 'them', text: OPENINGS[id] }]
  }
}

export function play(s: NegState, move: Move): NegState {
  if (s.over) return s
  const st: NegState = { ...s, log: [...s.log], turns: s.turns - 1, typing: false }
  const say = (who: Line['who'], text: string) => st.log.push({ who, text })
  const raise = (by: number) => { st.offer = r1(Math.min(st.emp.ceiling, st.offer + by)) }
  const mood = (d: number) => {
    const v = (st.mood === 'warm' ? 1 : st.mood === 'cold' ? -1 : 0) + d
    st.mood = v > 0 ? 'warm' : v < 0 ? 'cold' : 'neutral'
  }

  switch (move) {
    case 'justify': {
      if (st.usedJustify >= 2) {
        st.leverage = clamp(st.leverage - 9); mood(-1)
        say('you', 'As I mentioned, the published band is higher.')
        say('them', 'You have said that. Twice. — It is not that I disagree, it is that repeating it does not move a grade.')
      } else {
        st.usedJustify++
        st.leverage = clamp(st.leverage + 13); mood(1)
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
        st.leverage = clamp(st.leverage - 30); mood(-2)
        say('you', 'I do have another offer.')
        say('them', 'You have said that. — I will be blunt: the first time it is information, the second time it is a script.')
        st.offer = r1(Math.max(st.opening, st.offer - 0.2))
      } else {
        st.usedCompeting = true
        st.leverage = clamp(st.leverage + 24); mood(1)
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
    case 'askVariable': {
      if (st.usedVariable) { say('them', 'I told you — sixty per cent last year. It is in the annexure.'); break }
      st.usedVariable = true
      st.leverage = clamp(st.leverage + 6)
      say('you', 'What did the variable actually pay out last year?')
      say('them', st.emp.variablePaid < 70
        ? `…About ${st.emp.variablePaid} per cent of target. It has been a hard year. I would not build a budget on it.`
        : `${st.emp.variablePaid} per cent of target, paid in full. That part is reliable.`)
      break
    }
    case 'askBond': {
      if (st.usedBond) { say('them', 'Two years, as I said. It is standard for the training.'); break }
      st.usedBond = true
      st.leverage = clamp(st.leverage + 5)
      say('you', 'Is there a service agreement or bond attached?')
      say('them', st.bond > 0
        ? `Yes — ${st.bond} year${st.bond > 1 ? 's' : ''}, with training cost recovery if you leave early. It is in the letter, most people do not read that page.`
        : 'No bond. We do not do that here.')
      break
    }
    case 'askUrgency': {
      if (st.usedUrgency) { say('them', 'I told you already. Thursday.'); break }
      st.usedUrgency = true
      st.leverage = clamp(st.leverage + 11)
      say('you', 'Can I ask — how many offers are you still holding for this role?')
      say('them', st.emp.id === 'product'
        ? 'Two. And my founder is asking why this is not closed. …That stays between us.'
        : 'Two of three seats are filled. I need to close the third by Thursday. — I should not have said that either.')
      break
    }
    case 'askBand': {
      st.leverage = clamp(st.leverage + 4)
      say('you', 'What grade is this role, and what does the band look like?')
      say('them', `Grade G${st.grade}. The band runs to about ₹${st.emp.ceiling.toFixed(1)} L for this grade — after that it is a different requisition.`)
      st.revealedCeiling = true
      break
    }
    case 'tradeNotice': {
      if (st.usedTrade) { say('them', 'One trade per conversation.'); break }
      st.usedTrade = true
      st.notice = Math.max(st.notice, 3)
      st.leverage = clamp(st.leverage - 6)
      raise(0.45)
      say('you', 'If I accept a ninety-day notice period, does that help on the fixed number?')
      say('them', 'It does — it costs us less to plan around you. I can move the fixed. Ninety days, in writing.')
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
      st.leverage = clamp(st.leverage - 12); mood(1)
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
  insurance: number
  employeePf: number
  pt: number
  tax: number
  inHandMonthly: number
}

const PF_CEILING_BASIC = 15000 * 12
const PT = 2400
const INSURANCE = 8000

/** New-regime slabs with the 87A rebate, FY 2025-26. */
export function taxNewRegime(taxable: number): number {
  const slabs: Array<[number, number, number]> = [
    [0, 400000, 0], [400000, 800000, 0.05], [800000, 1200000, 0.1],
    [1200000, 1600000, 0.15], [1600000, 2000000, 0.2], [2000000, 2400000, 0.25], [2400000, Infinity, 0.3]
  ]
  let tax = 0
  for (const [lo, hi, rate] of slabs) if (taxable > lo) tax += (Math.min(taxable, hi) - lo) * rate
  if (taxable <= 1200000) tax = Math.max(0, tax - 60000)
  return Math.round(tax * 1.04)
}

/** Basic at 40% of fixed gross, HRA at half of basic, PF capped at ₹15,000. */
export function payslip(ctcLakh: number, variablePct: number): Payslip {
  const ctc = ctcLakh * 100000
  const variable = (ctc * variablePct) / 100
  const fixedCtc = ctc - variable
  const basic = fixedCtc * 0.4 * 0.9
  const employerPf = 0.12 * Math.min(basic, PF_CEILING_BASIC)
  const gratuity = 0.0481 * basic
  const fixedGross = fixedCtc - employerPf - gratuity - INSURANCE
  const hra = basic * 0.5
  const special = fixedGross - basic - hra
  const employeePf = 0.12 * Math.min(basic, PF_CEILING_BASIC)
  const taxable = Math.max(0, fixedGross - 75000)
  const tax = taxNewRegime(taxable)
  const inHandMonthly = Math.round((fixedGross - employeePf - PT - tax) / 12)
  return { ctc, fixedGross, basic, hra, special, variable, employerPf, gratuity, insurance: INSURANCE, employeePf, pt: PT, tax, inHandMonthly }
}

/** Cash plus what the terms cost you later. */
export function score(s: NegState): { cash: number; termsCost: number; net: number; notes: string[] } {
  const p = payslip(s.offer, s.variablePct)
  const guaranteedFirstYear = p.fixedGross - p.employeePf - p.tax
  const cash = guaranteedFirstYear + s.joining + s.relocation
  const notes: string[] = []
  const bondCost = s.bond * 90000
  const noticeCost = Math.max(0, s.notice - 2) * 40000
  if (s.bond > 0) notes.push(`${s.bond}-year bond: you cannot leave without a recovery bill`)
  if (s.notice > 2) notes.push(`${s.notice}-month notice: your next employer waits, or passes`)
  if (s.variablePct >= 15) notes.push(`${s.variablePct}% variable — paid at ${s.emp.variablePaid}% of target last year`)
  return { cash, termsCost: bondCost + noticeCost, net: cash - bondCost - noticeCost, notes }
}
