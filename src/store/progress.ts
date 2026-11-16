import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TrackId } from '@/data/tracks'

export type Scores = Record<TrackId, number>
export type GameBests = Record<string, number>

interface ProgressState {
  scores: Scores
  xp: number
  attempts: number
  muted: boolean
  lastRound: TrackId | null
  gameBests: GameBests
  record: (track: TrackId, points: number) => void
  addXp: (points: number) => void
  recordGame: (game: string, score: number) => void
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
      gameBests: {},
      record: (track, points) =>
        set((state) => ({
          scores: { ...state.scores, [track]: Math.max(state.scores[track] ?? 0, points) },
          attempts: state.attempts + 1,
          lastRound: track
        })),
      addXp: (points) => set((state) => ({ xp: Math.max(0, state.xp + points) })),
      recordGame: (game, score) =>
        set((state) => ({
          gameBests: { ...state.gameBests, [game]: Math.max(state.gameBests[game] ?? 0, score) }
        })),
      toggleMute: () => set((state) => ({ muted: !state.muted })),
      reset: () => set({ scores: { ...emptyScores }, xp: 0, attempts: 0, lastRound: null, gameBests: {} })
    }),
    {
      name: 'round-one-progress',
      version: 3,
      // saves written before the morality round lack that key; fill it in
      migrate: (persisted) => {
        const old = (persisted ?? {}) as Partial<ProgressState>
        return {
          ...old,
          scores: { ...emptyScores, ...(old.scores ?? {}) },
          gameBests: { ...(old.gameBests ?? {}) }
        } as ProgressState
      }
    }
  )
)

export const level = (xp: number) => Math.floor(xp / 100) + 1
export const levelProgress = (xp: number) => xp % 100
