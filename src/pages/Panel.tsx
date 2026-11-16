import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { interview } from '@/data/interview'
import { trackById } from '@/data/tracks'
import { Button } from '@/components/ui/button'
import { ResultShell } from '@/components/ResultShell'
import { useProgress } from '@/store/progress'
import { soundFinish } from '@/lib/fx'
import { pad, wordCount } from '@/lib/utils'

const track = trackById('panel')
const MIN_WORDS = 25

interface PanelLog {
  id: string
  question: string
  got: number
  checks: string[]
  ticked: boolean[]
}

export default function Panel() {
  const navigate = useNavigate()
  const record = useProgress((s) => s.record)
  const addXp = useProgress((s) => s.addXp)

  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [ticked, setTicked] = useState<boolean[]>([false, false, false, false])
  const [log, setLog] = useState<PanelLog[]>([])
  const [finished, setFinished] = useState(false)

  const q = interview[index]
  const words = wordCount(answer)
  const marks = ticked.filter(Boolean).length

  const next = () => {
    const entry: PanelLog = { id: q.id, question: q.question, got: marks, checks: q.checks, ticked }
    const nextLog = [...log, entry]
    setLog(nextLog)
    if (index === interview.length - 1) {
      const score = nextLog.reduce((sum, e) => sum + e.got, 0)
      record('panel', score)
      addXp(score + 20)
      soundFinish()
      setFinished(true)
      return
    }
    setIndex((i) => i + 1)
    setAnswer('')
    setRevealed(false)
    setTicked([false, false, false, false])
  }

  if (finished) {
    const score = log.reduce((sum, e) => sum + e.got, 0)
    return (
      <ResultShell
        track={track}
        score={score}
        correct={score}
        total={track.max}
        note="Marks are structure, not prose. Reread the ones you missed and rewrite that answer in your own words."
        onRetry={() => navigate(0)}
      >
        <ul className="grid gap-2">
          {log.map((e) => {
            const missed = e.checks.filter((_, i) => !e.ticked[i])
            return (
              <li key={e.id} className="rounded-xl border-2 border-ink bg-card px-3.5 py-2.5 shadow-[2px_2px_0_var(--color-ink)]">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-[13.5px] font-extrabold leading-snug">{e.question}</span>
                  <span className={`chip ${e.got >= 3 ? 'bg-c2-soft' : 'bg-c1-soft'}`}>{e.got} / 4</span>
                </div>
                <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-ink-2">
                  {missed.length ? <>Missed: {missed.join(' · ')}</> : <b>All four structure marks.</b>}
                </p>
              </li>
            )
          })}
        </ul>
      </ResultShell>
    )
  }

  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-24 md:pb-12 pt-5 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-card px-3.5 py-2 shadow-[3px_3px_0_var(--color-ink)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip" style={{ background: track.soft }}>
            <span className="h-2 w-2 rounded-full border border-ink" style={{ background: track.colour }} />
            {track.no} · {track.name}
          </span>
          <span className="chip border-line bg-[#f4f2ea]">
            Q <b>{pad(index + 1)} / {interview.length}</b>
          </span>
          <span className="chip border-line bg-[#f4f2ea]">
            Marks <b>{log.reduce((s, e) => s + e.got, 0)}</b>
          </span>
        </div>
        <span className="mono-label">untimed</span>
      </div>

      <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-pop overflow-hidden">
        <div className="h-1.5" style={{ background: track.colour }} />
        <div className="p-5 sm:p-7">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="rounded-lg border-2 border-ink px-2 py-0.5 font-display text-sm font-extrabold shadow-[2px_2px_0_var(--color-ink)]" style={{ background: track.colour, color: track.ink }}>
              Q{index + 1}
            </span>
            <span className="mono-label">{q.tag}</span>
          </div>

          <h2 className="mb-1.5 text-balance font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{q.question}</h2>
          <p className="mb-4 text-[13px] font-medium text-ink-3">Write it as you would say it. You are scored on structure, not confidence.</p>

          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Start typing your answer…"
            aria-label="Your answer"
            className="min-h-36 w-full resize-y rounded-xl border-2 border-ink bg-card px-3.5 py-3 font-sans text-[15px] font-medium leading-relaxed outline-none focus:border-c4"
          />
          <div className="mt-2 flex flex-wrap justify-between gap-2">
            <span className={`mono-label ${words >= MIN_WORDS ? 'text-c2' : ''}`}>
              {words} words · {MIN_WORDS} minimum
            </span>
            <span className="mono-label">Write before you reveal the model</span>
          </div>

          {!revealed ? (
            <div className="mt-4">
              <Button size="sm" disabled={words < MIN_WORDS} onClick={() => setRevealed(true)}>
                Reveal the model answer
              </Button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border-2 border-ink bg-c3-soft px-4 py-3.5 shadow-[3px_3px_0_var(--color-ink)]">
              <p className="font-display text-base font-extrabold">A good answer is built like this</p>
              <ol className="mt-2 grid gap-1.5">
                {q.skeleton.map((line, i) => (
                  <li key={line} className="grid grid-cols-[22px_1fr] gap-2 text-[13px] font-medium leading-relaxed text-ink-2">
                    <span className="grid h-[18px] place-items-center rounded bg-ink font-mono text-[9px] font-bold text-paper">{i + 1}</span>
                    {line}
                  </li>
                ))}
              </ol>

              <p className="mt-3 text-[13px] font-medium leading-relaxed text-ink-2">
                <b className="text-ink">Model opening:</b> {q.model}
              </p>

              <p className="mt-3 text-[13px] font-extrabold">Tick what your answer actually did.</p>
              <div className="mt-1.5 grid gap-1.5">
                {q.checks.map((check, i) => (
                  <label key={check} className="grid cursor-pointer grid-cols-[22px_1fr] items-start gap-2.5 text-[13px] font-semibold leading-snug text-ink-2">
                    <input
                      type="checkbox"
                      checked={ticked[i]}
                      onChange={(e) => setTicked((t) => t.map((v, j) => (j === i ? e.target.checked : v)))}
                      className="mt-0.5 h-5 w-5 appearance-none rounded-md border-2 border-ink bg-card shadow-[1.5px_1.5px_0_var(--color-ink)] checked:bg-ok"
                    />
                    {check}
                  </label>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="chip bg-card">{marks} / 4 marks</span>
                <Button size="sm" onClick={next}>
                  {index === interview.length - 1 ? 'See the result →' : 'Next question →'}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
