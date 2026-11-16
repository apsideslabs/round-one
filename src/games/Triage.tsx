import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { triageScenarios } from '@/data/simulations'
import { triageScore } from '@/lib/simulations'
import { gameById } from '@/data/games'
import { Button } from '@/components/ui/button'
import { useProgress } from '@/store/progress'
import { soundFinish, soundRight } from '@/lib/fx'
import { shuffle } from '@/lib/utils'

const game = gameById('triage')!

export default function Triage() {
  const recordGame = useProgress((s) => s.recordGame)
  const addXp = useProgress((s) => s.addXp)

  const [runId, setRunId] = useState(0)
  const scenario = useMemo(() => shuffle(triageScenarios)[0], [runId])
  const [order, setOrder] = useState<string[]>([])
  const [checked, setChecked] = useState<{ points: number; exact: number; rubric: string[] } | null>(null)

  const items = scenario.items
  const byId = (id: string) => items.find((i) => i.id === id)!

  const pick = (id: string) => {
    if (checked) return
    setOrder((o) => [...o, id])
    soundRight()
  }
  const undo = () => setOrder((o) => o.slice(0, -1))

  const submit = () => {
    const result = triageScore(scenario, order)
    setChecked(result)
    soundFinish()
    recordGame('triage', result.points)
    if (result.points > 0) addXp(result.points)
  }

  const restart = () => {
    setRunId((n) => n + 1)
    setOrder([])
    setChecked(null)
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-4 pb-12 pt-5 sm:px-6">
      <Link to="/arcade" className="mono-label hover:text-ink">← Arcade</Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-card px-3.5 py-2 shadow-[3px_3px_0_var(--color-ink)]">
        <span className="chip" style={{ background: game.soft }}>
          <span className="h-2 w-2 rounded-full border border-ink" style={{ background: game.colour }} />
          Triage
        </span>
        <span className="chip border-line bg-[#f4f2ea]">{order.length} / {items.length} placed</span>
      </div>

      <div className="card-pop mt-4 overflow-hidden">
        <div className="h-1.5" style={{ background: game.colour }} />
        <div className="p-5 sm:p-6">
          <p className="mono-label">{scenario.title}</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight tracking-tight">Order it, first to last</h1>
          <p className="mt-1.5 max-w-[58ch] text-[13.5px] font-medium leading-relaxed text-ink-2">{scenario.brief}</p>

          <ol className="mt-4 grid gap-2">
            {order.map((id, i) => (
              <motion.li key={id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 rounded-lg border-2 border-ink bg-card px-3 py-2">
                <span className="grid h-6 w-6 place-items-center rounded-md border-2 border-ink bg-c3-soft font-mono text-[11px] font-bold">{i + 1}</span>
                <span className="min-w-0 flex-1 text-[13.5px] font-bold">{byId(id).label}</span>
                {checked && (
                  <span className="chip">
                    {checked.rubric[i] === id ? 'match' : `rubric ${checked.rubric.indexOf(id) + 1}`}
                  </span>
                )}
              </motion.li>
            ))}
          </ol>

          {!checked && (
            <>
              <div className="mt-3 grid gap-2">
                {items.filter((i) => !order.includes(i.id)).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => pick(item.id)}
                    className="rounded-lg border-2 border-ink bg-card px-3 py-2.5 text-left text-[13.5px] font-bold shadow-[2px_2px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={submit} disabled={order.length !== items.length}>Check my order</Button>
                <Button size="sm" variant="light" onClick={undo} disabled={!order.length}>Undo</Button>
              </div>
            </>
          )}

          {checked && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-xl border-2 border-ink bg-c3-soft px-4 py-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-lg font-extrabold">{checked.points} points</span>
                <span className="chip bg-card">{checked.exact} of {items.length} in the right slot</span>
              </div>
              <p className="mt-1 text-[12.5px] font-medium text-ink-2">
                The rubric sorts by impact × urgency. Your reasoning matters more than the exact order — read why each one sits where it does.
              </p>
              <ul className="mt-2 grid gap-2">
                {checked.rubric.map((id, i) => (
                  <li key={id} className="text-[12.5px] font-medium leading-relaxed text-ink-2">
                    <b className="text-ink">{i + 1}. {byId(id).label}</b> — {byId(id).why}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={restart}>Another scenario</Button>
                <Button size="sm" variant="light" asChild><Link to="/arcade">Back to arcade</Link></Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
