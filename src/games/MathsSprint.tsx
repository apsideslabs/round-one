import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gameById } from '@/data/games'
import { makeMathQuestion } from '@/lib/games'
import { Button } from '@/components/ui/button'
import { useProgress } from '@/store/progress'
import { haptic, soundFinish, soundRight, soundWrong } from '@/lib/fx'

const game = gameById('maths')!
const SECONDS = 60

export default function MathsSprint() {
  const recordGame = useProgress((s) => s.recordGame)
  const addXp = useProgress((s) => s.addXp)

  const [phase, setPhase] = useState<'idle' | 'playing' | 'over'>('idle')
  const [left, setLeft] = useState(SECONDS)
  const [score, setScore] = useState(0)
  const [asked, setAsked] = useState(0)
  const [streak, setStreak] = useState(0)
  const [tick, setTick] = useState(0)
  const [wrongPick, setWrongPick] = useState<number | null>(null)

  const question = useMemo(() => makeMathQuestion(score), [score, tick])

  useEffect(() => {
    if (phase !== 'playing') return
    const id = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          window.clearInterval(id)
          return 0
        }
        return l - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase === 'playing' && left === 0) {
      setPhase('over')
      soundFinish()
      recordGame('maths', score)
      if (score > 0) addXp(score * 2)
    }
  }, [left, phase, score, recordGame, addXp])

  const answer = (value: number) => {
    if (phase !== 'playing') return
    setAsked((a) => a + 1)
    if (value === question.answer) {
      soundRight()
      haptic(10)
      setScore((s) => s + 1)
      setStreak((s) => s + 1)
      setWrongPick(null)
    } else {
      soundWrong()
      haptic([12, 40, 12])
      setStreak(0)
      setWrongPick(value)
      setLeft((l) => Math.max(0, l - 3))
      setTick((t) => t + 1)
    }
  }

  const start = () => {
    setPhase('playing')
    setLeft(SECONDS)
    setScore(0)
    setAsked(0)
    setStreak(0)
    setWrongPick(null)
    setTick((t) => t + 1)
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-4 pb-12 pt-5 sm:px-6">
      <Link to="/arcade" className="mono-label hover:text-ink">
        ← Arcade
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-card px-3.5 py-2 shadow-[3px_3px_0_var(--color-ink)]">
        <span className="chip" style={{ background: game.soft }}>
          <span className="h-2 w-2 rounded-full border border-ink" style={{ background: game.colour }} />
          Maths sprint
        </span>
        <div className="flex gap-2">
          <span className={`chip border-line ${left <= 10 ? 'bg-c1-soft' : 'bg-[#f4f2ea]'}`}>
            <b>{left}s</b>
          </span>
          <span className="chip border-line bg-[#f4f2ea]">
            Score <b>{score}</b>
          </span>
        </div>
      </div>

      <div className="card-pop mt-4 overflow-hidden">
        <div className="h-1.5" style={{ background: game.colour }} />
        <div className="p-5 sm:p-6">
          {phase === 'idle' && (
            <>
              <h1 className="font-display text-2xl font-extrabold tracking-tight">Sixty seconds</h1>
              <p className="mt-1 text-[13px] font-medium text-ink-3">
                Mental arithmetic under time. A wrong answer costs three seconds.
              </p>
              <Button className="mt-4" size="sm" onClick={start}>
                Start sprint
              </Button>
            </>
          )}

          {phase === 'playing' && (
            <>
              <p className="mono-label">question {asked + 1} · streak {streak}</p>
              <motion.h1
                key={`${score}-${tick}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 font-display text-5xl font-extrabold tracking-tight"
              >
                {question.prompt}
              </motion.h1>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {question.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => answer(option)}
                    className={`rounded-xl border-2 border-ink px-3 py-3.5 font-display text-xl font-extrabold shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 ${
                      wrongPick === option ? 'bg-bad text-white' : 'bg-card'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}

          {phase === 'over' && (
            <>
              <h1 className="font-display text-2xl font-extrabold tracking-tight">
                {score >= 20 ? 'Sharp.' : score >= 12 ? 'Solid.' : 'Keep drilling.'}
              </h1>
              <p className="mt-1 text-[13px] font-medium text-ink-2">
                {score} correct from {asked} asked in sixty seconds.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={start}>
                  Sprint again
                </Button>
                <Button size="sm" variant="light" asChild>
                  <Link to="/arcade">Back to arcade</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
