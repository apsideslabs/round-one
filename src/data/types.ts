export type Difficulty = 'easy' | 'medium' | 'hard'

export interface Mcq {
  id: string
  tag: string
  prompt: string
  options: string[]
  answer: number
  why: string
  difficulty: Difficulty
}

export interface MemoryBrief {
  id: string
  name: string
  seconds: number
  facts: Array<[string, string]>
  questions: Mcq[]
}

export interface PanelQuestion {
  id: string
  tag: string
  question: string
  skeleton: string[]
  checks: string[]
  model: string
}

export interface GuideSection {
  heading: string
  body: string[]
  example?: { q: string; answer: string; why: string }
}

export interface Guide {
  slug: string
  title: string
  kicker: string
  minutes: number
  summary: string
  sections: GuideSection[]
}
