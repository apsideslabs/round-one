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
