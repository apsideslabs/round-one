import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { estimates } from '@/data/simulations'
import { estimateScore } from '@/lib/simulations'
import { gameById } from '@/data/games'
import { Button } from '@/components/ui/button'
import { useProgress } from '@/store/progress'
import { soundFinish, soundRight, soundWrong } from '@/lib/fx'
import { shuffle } from '@/lib/utils'

const game = gameById('estimate')!
const ROUNDS = 4

export default function Estimate() {
  const recordGame = useProgress((s) => s.recordGame)
  const addXp = useProgress((s) => s.addXp)

  const [runId, setRunId] = useState(0)
  const deck = useMemo(() => shuffle(estimates).slice(0, ROUNDS), [runId])
  const [index, setIndex] = useState(0)
  const [value, setValue] = useState('')
  const [result, setResult] = useState<{ ratio: number; points: number; verdict: string } | null>(null)
  const [scores, setScores] = useState<number[]>([])
  const [done, setDone] = useState(false)

  const item = deck[index]
  const total = scores.reduce((a, b) => a + b, 0)
  const final = scores.length ? Math.round(total / scores.length) : 0

  const submit = () => {
    const guess = Number(value)
    if (!value || !isFinite(guess)) return
    const r = estimateScore(guess, item.answer)
    setResult(r)
    setScores((s) => [...s, r.points])
    if (r.points >= 70) soundRight()
    else soundWrong()
  }

  const next = () => {
    if (index === deck.length - 1) {
      setDone(true)
      soundFinish()
      const avg = Math.round([...scores].reduce((a, b) => a + b, 0) / scores.length)
      recordGame('estimate', avg)
      if (avg > 0) addXp(avg)
      return
    }
    setIndex((i) => i + 1)
    setValue('')
    setResult(null)
  }

  const restart = () => {
    setRunId((n) => n + 1)
    setIndex(0)
    setValue('')
    setResult(null)
    setScores([])
    setDone(false)
  }

  if (done) {
    return (
      <section className="mx-auto w-full max-w-2xl px-4 pb-12 pt-5 sm:px-6">
        <Link to="/arcade" className="mono-label hover:text-ink">← Arcade</Link>
        <div className="card-pop mt-3 overflow-hidden">
          <div className="h-1.5" style={{ background: game.colour }} />
          <div className="p-5 sm:p-6">
            <h1 className="font-display text-2xl font-extrabold tracking-tight">
              {final >= 80 ? 'Structured.' : final >= 50 ? 'Roughly right.' : 'Start with the population.'}
            </h1>
            <p className="mt-1 text-[13.5px] font-medium text-ink-2">
              {final} points across {scores.length} estimates. In a real guesstimate the interviewer marks the chain of
              assumptions, not the number — so the reveal below is the part worth rereading.
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" onClick={restart}>Run it again</Button>
              <Button size="sm" variant="light" asChild><Link to="/arcade">Back to arcade</Link></Button>
            </div>
          </div>
        </div>
        <ul className="mt-4 grid gap-2">
          {deck.map((d, i) => (
            <li key={d.id} className="rounded-xl border-2 border-ink bg-card px-3.5 py-2.5 shadow-[2px_2px_0_var(--color-ink)]">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[13.5px] font-extrabold leading-snug">{d.question}</span>
                <span className="chip">{scores[i] ?? 0} pts</span>
              </div>
              <p className="mt-1 text-[12.5px] font-medium text-ink-2">
                Model answer: <b className="text-ink">{d.answer.toLocaleString('en-IN')} {d.unit}</b>
              </p>
              <ul className="mt-1.5 grid gap-1">
                {d.model.map((line) => (
                  <li key={line} className="text-[12px] font-medium leading-relaxed text-ink-3">· {line}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-4 pb-12 pt-5 sm:px-6">
      <Link to="/arcade" className="mono-label hover:text-ink">← Arcade</Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-card px-3.5 py-2 shadow-[3px_3px_0_var(--color-ink)]">
        <span className="chip" style={{ background: game.soft }}>
          <span className="h-2 w-2 rounded-full border border-ink" style={{ background: game.colour }} />
          Estimate
        </span>
        <div className="flex gap-2">
          <span className="chip border-line bg-[#f4f2ea]">Estimate <b>{index + 1} / {deck.length}</b></span>
          <span className="chip border-line bg-[#f4f2ea]">Score <b>{total}</b></span>
        </div>
      </div>

      <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-pop mt-4 overflow-hidden">
        <div className="h-1.5" style={{ background: game.colour }} />
        <div className="p-5 sm:p-6">
          <p className="mono-label">guesstimate</p>
          <h1 className="mt-1 text-balance font-display text-2xl font-extrabold leading-tight tracking-tight">{item.question}</h1>

          <label className="mt-5 block">
            <span className="mono-label">Your answer, in {item.unit}</span>
            <input
              type="number"
              inputMode="decimal"
              value={value}
              disabled={!!result}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (result ? next() : submit())}
              placeholder="e.g. 120"
              className="mt-1 w-full rounded-xl border-2 border-ink bg-card px-3.5 py-3 font-display text-2xl font-extrabold outline-none focus:border-c4"
            />
          </label>

          {!result ? (
            <Button className="mt-3" size="sm" onClick={submit} disabled={!value}>Lock it in</Button>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-xl border-2 border-ink bg-c3-soft px-4 py-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-lg font-extrabold">{result.points} points</span>
                <span className="chip bg-card">{result.verdict}</span>
              </div>
              <p className="mt-1 text-[13px] font-medium text-ink-2">
                Model answer: <b className="text-ink">{item.answer.toLocaleString('en-IN')} {item.unit}</b>
                {isFinite(result.ratio) && <> · you were {result.ratio.toFixed(1)}× away</>}
              </p>
              <ol className="mt-2 grid gap-1">
                {item.model.map((line, i) => (
                  <li key={line} className="grid grid-cols-[16px_1fr] gap-2 text-[12.5px] font-medium leading-relaxed text-ink-2">
                    <span className="font-mono text-[10px] font-bold text-ink-3">{i + 1}</span>
                    {line}
                  </li>
                ))}
              </ol>
              <div className="mt-3 flex justify-end">
                <Button size="sm" onClick={next}>{index === deck.length - 1 ? 'See the summary →' : 'Next estimate →'}</Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
