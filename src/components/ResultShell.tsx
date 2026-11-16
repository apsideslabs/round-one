import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { RadarProfile } from '@/components/RadarProfile'
import type { Track } from '@/data/tracks'
import { useProgress } from '@/store/progress'
import { pct } from '@/lib/utils'

interface Props {
  track: Track
  score: number
  correct: number
  total: number
  note?: string
  onRetry: () => void
  children: ReactNode
}

export function ResultShell({ track, score, correct, total, note, onRetry, children }: Props) {
  const scores = useProgress((s) => s.scores)
  const percent = pct(score, track.max)
  const headline =
    percent >= 85 ? 'Panel-ready.' : percent >= 65 ? 'Almost there.' : percent >= 40 ? 'The pattern is showing.' : 'Start with the basis.'

  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-28 pt-6 sm:px-6">
      <div className="card-pop overflow-hidden">
        <div className="grid items-center gap-5 p-5 sm:grid-cols-[auto_1fr] sm:p-7">
          <motion.div
            initial={{ rotate: -12, scale: 0.85, opacity: 0 }}
            animate={{ rotate: -6, scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            className="grid h-28 w-28 place-items-center rounded-full border-2 border-ink text-center shadow-[4px_4px_0_var(--color-ink)]"
            style={{ background: track.colour, color: track.ink }}
          >
            <div>
              <span className="block font-display text-3xl font-extrabold leading-none">{percent}%</span>
              <span className="mt-1 block font-mono text-[7px] font-bold uppercase leading-tight tracking-[0.14em]">{track.name}</span>
            </div>
          </motion.div>
          <div>
            <span className="chip">
              <span className="h-2 w-2 rounded-full" style={{ background: track.colour }} /> Round complete
            </span>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{headline}</h1>
            <p className="mt-1.5 max-w-[46ch] text-sm font-medium text-ink-2">
              {note ?? `You scored ${score} of ${track.max} points. Your best attempt is what counts towards readiness.`}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {[
          { n: `${score}`, d: `/ ${track.max}`, l: 'points' },
          { n: `${correct}`, d: `/ ${total}`, l: 'correct' },
          { n: `${percent}`, d: '%', l: 'this round' }
        ].map((s) => (
          <div key={s.l} className="rounded-xl border-2 border-ink px-3.5 py-3 shadow-[3px_3px_0_var(--color-ink)]" style={{ background: track.soft }}>
            <span className="block font-display text-xl font-extrabold leading-tight">
              {s.n}
              <small className="text-[0.55em] text-ink-3"> {s.d}</small>
            </span>
            <span className="mono-label">{s.l}</span>
          </div>
        ))}
      </div>

      <div className="card-pop mt-4 grid items-center gap-4 p-4 sm:grid-cols-[240px_1fr]">
        <RadarProfile scores={scores} />
        <div>
          <p className="mono-label mb-1">Score profile</p>
          <p className="text-sm font-medium leading-relaxed text-ink-2">
            A dent on any axis is the round that will cost you the offer.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="mb-2.5 font-display text-lg font-extrabold tracking-tight">Every question, and the reasoning</h2>
        {children}
      </div>

      <div className="mt-5 flex flex-wrap gap-2.5">
        <Button variant="accent" onClick={onRetry} className="flex-1">
          Run this round again
        </Button>
        <Button variant="light" asChild className="flex-1">
          <Link to="/">Back to home</Link>
        </Button>
      </div>
    </section>
  )
}
