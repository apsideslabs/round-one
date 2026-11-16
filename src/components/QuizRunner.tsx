import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { Mcq } from '@/data/types'
import type { Track } from '@/data/tracks'
import { Button } from '@/components/ui/button'
import { OptionButton } from '@/components/OptionButton'
import { Explanation } from '@/components/Explanation'
import { TimerRing } from '@/components/TimerRing'
import { celebrateCorrect, haptic, soundRight, soundWrong } from '@/lib/fx'
import { pad } from '@/lib/utils'

export interface AnswerLog {
  item: Mcq
  chosen: number
  ok: boolean
}

interface Props {
  track: Track
  items: Mcq[]
  perQuestion: number
  onComplete: (score: number, correct: number, log: AnswerLog[]) => void
  onQuit: () => void
}

const POINTS = 10

export function QuizRunner({ track, items, perQuestion, onComplete, onQuit }: Props) {
  const [index, setIndex] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [log, setLog] = useState<AnswerLog[]>([])
  const [left, setLeft] = useState(perQuestion)

  const item = items[index]
  const answered = chosen !== null
  const isLast = index === items.length - 1

  const answer = useCallback(
    (pick: number) => {
      setChosen((current) => {
        if (current !== null) return current
        const ok = pick === item.answer
        setLog((l) => [...l, { item, chosen: pick, ok }])
        if (ok) {
          setScore((s) => s + POINTS)
          setCorrect((c) => c + 1)
          soundRight()
          haptic(16)
          celebrateCorrect()
        } else {
          soundWrong()
          haptic([14, 50, 14])
        }
        return pick
      })
    },
    [item]
  )

  useEffect(() => {
    if (answered) return
    const id = window.setInterval(() => setLeft((l) => l - 1), 1000)
    return () => window.clearInterval(id)
  }, [answered, index])

  useEffect(() => {
    if (left <= 0 && !answered) answer(-1)
  }, [left, answered, answer])

  useEffect(() => {
    setLeft(perQuestion)
    setChosen(null)
  }, [index, perQuestion])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'TEXTAREA' || tag === 'INPUT') return
      if (!answered && /^[1-4]$/.test(e.key)) {
        const i = Number(e.key) - 1
        if (i < item.options.length) answer(i)
      }
      if (answered && e.key === 'Enter' && tag !== 'BUTTON') advance()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const advance = () => {
    if (!answered) return
    if (isLast) {
      onComplete(score, correct, log)
      return
    }
    setIndex((i) => i + 1)
  }

  const progress = useMemo(() => Math.round(((index + (answered ? 1 : 0)) / items.length) * 100), [index, answered, items.length])

  const stateFor = (i: number): 'idle' | 'correct' | 'wrong' | 'faded' => {
    if (!answered) return 'idle'
    if (i === item.answer) return 'correct'
    if (i === chosen) return 'wrong'
    return 'faded'
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-28 pt-5 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-card px-3.5 py-2 shadow-[3px_3px_0_var(--color-ink)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip" style={{ background: track.soft }}>
            <span className="h-2 w-2 rounded-full border border-ink" style={{ background: track.colour }} />
            {track.no} · {track.name}
          </span>
          <span className="chip bg-[#f4f2ea] border-line">
            Q <b>{pad(index + 1)} / {items.length}</b>
          </span>
          <span className="chip bg-[#f4f2ea] border-line">
            Pts <b>{score}</b>
          </span>
        </div>
        <TimerRing left={Math.max(0, left)} total={perQuestion} />
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-[#e8e5dc]">
        <div className="h-full bg-ink transition-[width] duration-500" style={{ width: `${progress}%` }} />
      </div>

      <motion.div
        key={index}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="card-pop mt-4 overflow-hidden"
      >
        <div className="h-1.5" style={{ background: track.colour }} />
        <div className="p-5 sm:p-7">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="rounded-lg border-2 border-ink px-2 py-0.5 font-display text-sm font-extrabold shadow-[2px_2px_0_var(--color-ink)]" style={{ background: track.colour, color: track.ink }}>
              Q{index + 1}
            </span>
            <span className="mono-label">{item.tag}</span>
          </div>

          <h2 className="mb-1.5 max-w-[26ch] text-balance font-display text-2xl font-extrabold leading-[1.1] tracking-tight sm:text-3xl">
            {item.prompt}
          </h2>
          <p className="mb-5 text-[13px] font-medium text-ink-3">
            One shot. {perQuestion} seconds on the clock.
          </p>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {item.options.map((opt, i) => (
              <OptionButton key={opt} index={i} label={opt} state={stateFor(i)} disabled={answered} onClick={() => answer(i)} />
            ))}
          </div>

          {answered && (
            <Explanation
              ok={chosen === item.answer}
              points={POINTS}
              why={item.why}
              nextLabel={isLast ? 'See the result →' : 'Next question →'}
              onNext={advance}
            />
          )}
        </div>
      </motion.div>

      <div className="mt-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onQuit}>
          Quit round
        </Button>
        <span className="mono-label hidden sm:block">
          <kbd className="rounded border border-ink px-1">1</kbd>–<kbd className="rounded border border-ink px-1">4</kbd> answer ·{' '}
          <kbd className="rounded border border-ink px-1">↵</kbd> next
        </span>
      </div>
    </section>
  )
}
