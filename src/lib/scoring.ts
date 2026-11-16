import { tracks, type TrackId } from '@/data/tracks'
import type { Scores } from '@/store/progress'

export function readiness(scores: Scores) {
  let sum = 0
  let weight = 0
  for (const t of tracks) {
    const value = Math.min(scores[t.id as TrackId] ?? 0, t.max)
    sum += t.weight * (value / t.max)
    weight += t.weight
  }
  return Math.round((sum / weight) * 100)
}

export const bestOf = (scores: Scores, id: TrackId) => Math.min(scores[id] ?? 0, tracks.find((t) => t.id === id)!.max)
