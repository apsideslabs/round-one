import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { logic } from '@/data/logic'
import { verbal } from '@/data/verbal'
import { riddles } from '@/data/riddles'
import type { Mcq } from '@/data/types'
import { Button } from '@/components/ui/button'
import { useProgress } from '@/store/progress'
import { soundFinish, soundRight } from '@/lib/fx'
import { pad, shuffle } from '@/lib/utils'

const SECTIONS = [
  { key: 'Reasoning', take: 9, pool: logic },
  { key: 'Verbal', take: 6, pool: verbal },
  { key: 'Traps', take: 5, pool: riddles }
] as const

const TOTAL_SECONDS = 20 * 60

interface Answer {
  item: Mcq
  section: string
  chosen: number | null
}

function buildPaper() {
  return SECTIONS.flatMap((s) =>
    shuffle(s.pool).slice(0, s.take).map((item) => ({ item, section: s.key }))
  )
}

export default function Mock() {
  const navigate = useNavigate()
  const recordGame = useProgress((s) => s.recordGame)
  const addXp = useProgress((s) => s.addXp)

  const [runId, setRunId] = useState(0)
  const paper = useMemo(buildPaper, [runId])
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>(() => paper.map((p) => ({ ...p, chosen: null })))
  const [left, setLeft] = useState(TOTAL_SECONDS)
  const [phase, setPhase] = useState<'intro' | 'test' | 'done'>('intro')
  const submitted = useRef(false)

  const current = answers[index]
  const answeredCount = answers.filter((a) => a.chosen !== null).length

  useEffect(() => {
    if (phase !== 'test') return
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

  const finish = () => {
    if (submitted.current) return
    submitted.current = true
    const score = answers.filter((a) => a.chosen === a.item.answer).length
    recordGame('mock', score)
    addXp(score * 5)
    soundFinish()
    setPhase('done')
  }

  useEffect(() => {
    if (phase === 'test' && left === 0) finish()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, phase])

  const start = () => {
    setPhase('test')
    setLeft(TOTAL_SECONDS)
  }

  const restart = () => {
    submitted.current = false
    setRunId((n) => n + 1)
    setIndex(0)
    setLeft(TOTAL_SECONDS)
    setPhase('intro')
  }

  useEffect(() => {
    if (runId > 0) setAnswers(buildPaper().map((p) => ({ ...p, chosen: null })))
    // rebuild answers when the paper changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId])

  if (phase === 'intro') {
    return (
      <div className="w-full px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <div className="max-w-[640px]">
          <span className="chip">Mock</span>
          <h1 className="mt-3 text-balance font-display text-3xl font-extrabold leading-tight tracking-tighter sm:text-4xl">
            Full mock test
          </h1>
          <p className="mt-2 text-[15px] font-medium leading-relaxed text-ink-2">
            {paper.length} questions in {TOTAL_SECONDS / 60} minutes, drawn across reasoning, verbal and traps — the shape
            of a real campus screening test. No feedback until the end, and the clock does not stop.
          </p>

          <div className="card-pop mt-5 p-4">
            <p className="mono-label mb-2">Sections</p>
            <ul className="grid gap-1.5">
              {SECTIONS.map((s) => (
                <li key={s.key} className="flex items-center justify-between text-[13.5px] font-semibold">
                  <span>{s.key}</span>
                  <span className="font-mono text-[10px] font-bold text-ink-3">{s.take} questions</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[12.5px] font-medium leading-relaxed text-ink-3">
              You can move back and forth and change answers until you submit or the clock runs out. That is deliberate:
              in the real test, knowing which questions to leave is worth more than speed on the ones you keep.
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <Button variant="accent" onClick={start}>
              Start the clock
            </Button>
            <Button variant="light" asChild>
              <Link to="/menu">Back</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    const score = answers.filter((a) => a.chosen === a.item.answer).length
    const pct = Math.round((score / answers.length) * 100)
    const bySection = SECTIONS.map((s) => {
      const rows = answers.filter((a) => a.section === s.key)
      return { key: s.key, right: rows.filter((a) => a.chosen === a.item.answer).length, total: rows.length }
    })

    return (
      <div className="w-full px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <div className="max-w-[860px]">
          <div className="card-pop overflow-hidden">
            <div className="h-1.5 bg-ink" />
            <div className="grid items-center gap-5 p-5 sm:grid-cols-[auto_1fr] sm:p-7">
              <div className="grid h-28 w-28 place-items-center rounded-full border-2 border-ink bg-card text-center shadow-[4px_4px_0_var(--color-ink)]">
                <div>
                  <span className="block font-display text-3xl font-extrabold leading-none">{pct}%</span>
                  <span className="mt-1 block font-mono text-[7px] font-bold uppercase tracking-[0.14em]">Mock test</span>
                </div>
              </div>
              <div>
                <span className="chip">Result</span>
                <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight">
                  {pct >= 75 ? 'Comfortably clear.' : pct >= 55 ? 'Borderline — sectionals decide.' : 'Below the cut-off.'}
                </h1>
                <p className="mt-1.5 text-sm font-medium text-ink-2">
                  {score} of {answers.length} correct in {TOTAL_SECONDS / 60} minutes.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2.5">
            {bySection.map((s) => (
              <div key={s.key} className="rounded-xl border-2 border-ink bg-card px-3.5 py-3 shadow-[3px_3px_0_var(--color-ink)]">
                <span className="mono-label">{s.key}</span>
                <span className="mt-1 block font-display text-xl font-extrabold">
                  {s.right}
                  <small className="text-[0.55em] text-ink-3"> / {s.total}</small>
                </span>
              </div>
            ))}
          </div>

          <h2 className="mb-2 mt-6 font-display text-lg font-extrabold tracking-tight">Every question</h2>
          <ul className="grid gap-2">
            {answers.map((a, i) => {
              const ok = a.chosen === a.item.answer
              return (
                <li key={`${a.item.id}-${i}`} className="rounded-xl border-2 border-ink bg-card px-3.5 py-2.5 shadow-[2px_2px_0_var(--color-ink)]">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-[13.5px] font-extrabold leading-snug">
                      {pad(i + 1)} · {a.item.prompt}
                    </span>
                    <span className={`chip ${ok ? 'bg-c2-soft' : 'bg-c1-soft'}`}>{a.section}</span>
                  </div>
                  <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-ink-2">
                    <b className="text-ink">{a.item.options[a.item.answer]}</b>
                    {!ok && <> — you chose {a.chosen === null ? 'nothing' : a.item.options[a.chosen]}</>}.
                    <br />
                    <span dangerouslySetInnerHTML={{ __html: a.item.why }} />
                  </p>
                </li>
              )
            })}
          </ul>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Button variant="accent" onClick={restart} className="flex-1">
              Another paper
            </Button>
            <Button variant="light" onClick={() => navigate('/menu')} className="flex-1">
              Back to menu
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full px-4 pb-28 pt-5 sm:px-6 lg:px-8">
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,860px)_minmax(240px,300px)]">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-card px-3.5 py-2 shadow-[3px_3px_0_var(--color-ink)]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip bg-ink text-paper">Mock test</span>
              <span className="chip border-line bg-[#f4f2ea]">
                Q <b>{pad(index + 1)} / {answers.length}</b>
              </span>
              <span className="chip border-line bg-[#f4f2ea]">
                Answered <b>{answeredCount}</b>
              </span>
            </div>
            <span className={`chip border-line ${left <= 120 ? 'bg-c1-soft' : 'bg-[#f4f2ea]'}`}>
              <Clock className="h-3 w-3" /> {Math.floor(left / 60)}:{pad(left % 60)}
            </span>
          </div>

          <motion.div key={index} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-pop overflow-hidden">
            <div className="h-1.5 bg-ink" />
            <div className="p-5 sm:p-7">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="rounded-lg border-2 border-ink bg-ink px-2 py-0.5 font-display text-sm font-extrabold text-paper">
                  Q{index + 1}
                </span>
                <span className="mono-label">{current.section} · {current.item.tag}</span>
              </div>

              <h2 className="mb-5 max-w-[30ch] text-balance font-display text-2xl font-extrabold leading-[1.12] tracking-tight sm:text-3xl">
                {current.item.prompt}
              </h2>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {current.item.options.map((option, i) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      soundRight()
                      setAnswers((prev) => prev.map((a, j) => (j === index ? { ...a, chosen: i } : a)))
                    }}
                    className={`grid grid-cols-[24px_1fr] items-center gap-3 rounded-xl border-2 border-ink px-3.5 py-3 text-left text-[15px] font-bold shadow-[3px_3px_0_var(--color-ink)] transition-all ${
                      current.chosen === i ? 'bg-c3' : 'bg-card hover:-translate-y-0.5'
                    }`}
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-md border-2 border-ink bg-[#f4f2ea] font-mono text-[11px] font-bold">
                      {i + 1}
                    </span>
                    <span className="min-w-0 break-words">{option}</span>
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                  <Button size="sm" variant="light" disabled={index === 0} onClick={() => setIndex((i) => Math.max(0, i - 1))}>
                    ← Back
                  </Button>
                  <Button
                    size="sm"
                    disabled={index === answers.length - 1}
                    onClick={() => setIndex((i) => Math.min(answers.length - 1, i + 1))}
                  >
                    Next →
                  </Button>
                </div>
                <Button size="sm" variant="accent" onClick={finish}>
                  Submit paper
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-24 grid gap-3">
            <div className="card-pop p-4">
              <p className="mono-label mb-2">Question map</p>
              <div className="grid grid-cols-5 gap-1.5">
                {answers.map((a, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`grid h-7 place-items-center rounded border-2 border-ink font-mono text-[9px] font-bold ${
                      i === index ? 'bg-ink text-paper' : a.chosen !== null ? 'bg-c3' : 'bg-card'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[12px] font-medium leading-relaxed text-ink-3">
                Filled = answered. Jump to any question; you can change answers until you submit.
              </p>
            </div>
            <div className="rounded-xl border-2 border-ink bg-card p-4">
              <p className="mono-label mb-1.5">Strategy</p>
              <p className="text-[12.5px] font-medium leading-relaxed text-ink-2">
                Answer the sections you are fastest at first. A blank costs the same as a wrong answer, so never leave the
                easy ones for the last minute.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
