export interface GameMeta {
  id: string
  name: string
  tagline: string
  skill: string
  path: string
  colour: string
  soft: string
  ink: string
  how: string
}

export const games: GameMeta[] = [
  {
    id: 'mastermind',
    name: 'Mastermind',
    tagline: 'Break a four-peg code in ten guesses.',
    skill: 'Deduction under incomplete information',
    path: '/arcade/mastermind',
    colour: '#2f5bff',
    soft: '#e0e7ff',
    ink: '#ffffff',
    how: 'Six colours, four slots, ten guesses. Black peg = right colour in the right slot, white peg = right colour in the wrong slot. Score falls with every guess you spend.'
  },
  {
    id: 'sequence',
    name: 'Sequence',
    tagline: 'Repeat a growing pattern of flashes.',
    skill: 'Working-memory span',
    path: '/arcade/sequence',
    colour: '#0e8c6a',
    soft: '#d8f2e8',
    ink: '#ffffff',
    how: 'Four pads light up in order. Copy the order. Each success adds one more step — this is the span number interviewers are quietly testing when they ask you to walk them through a project.'
  },
  {
    id: 'oddtile',
    name: 'Odd tile',
    tagline: 'One tile in the grid is subtly different.',
    skill: 'Attention to detail · visual search',
    path: '/arcade/oddtile',
    colour: '#0f766e',
    soft: '#d6f2ee',
    ink: '#ffffff',
    how: 'A grid of identical tiles, one of which is rotated slightly, a touch smaller, or differently rounded. Tap it. The grid grows and the difference shrinks as you climb, and you get a median find time at the end — the number attention-to-detail assessments actually score.'
  },
  {
    id: 'estimate',
    name: 'Estimate',
    tagline: 'A guesstimate with the reasoning shown.',
    skill: 'Fermi estimation · consulting and product',
    path: '/arcade/estimate',
    colour: '#be123c',
    soft: '#ffe1e8',
    ink: '#ffffff',
    how: 'Four Fermi questions, scored on the ratio rather than the absolute error: within 50% is a defensible estimate, within 3× is the right order of magnitude. After each answer the chain of assumptions is revealed, because that is what an interviewer marks.'
  },
  {
    id: 'triage',
    name: 'Triage',
    tagline: 'Order five live issues before the weekend.',
    skill: 'Prioritisation · impact × urgency',
    path: '/arcade/triage',
    colour: '#7c3f00',
    soft: '#f3e7dc',
    ink: '#ffffff',
    how: 'A real on-call, launch or interview scenario with five items to rank. Your order is compared against an impact × urgency rubric, and every item explains why it sits where it does.'
  },
  {
    id: 'debug',
    name: 'Spot the bug',
    tagline: 'Name the mechanism, not the symptom.',
    skill: 'Code reading · debugging round',
    path: '/arcade/debug',
    colour: '#0f766e',
    soft: '#d6f2ee',
    ink: '#ffffff',
    how: 'Four short snippets in JavaScript, Python and SQL, each with one real defect and four explanations. Choosing the mechanism rather than the symptom is the mark being tested in a debugging interview.'
  },
  {
    id: 'maths',
    name: 'Maths sprint',
    tagline: 'Sixty seconds of mental arithmetic.',
    skill: 'Speed under time pressure',
    path: '/arcade/maths',
    colour: '#f5b01b',
    soft: '#fdf0cf',
    ink: '#12151a',
    how: 'One question at a time, four options, sixty seconds. Correct answers push the difficulty up; a wrong answer costs you three seconds.'
  }
]

export const gameById = (id: string) => games.find((g) => g.id === id)
