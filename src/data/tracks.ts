import { logic } from './logic'
import { riddles } from './riddles'
import { memory } from './memory'
import { interview } from './interview'

export type TrackId = 'logic' | 'memory' | 'riddles' | 'panel'

export interface Track {
  id: TrackId
  no: string
  name: string
  short: string
  path: string
  colour: string
  soft: string
  ink: string
  blurb: string
  meta: string[]
  max: number
  weight: number
}

export const tracks: Track[] = [
  {
    id: 'logic', no: '01', name: 'Logic & aptitude', short: 'Logic', path: '/logic',
    colour: '#ff4b26', soft: '#ffe3da', ink: '#ffffff',
    blurb: 'Series, odd-one-out, syllogisms and data reasoning.',
    meta: [`${logic.length} questions`, '30s each'], max: logic.length * 10, weight: 0.3
  },
  {
    id: 'memory', no: '02', name: 'Memory & recall', short: 'Memory', path: '/memory',
    colour: '#0e8c6a', soft: '#d8f2e8', ink: '#ffffff',
    blurb: 'Read a brief once, answer from memory.',
    meta: [`${memory.length} briefs`, '12s to read'], max: memory.length * 3 * 10, weight: 0.2
  },
  {
    id: 'riddles', no: '03', name: 'Riddles & traps', short: 'Riddles', path: '/riddles',
    colour: '#f5b01b', soft: '#fdf0cf', ink: '#12151a',
    blurb: 'Baited questions. Refuse the reflex answer.',
    meta: [`${riddles.length} riddles`, '45s each'], max: riddles.length * 10, weight: 0.2
  },
  {
    id: 'panel', no: '04', name: 'The panel', short: 'Panel', path: '/panel',
    colour: '#2f5bff', soft: '#e0e7ff', ink: '#ffffff',
    blurb: 'Real questions, scored on structure.',
    meta: [`${interview.length} questions`, 'untimed'], max: interview.length * 4, weight: 0.3
  }
]

export const trackById = (id: TrackId) => tracks.find((t) => t.id === id)!
export const QUESTION_COUNT = logic.length + riddles.length + memory.length * 3 + interview.length
