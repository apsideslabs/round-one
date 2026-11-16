import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gameById } from '@/data/games'
import { extendSequence, sequenceScore } from '@/lib/games'
import { Button } from '@/components/ui/button'
import { useProgress } from '@/store/progress'
import { haptic, soundFinish, soundRight, soundWrong } from '@/lib/fx'

const game = gameById('sequence')!
const PADS = [
  { colour: '#0e8c6a', tone: 392 },
  { colour: '#ff4b26', tone: 523 },
  { colour: '#f5b01b', tone: 659 },
  { colour: '#2f5bff', tone: 784 }
]
const FLASH_MS = 520

type Phase = 'idle' | 'showing' | 'input' | 'over'

export default function Sequence() {
  const recordGame = useProgress((s) => s.recordGame)
  const addXp = useProgress((s) => s.addXp)

  const [phase, setPhase] = useState<Phase>('idle')
  const [sequence, setSequence] = useState<number[]>([])
  const [flash, setFlash] = useState<number | null>(null)
  const [cursor, setCursor] = useState(0)
  const [best, setBest] = useState(0)
  const timers = useRef<number[]>([])

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }
  useEffect(() => clearTimers, [])

  const play = useCallback((seq: number[]) => {
    setPhase('showing')
    clearTimers()
    seq.forEach((pad, i) => {
      timers.current.push(
        window.setTimeout(() => setFlash(pad), i * (FLASH_MS + 120)),
        window.setTimeout(() => setFlash(null), i * (FLASH_MS + 120) + FLASH_MS)
      )
    })
    timers.current.push(
      window.setTimeout(() => {
        setPhase('input')
        setCursor(0)
      }, seq.length * (FLASH_MS + 120) + 120)
    )
  }, [])

  const start = () => {
    const seq = extendSequence([])
    setSequence(seq)
    setBest(0)
    play(seq)
  }

  const press = (pad: number) => {
    if (phase !== 'input') return
    if (pad !== sequence[cursor]) {
      soundWrong()
      haptic([14, 50, 14])
      setPhase('over')
      const reached = Math.max(0, sequence.length - 1)
      if (reached > best) setBest(reached)
      const points = sequenceScore(sequence.length - 1)
      if (points > 0) {
        recordGame('sequence', points)
        addXp(points)
      }
      soundFinish()
      return
    }

    soundRight()
    setFlash(pad)
    window.setTimeout(() => setFlash(null), 180)

    if (cursor + 1 === sequence.length) {
      const next = extendSequence(sequence)
      setSequence(next)
      setBest(next.length - 1)
      window.setTimeout(() => play(next), 620)
    } else {
      setCursor((c) => c + 1)
    }
  }

  const level = Math.max(0, sequence.length - 1)

  return (
    <section className="mx-auto w-full max-w-2xl px-4 pb-28 pt-5 sm:px-6">
      <Link to="/arcade" className="mono-label hover:text-ink">
        ← Arcade
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-card px-3.5 py-2 shadow-[3px_3px_0_var(--color-ink)]">
        <span className="chip" style={{ background: game.soft }}>
          <span className="h-2 w-2 rounded-full border border-ink" style={{ background: game.colour }} />
          Sequence
        </span>
        <div className="flex gap-2">
          <span className="chip border-line bg-[#f4f2ea]">
            Span <b>{level}</b>
          </span>
          <span className="chip border-line bg-[#f4f2ea]">
            Best <b>{best}</b>
          </span>
        </div>
      </div>

      <div className="card-pop mt-4 overflow-hidden">
        <div className="h-1.5" style={{ background: game.colour }} />
        <div className="p-5 sm:p-6">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Repeat the pattern</h1>
          <p className="mt-1 text-[13px] font-medium text-ink-3">
            {phase === 'idle' && 'Four pads light in order. Copy the order exactly.'}
            {phase === 'showing' && 'Watch…'}
            {phase === 'input' && `Your turn — ${cursor} of ${sequence.length}`}
            {phase === 'over' && `You held ${level} step${level === 1 ? '' : 's'}.`}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            {PADS.map((pad, i) => (
              <button
                key={i}
                type="button"
                onClick={() => press(i)}
                disabled={phase !== 'input'}
                aria-label={`Pad ${i + 1}`}
                className="h-24 rounded-xl border-2 border-ink shadow-[3px_3px_0_var(--color-ink)] transition-all duration-100 sm:h-28"
                style={{
                  background: pad.colour,
                  opacity: flash === i ? 1 : 0.42,
                  transform: flash === i ? 'translateY(-2px) scale(1.02)' : undefined,
                  cursor: phase === 'input' ? 'pointer' : 'default'
                }}
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {phase === 'idle' && (
              <Button size="sm" onClick={start}>
                Start
              </Button>
            )}
            {(phase === 'showing' || phase === 'input') && (
              <span className="chip bg-[#f4f2ea] border-line">
                {phase === 'showing' ? 'watch the pattern' : 'repeat it'}
              </span>
            )}
            {phase === 'over' && (
              <>
                <Button size="sm" onClick={start}>
                  Play again
                </Button>
                <span className="chip bg-c3-soft">+{sequenceScore(sequence.length - 1)} points</span>
              </>
            )}
          </div>

          {phase === 'over' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-[13px] font-medium text-ink-2">
              Working-memory span is what interviewers probe when they ask you to walk through a project without notes.
              Seven is the classic ceiling; anything above five is strong.
            </motion.p>
          )}
        </div>
      </div>

      <p className="mono-label mt-3 text-center">click a pad to start · the pattern grows by one each time</p>
    </section>
  )
}
