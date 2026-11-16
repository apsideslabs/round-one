import type { TriageItem, TriageScenario } from '@/data/simulations'

/** Guesstimate scoring: credit falls off with the ratio, not the absolute error. */
export function estimateScore(guess: number, answer: number): { ratio: number; points: number; verdict: string } {
  if (!isFinite(guess) || guess <= 0) return { ratio: Infinity, points: 0, verdict: 'No answer' }
  const ratio = Math.max(guess / answer, answer / guess)
  if (ratio <= 1.5) return { ratio, points: 100, verdict: 'Within 50% — a defensible estimate' }
  if (ratio <= 3) return { ratio, points: 70, verdict: 'Within 3× — the right order of magnitude' }
  if (ratio <= 10) return { ratio, points: 40, verdict: 'Within 10× — the structure may still be sound' }
  return { ratio, points: 10, verdict: 'Off by more than 10× — check the first assumption' }
}

/** The rubric order: impact × urgency, highest first, ties broken by impact. */
export function rubricOrder(items: TriageItem[]): string[] {
  return [...items]
    .sort((a, b) => b.impact * b.urgency - a.impact * a.urgency || b.impact - a.impact)
    .map((i) => i.id)
}

export function triageScore(scenario: TriageScenario, order: string[]): { points: number; exact: number; rubric: string[] } {
  const rubric = rubricOrder(scenario.items)
  const exact = rubric.filter((id, i) => order[i] === id).length
  return { points: Math.round((exact / rubric.length) * 100), exact, rubric }
}
