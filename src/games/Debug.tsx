import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { bugQuestions } from '@/data/simulations'
import { gameById } from '@/data/games'
import { Button } from '@/components/ui/button'
import { useProgress } from '@/store/progress'
import { soundFinish, soundRight, soundWrong } from '@/lib/fx'
import { shuffle } from '@/lib/utils'

const game = gameById('debug')!

export default function Debug() {
  const recordGame = useProgress((s) => s.recordGame)
  const addXp = useProgress((s) => s.addXp)

  const [runId, setRunId] = useState(0)
  const deck = useMemo(() => shuffle(bugQuestions), [runId])
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q = deck[index]
  const isLast = index === deck.length - 1

  const choose = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    if (i === q.answer) {
      setScore((s) => s + 1)
      soundRight()
    } else {
      soundWrong()
    }
  }

  const next = () => {
    if (isLast) {
      setDone(true)
      soundFinish()
      recordGame('debug', score * 25)
      if (score > 0) addXp(score * 25)
      return
    }
    setIndex((i) => i + 1)
    setPicked(null)
  }

  const restart = () => {
    setRunId((n) => n + 1)
    setIndex(0)
    setPicked(null)
    setScore(0)
    setDone(false)
  }

  if (done) {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 pb-28 pt-5 sm:px-6">
        <Link to="/arcade" className="mono-label hover:text-ink">← Arcade</Link>
        <div className="card-pop mt-3 overflow-hidden">
          <div className="h-1.5" style={{ background: game.colour }} />
          <div className="p-5 sm:p-6">
            <h1 className="font-display text-2xl font-extrabold tracking-tight">
              {score === deck.length ? 'Clean sweep.' : score >= 2 ? 'Good eye.' : 'Read the scope, not the syntax.'}
            </h1>
            <p className="mt-1 text-[13.5px] font-medium text-ink-2">
              {score} of {deck.length} bugs found. In a real debugging round, naming the *mechanism* is what earns the mark —
              "it is broken" does not.
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={restart}>Run it again</Button>
              <Button size="sm" variant="light" asChild><Link to="/arcade">Back to arcade</Link></Button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-4 pb-28 pt-5 sm:px-6">
      <Link to="/arcade" className="mono-label hover:text-ink">← Arcade</Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-card px-3.5 py-2 shadow-[3px_3px_0_var(--color-ink)]">
        <span className="chip" style={{ background: game.soft }}>
          <span className="h-2 w-2 rounded-full border border-ink" style={{ background: game.colour }} />
          Spot the bug
        </span>
        <div className="flex gap-2">
          <span className="chip border-line bg-[#f4f2ea]">Bug <b>{index + 1} / {deck.length}</b></span>
          <span className="chip border-line bg-[#f4f2ea]">Found <b>{score}</b></span>
        </div>
      </div>

      <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-pop mt-4 overflow-hidden">
        <div className="h-1.5" style={{ background: game.colour }} />
        <div className="p-5 sm:p-6">
          <p className="mono-label">{q.language}</p>
          <h1 className="mt-1 text-balance font-display text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">{q.prompt}</h1>

          <pre className="mt-3 overflow-x-auto rounded-xl border-2 border-ink bg-[#f7f5ee] p-3.5 font-mono text-[12px] leading-relaxed text-ink">
            <code>{q.code}</code>
          </pre>

          <div className="mt-3 grid gap-2">
            {q.options.map((option, i) => (
              <button
                key={option}
                type="button"
                onClick={() => choose(i)}
                disabled={picked !== null}
                className={`rounded-lg border-2 border-ink px-3 py-2.5 text-left text-[13.5px] font-bold shadow-[2px_2px_0_var(--color-ink)] transition-all ${
                  picked === null
                    ? 'bg-card hover:-translate-y-0.5'
                    : i === q.answer
                      ? 'bg-ok text-white'
                      : i === picked
                        ? 'bg-bad text-white'
                        : 'bg-card opacity-45'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {picked !== null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 rounded-xl border-2 border-ink bg-c3-soft px-4 py-3">
              <p className="text-[13px] font-medium leading-relaxed text-ink-2">
                <b className="text-ink">{picked === q.answer ? 'Right.' : 'Not quite.'}</b> {q.why}
              </p>
              <div className="mt-2 flex justify-end">
                <Button size="sm" onClick={next}>{isLast ? 'See the result →' : 'Next bug →'}</Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
