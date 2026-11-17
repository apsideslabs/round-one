/**
 * Salary negotiation as a small state machine. The employer's ceiling is
 * hidden; your leverage is visible and everything you say moves it. Nothing
 * here is random — the same moves against the same employer give the same
 * result, which is the point: negotiation is a game of information, not luck.
 */
export type Move = 'anchor' | 'justify' | 'structure' | 'competing' | 'concede' | 'walk'

export interface NegState {
  offer: number // lakhs, current fixed CTC on the table
  ceiling: number // hidden maximum they will pay
  floor: number // hidden number they opened at
  leverage: number // 0..100
  turns: number
  usedCompeting: boolean
  usedJustify: number
  over: boolean
  outcome: 'deal' | 'walked' | 'lowball' | null
  log: Array<{ who: 'you' | 'them'; text: string }>
}

export const START: Omit<NegState, 'ceiling' | 'floor' | 'log'> = {
  offer: 6, leverage: 45, turns: 6, usedCompeting: false, usedJustify: 0, over: false, outcome: null
}

export function makeState(seed: number): NegState {
  const floor = 5.6 + (seed % 5) * 0.1
  const ceiling = floor + 1.6 + ((seed * 7) % 9) * 0.1
  return {
    ...START,
    offer: Number(floor.toFixed(1)),
    floor: Number(floor.toFixed(1)),
    ceiling: Number(ceiling.toFixed(1)),
    log: [{ who: 'them', text: `We can start you at ₹${floor.toFixed(1)} LPA fixed. That is our standard fresher band.` }]
  }
}

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))

export function play(s: NegState, move: Move): NegState {
  if (s.over) return s
  const st: NegState = { ...s, log: [...s.log], turns: s.turns - 1 }
  const push = (who: 'you' | 'them', text: string) => st.log.push({ who, text })
  const raise = (by: number) => {
    st.offer = Number(Math.min(st.ceiling, st.offer + by).toFixed(1))
  }

  switch (move) {
    case 'anchor': {
      push('you', 'I was expecting closer to the top of the band for this role.')
      st.leverage = clamp(st.leverage + 8)
      raise(0.3 + st.leverage / 220)
      push('them', 'That is above what we usually open with, but let me see what I can do.')
      break
    }
    case 'justify': {
      if (st.usedJustify >= 2) {
        st.leverage = clamp(st.leverage - 6)
        push('you', 'As I said, the market rate is higher.')
        push('them', 'You have made that point already.')
      } else {
        st.usedJustify++
        st.leverage = clamp(st.leverage + 12)
        raise(0.4)
        push('you', 'The band for this role in this city is published — I am asking inside it, not above it.')
        push('them', 'Fair. I can move a little on the fixed component.')
      }
      break
    }
    case 'structure': {
      push('you', 'Can we look at how much of the CTC is guaranteed rather than variable?')
      st.leverage = clamp(st.leverage + 6)
      raise(0.25)
      push('them', 'I can shift some of the variable into fixed. It does not change the headline.')
      break
    }
    case 'competing': {
      if (st.usedCompeting) {
        st.leverage = clamp(st.leverage - 25)
        push('you', 'I do have another offer on the table.')
        push('them', 'You mentioned that. It is starting to sound like a tactic.')
        st.offer = Number(Math.max(st.floor, st.offer - 0.2).toFixed(1))
      } else {
        st.usedCompeting = true
        st.leverage = clamp(st.leverage + 22)
        raise(0.6)
        push('you', 'I have an offer at a higher fixed number, but your team is my first choice.')
        push('them', 'I appreciate you telling me. Let me push this internally.')
      }
      break
    }
    case 'concede': {
      st.leverage = clamp(st.leverage - 10)
      push('you', 'I am happy to work with what you have.')
      push('them', 'Good. I will send the letter today.')
      st.over = true
      st.outcome = st.offer < st.floor + 0.7 ? 'lowball' : 'deal'
      break
    }
    case 'walk': {
      push('you', 'I do not think we will get there. Thank you for your time.')
      if (st.offer >= st.ceiling - 0.2) {
        push('them', 'Wait — let me check one more thing.')
        raise(0.3)
        st.over = true
        st.outcome = 'deal'
      } else {
        push('them', 'Understood. All the best.')
        st.over = true
        st.outcome = 'walked'
      }
      break
    }
  }

  if (!st.over && st.turns <= 0) {
    st.over = true
    st.outcome = st.offer > st.floor + 0.5 ? 'deal' : 'lowball'
  }
  return st
}

/** Guaranteed monthly in-hand, using the same structure as the offer desk. */
export function monthlyInHand(ctcLakh: number): number {
  const ctc = ctcLakh * 100000
  const fixedGross = ctc * 0.86
  const basic = fixedGross * 0.5
  const employeePf = 0.12 * basic
  return Math.round((fixedGross - employeePf - 2400) / 12)
}
