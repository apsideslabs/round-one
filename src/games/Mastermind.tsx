import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gameById } from '@/data/games'
import { CODE_LENGTH, PEG_COLOURS, randomCode, scoreGuess } from '@/lib/games'
import { Button } from '@/components/ui/button'
import { useProgress } from '@/store/progress'
import { celebrate, haptic, soundFinish, soundRight, soundWrong } from '@/lib/fx'

const game = gameById('mastermind')!
const MAX_GUESSES = 10

interface Row {
  code: number[]
  exact: number
  partial: number
}

export default function Mastermind() {
  const recordGame = useProgress((s) => s.recordGame)
  const addXp = useProgress((s) => s.addXp)

  const [round, setRound] = useState(0)
  const secret = useMemo(() => randomCode(), [round])
  const [current, setCurrent] = useState<number[]>([])
  const [rows, setRows] = useState<Row[]>([])
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing')
  const [started] = useState(() => Date.now())
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (status !== 'playing') return
    const id = window.setInterval(() => setElapsed(Math.round((Date.now() - started) / 1000)), 1000)
    return () => window.clearInterval(id)
  }, [status, started])

  const score = status === 'won' ? Math.max(20, 130 - rows.length * 10) : 0

  const finish = (won: boolean) => {
    setStatus(won ? 'won' : 'lost')
    if (won) {
      soundFinish()
      celebrate()
      const points = Math.max(20, 130 - rows.length * 10)
      recordGame('mastermind', points)
      addXp(points)
    } else {
      soundWrong()
    }
  }

  const submit = () => {
    if (current.length !== CODE_LENGTH || status !== 'playing') return
    const { exact, partial } = scoreGuess(secret, current)
    const next = [...rows, { code: current, exact, partial }]
    setRows(next)
    setCurrent([])
    if (exact === CODE_LENGTH) {
      soundRight()
      finish(true)
    } else if (next.length === MAX_GUESSES) {
      finish(false)
    } else {
      soundRight()
      haptic(12)
    }
  }

  const place = (colour: number) => {
    if (status !== 'playing' || current.length >= CODE_LENGTH) return
    setCurrent((c) => [...c, colour])
  }

  const undo = () => setCurrent((c) => c.slice(0, -1))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') submit()
      else if (e.key === 'Backspace') undo()
      else if (/^[1-6]$/.test(e.key)) place(Number(e.key) - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const restart = () => {
    setRound((r) => r + 1)
    setCurrent([])
    setRows([])
    setStatus('playing')
  }

  return (
    <section className="mx-auto w-full max-w-2xl px-4 pb-28 pt-5 sm:px-6">
      <Link to="/arcade" className="mono-label hover:text-ink">
        ← Arcade
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-card px-3.5 py-2 shadow-[3px_3px_0_var(--color-ink)]">
        <span className="chip" style={{ background: game.soft }}>
          <span className="h-2 w-2 rounded-full border border-ink" style={{ background: game.colour }} />
          Mastermind
        </span>
        <div className="flex items-center gap-2">
          <span className="chip border-line bg-[#f4f2ea]">
            Guess <b>{Math.min(rows.length + 1, MAX_GUESSES)} / {MAX_GUESSES}</b>
          </span>
          <span className="chip border-line bg-[#f4f2ea]">
            <b>{elapsed}s</b>
          </span>
        </div>
      </div>

      <div className="card-pop mt-4 overflow-hidden">
        <div className="h-1.5" style={{ background: game.colour }} />
        <div className="p-5 sm:p-6">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Break the code</h1>
          <p className="mt-1 text-[13px] font-medium text-ink-3">
            Six colours, four slots. Black peg = right colour, right slot. White peg = right colour, wrong slot.
          </p>

          <div className="mt-4 grid gap-2">
            {rows.map((row, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 rounded-lg border-2 border-ink bg-card px-3 py-2"
              >
                <span className="font-mono text-[10px] font-bold text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                <span className="flex gap-1.5">
                  {row.code.map((c, j) => (
                    <span key={j} className="h-7 w-7 rounded-md border-2 border-ink" style={{ background: PEG_COLOURS[c] }} />
                  ))}
                </span>
                <span className="flex items-center gap-2">
                  <span className="flex gap-1">
                    {Array.from({ length: row.exact }).map((_, k) => (
                      <span key={`e${k}`} className="h-3 w-3 rounded-full border border-ink bg-ink" />
                    ))}
                    {Array.from({ length: row.partial }).map((_, k) => (
                      <span key={`p${k}`} className="h-3 w-3 rounded-full border border-ink bg-card" />
                    ))}
                  </span>
                  <span className="w-8 text-right font-mono text-[10px] font-bold">
                    {row.exact}·{row.partial}
                  </span>
                </span>
              </motion.div>
            ))}
          </div>

          {status === 'playing' && (
            <>
              <div className="mt-4 flex items-center gap-2 rounded-lg border-2 border-ink bg-[#f7f5ee] px-3 py-2">
                {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                  <span
                    key={i}
                    className="h-9 w-9 rounded-md border-2 border-ink"
                    style={{ background: current[i] !== undefined ? PEG_COLOURS[current[i]] : 'transparent' }}
                  />
                ))}
                <span className="ml-auto font-mono text-[10px] font-bold text-ink-3">
                  {current.length}/{CODE_LENGTH}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {PEG_COLOURS.map((colour, i) => (
                  <button
                    key={colour}
                    type="button"
                    onClick={() => place(i)}
                    aria-label={`Colour ${i + 1}`}
                    className="h-10 w-10 rounded-lg border-2 border-ink shadow-[2px_2px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
                    style={{ background: colour }}
                  />
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={submit} disabled={current.length !== CODE_LENGTH}>
                  Check guess
                </Button>
                <Button size="sm" variant="light" onClick={undo} disabled={!current.length}>
                  Undo
                </Button>
                <Button size="sm" variant="ghost" onClick={restart}>
                  New code
                </Button>
              </div>
            </>
          )}

          {status !== 'playing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-xl border-2 border-ink bg-c3-soft px-4 py-3.5">
              <p className="font-display text-lg font-extrabold">
                {status === 'won' ? `Cracked in ${rows.length} guesses.` : 'Out of guesses.'}
              </p>
              <p className="mt-1 flex items-center gap-2 text-[13px] font-medium text-ink-2">
                The code was
                <span className="flex gap-1">
                  {secret.map((c, i) => (
                    <span key={i} className="h-6 w-6 rounded border-2 border-ink" style={{ background: PEG_COLOURS[c] }} />
                  ))}
                </span>
              </p>
              <p className="mono-label mt-2">{status === 'won' ? `${score} points` : 'no points this time'}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={restart}>
                  Play again
                </Button>
                <Button size="sm" variant="light" asChild>
                  <Link to="/arcade">Back to arcade</Link>
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <p className="mono-label mt-3 text-center">
        <kbd className="rounded border border-ink px-1">1</kbd>–<kbd className="rounded border border-ink px-1">6</kbd> colour ·{' '}
        <kbd className="rounded border border-ink px-1">⌫</kbd> undo · <kbd className="rounded border border-ink px-1">↵</kbd> check
      </p>
    </section>
  )
}
