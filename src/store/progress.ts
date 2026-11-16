import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TrackId } from '@/data/tracks'

export type Scores = Record<TrackId, number>

interface ProgressState {
  scores: Scores
  xp: number
  attempts: number
  muted: boolean
  lastRound: TrackId | null
  record: (track: TrackId, points: number) => void
  addXp: (points: number) => void
  toggleMute: () => void
  reset: () => void
}

const emptyScores: Scores = { logic: 0, memory: 0, riddles: 0, panel: 0, morality: 0 }

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      scores: { ...emptyScores },
      xp: 0,
      attempts: 0,
      muted: false,
      lastRound: null,
      record: (track, points) =>
        set((state) => ({
          scores: { ...state.scores, [track]: Math.max(state.scores[track] ?? 0, points) },
          attempts: state.attempts + 1,
          lastRound: track
        })),
      addXp: (points) => set((state) => ({ xp: Math.max(0, state.xp + points) })),
      toggleMute: () => set((state) => ({ muted: !state.muted })),
      reset: () => set({ scores: { ...emptyScores }, xp: 0, attempts: 0, lastRound: null })
    }),
    { name: 'round-one-progress' }
  )
)

export const level = (xp: number) => Math.floor(xp / 100) + 1
export const levelProgress = (xp: number) => xp % 100
