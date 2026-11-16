import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { memory } from '@/data/memory'
import { trackById } from '@/data/tracks'
import { Button } from '@/components/ui/button'
import { OptionButton } from '@/components/OptionButton'
import { Explanation } from '@/components/Explanation'
import { ResultShell } from '@/components/ResultShell'
import { useProgress } from '@/store/progress'
import { celebrateCorrect, haptic, soundFinish, soundRight, soundWrong } from '@/lib/fx'
import { pad } from '@/lib/utils'
import type { AnswerLog } from '@/components/QuizRunner'

const track = trackById('memory')
const POINTS = 10

type Phase = 'view' | 'quiz' | 'done'

export default function Memory() {
  const navigate = useNavigate()
  const record = useProgress((s) => s.record)
  const addXp = useProgress((s) => s.addXp)

  const [briefIndex, setBriefIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('view')
  const [qIndex, setQIndex] = useState(0)
  const [chosen, setChosen] = useState<number | null>(null)
  const [left, setLeft] = useState(memory[0].seconds)
  const [score, setScore] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [log, setLog] = useState<AnswerLog[]>([])
  const [finished, setFinished] = useState(false)

  const brief = memory[briefIndex]
  const question = brief.questions[qIndex]

  useEffect(() => {
    if (phase !== 'view') return
    setLeft(brief.seconds)
    const id = window.setInterval(() => setLeft((l) => l - 1), 1000)
    return () => window.clearInterval(id)
  }, [phase, briefIndex, brief.seconds])

  useEffect(() => {
    if (phase === 'view' && left <= 0) {
      setPhase('quiz')
      setQIndex(0)
    }
  }, [left, phase])

  const answer = (pick: number) => {
    if (chosen !== null) return
    const ok = pick === question.answer
    setChosen(pick)
    setLog((l) => [...l, { item: question, chosen: pick, ok }])
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
  }

  const advance = () => {
    if (chosen === null) return
    if (qIndex < brief.questions.length - 1) {
      setQIndex((i) => i + 1)
      setChosen(null)
      return
    }
    if (briefIndex < memory.length - 1) {
      setBriefIndex((i) => i + 1)
      setPhase('view')
      setQIndex(0)
      setChosen(null)
      return
    }
    record('memory', score)
    addXp(score + 20)
    soundFinish()
    setFinished(true)
  }

  if (finished) {
    return (
      <ResultShell track={track} score={score} correct={correct} total={memory.length * 3} onRetry={() => navigate(0)}>
        <ul className="grid gap-2">
          {log.map(({ item, ok }, i) => (
            <li key={`${item.id}-${i}`} className="rounded-xl border-2 border-ink bg-card px-3.5 py-2.5 shadow-[2px_2px_0_var(--color-ink)]">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[13.5px] font-extrabold leading-snug">{item.prompt}</span>
                <span className={`chip ${ok ? 'bg-c2-soft' : 'bg-c1-soft'}`}>{ok ? 'correct' : 'missed'}</span>
              </div>
              <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-ink-2">
                <b className="text-ink">{item.options[item.answer]}</b>
                <span dangerouslySetInnerHTML={{ __html: ` — ${item.why}` }} />
              </p>
            </li>
          ))}
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
            Brief <b>{pad(briefIndex + 1)} / {memory.length}</b>
          </span>
          <span className="chip border-line bg-[#f4f2ea]">
            Pts <b>{score}</b>
          </span>
        </div>
        <span className="flex items-center gap-2">
          <span
            className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink font-display text-lg font-extrabold shadow-[2px_2px_0_var(--color-ink)]"
            style={{ background: phase === 'view' ? (left <= 4 ? '#e13b2b' : track.colour) : '#f4f2ea', color: phase === 'view' ? track.ink : '#6b727d' }}
          >
            {phase === 'view' ? Math.max(0, left) : '∞'}
          </span>
        </span>
      </div>

      <motion.div key={`${briefIndex}-${qIndex}-${phase}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-pop overflow-hidden">
        <div className="h-1.5" style={{ background: track.colour }} />
        <div className="p-5 sm:p-7">
          {phase === 'view' ? (
            <>
              <div className="mb-3 flex items-center gap-2.5">
                <span className="rounded-lg border-2 border-ink px-2 py-0.5 font-display text-sm font-extrabold shadow-[2px_2px_0_var(--color-ink)]" style={{ background: track.colour, color: track.ink }}>
                  B{briefIndex + 1}
                </span>
                <span className="mono-label">Read once · {brief.name}</span>
              </div>
              <h2 className="mb-1.5 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Memorise this brief.</h2>
              <p className="mb-4 text-[13px] font-medium text-ink-3">It disappears when the clock runs out. Three questions follow.</p>

              <dl className="grid gap-2 sm:grid-cols-2">
                {brief.facts.map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3 rounded-lg border-2 border-ink bg-card px-3 py-2 shadow-[2px_2px_0_var(--color-ink)]">
                    <dt className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3">{k}</dt>
                    <dd className="text-right text-sm font-extrabold">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="mono-label">Seconds to read, then it’s gone</span>
                <Button size="sm" onClick={() => setPhase('quiz')}>
                  Got it →
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-3 flex items-center gap-2.5">
                <span className="rounded-lg border-2 border-ink px-2 py-0.5 font-display text-sm font-extrabold shadow-[2px_2px_0_var(--color-ink)]" style={{ background: track.colour, color: track.ink }}>
                  {qIndex + 1}/3
                </span>
                <span className="mono-label">{brief.name}</span>
              </div>
              <h2 className="mb-1.5 text-balance font-display text-2xl font-extrabold tracking-tight sm:text-3xl">{question.prompt}</h2>
              <p className="mb-5 text-[13px] font-medium text-ink-3">From memory. No going back to the brief.</p>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {question.options.map((opt, i) => (
                  <OptionButton
                    key={opt}
                    index={i}
                    label={opt}
                    disabled={chosen !== null}
                    state={chosen === null ? 'idle' : i === question.answer ? 'correct' : i === chosen ? 'wrong' : 'faded'}
                    onClick={() => answer(i)}
                  />
                ))}
              </div>

              {chosen !== null && (
                <Explanation
                  ok={chosen === question.answer}
                  points={POINTS}
                  why={question.why}
                  options={question.options}
                  answerIndex={question.answer}
                  chosenIndex={chosen}
                  steps={question.steps}
                  wrong={question.wrong}
                  nextLabel="Continue →"
                  onNext={advance}
                />
              )}
            </>
          )}
        </div>
      </motion.div>
    </section>
  )
}
