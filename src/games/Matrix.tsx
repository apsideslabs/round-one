import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { makePuzzle } from '@/lib/matrix'
import { MatrixCell } from '@/components/MatrixCell'
import { gameById } from '@/data/games'
import { Button } from '@/components/ui/button'
import { useProgress } from '@/store/progress'
import { soundFinish, soundRight, soundWrong } from '@/lib/fx'

const game = gameById('matrix')!
const ROUNDS = 6

export default function Matrix() {
  const recordGame = useProgress((s) => s.recordGame)
  const addXp = useProgress((s) => s.addXp)

  const [seed, setSeed] = useState(0)
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [done, setDone] = useState(false)

  const puzzle = useMemo(() => makePuzzle((seed + index) % 5), [seed, index])
  const isLast = index === ROUNDS - 1

  const choose = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    if (i === puzzle.answer) {
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
      recordGame('matrix', score * 100 / ROUNDS)
      if (score) addXp(score * 12)
      return
    }
    setIndex((i) => i + 1)
    setPicked(null)
  }

  const restart = () => {
    setSeed((s) => s + 1)
    setIndex(0)
    setScore(0)
    setPicked(null)
    setDone(false)
  }

  if (done) {
    const pct = Math.round((score / ROUNDS) * 100)
    return (
      <section className="w-full px-4 pb-24 pt-5 sm:px-6 md:pb-12 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Link to="/arcade" className="mono-label hover:text-ink">← Arcade</Link>
          <div className="card-pop mt-3 overflow-hidden">
            <div className="h-1.5" style={{ background: game.colour }} />
            <div className="p-5 sm:p-6">
              <h1 className="font-display text-2xl font-extrabold tracking-tight">
                {pct >= 84 ? 'Patterns read cleanly.' : pct >= 50 ? 'Mostly there.' : 'Look along the row first.'}
              </h1>
              <p className="mt-1.5 text-[13.5px] font-medium text-ink-2">
                {score} of {ROUNDS} matrices solved. Each one varies three things at once — shape across, count down, fill
                alternating — so the trick is to isolate one attribute at a time instead of staring at the whole grid.
              </p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" onClick={restart}>Another set</Button>
                <Button size="sm" variant="light" asChild><Link to="/arcade">Back to arcade</Link></Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full px-4 pb-24 pt-5 sm:px-6 md:pb-12 lg:px-8">
      <div className="mx-auto grid max-w-[900px] gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(220px,280px)]">
        <div className="min-w-0">
          <Link to="/arcade" className="mono-label hover:text-ink">← Arcade</Link>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-card px-3.5 py-2 shadow-[3px_3px_0_var(--color-ink)]">
            <span className="chip" style={{ background: game.soft }}>
              <span className="h-2 w-2 rounded-full border border-ink" style={{ background: game.colour }} />
              Pattern matrix
            </span>
            <div className="flex gap-2">
              <span className="chip border-line bg-[#f4f2ea]">Grid <b>{index + 1} / {ROUNDS}</b></span>
              <span className="chip border-line bg-[#f4f2ea]">Solved <b>{score}</b></span>
            </div>
          </div>

          <motion.div key={`${seed}-${index}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-pop mt-4 overflow-hidden">
            <div className="h-1.5" style={{ background: game.colour }} />
            <div className="p-5 sm:p-6">
              <p className="mono-label">Which tile completes the grid?</p>

              <div className="mt-3 grid w-full max-w-[420px] grid-cols-3 gap-1.5 rounded-xl border-2 border-ink bg-[#f7f5ee] p-2">
                {puzzle.grid.map((cell, i) =>
                  cell ? (
                    <div key={i} className="grid aspect-square place-items-center rounded-lg border-2 border-ink/15 bg-card">
                      <MatrixCell cell={cell} size={92} />
                    </div>
                  ) : (
                    <div key={i} className="grid aspect-square place-items-center rounded-lg border-2 border-dashed border-ink bg-c3-soft font-display text-3xl font-extrabold">
                      ?
                    </div>
                  )
                )}
              </div>

              <div className="mt-4 grid max-w-[420px] grid-cols-4 gap-2">
                {puzzle.options.map((option, i) => {
                  const state =
                    picked === null
                      ? 'idle'
                      : i === puzzle.answer
                        ? 'right'
                        : i === picked
                          ? 'wrong'
                          : 'dim'
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => choose(i)}
                      disabled={picked !== null}
                      className={`grid aspect-square place-items-center rounded-xl border-2 border-ink transition-all ${
                        state === 'right'
                          ? 'bg-ok'
                          : state === 'wrong'
                            ? 'bg-bad'
                            : state === 'dim'
                              ? 'bg-card opacity-40'
                              : 'bg-card shadow-[3px_3px_0_var(--color-ink)] hover:-translate-y-0.5'
                      }`}
                    >
                      <MatrixCell cell={option} size={78} />
                    </button>
                  )
                })}
              </div>

              {picked !== null && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-xl border-2 border-ink bg-c3-soft px-4 py-3">
                  <p className="text-[13px] font-medium leading-relaxed text-ink-2">
                    <b className="text-ink">{picked === puzzle.answer ? 'Correct.' : 'Not quite.'}</b> {puzzle.rule}
                  </p>
                  <div className="mt-2 flex justify-end">
                    <Button size="sm" onClick={next}>{isLast ? 'See the result →' : 'Next grid →'}</Button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-24 grid gap-3">
            <div className="card-pop p-4">
              <p className="mono-label mb-2">How to read it</p>
              <ol className="grid gap-1.5">
                {['Shape and rotation: compare any row left to right.', 'Count: compare any column top to bottom.', 'Fill: solid and hollow alternate like a chessboard.'].map((t, i) => (
                  <li key={t} className="grid grid-cols-[14px_1fr] gap-2 text-[12px] font-medium leading-relaxed text-ink-2">
                    <span className="font-mono text-[9px] font-bold text-ink-3">{i + 1}</span>
                    {t}
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-xl border-2 border-ink bg-card p-4">
              <p className="mono-label mb-1.5">Why this is on a test</p>
              <p className="text-[12.5px] font-medium leading-relaxed text-ink-2">
                Matrix reasoning is the most common non-verbal item on aptitude papers: it measures whether you can hold
                three rules at once. Fix one attribute, then the next.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
