import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QuizRunner, type AnswerLog } from '@/components/QuizRunner'
import { ResultShell } from '@/components/ResultShell'
import type { Mcq } from '@/data/types'
import { trackById, type TrackId } from '@/data/tracks'
import { useProgress } from '@/store/progress'
import { shuffle } from '@/lib/utils'
import { soundFinish } from '@/lib/fx'

interface Props {
  trackId: TrackId
  items: Mcq[]
  perQuestion: number
}

export default function QuizRound({ trackId, items, perQuestion }: Props) {
  const track = trackById(trackId)
  const navigate = useNavigate()
  const record = useProgress((s) => s.record)
  const addXp = useProgress((s) => s.addXp)

  const [runId, setRunId] = useState(0)
  const [result, setResult] = useState<{ score: number; correct: number; log: AnswerLog[] } | null>(null)

  const deck = useMemo(() => shuffle(items), [items, runId])

  const restart = () => {
    setResult(null)
    setRunId((n) => n + 1)
  }

  if (result) {
    return (
      <ResultShell
        track={track}
        score={result.score}
        correct={result.correct}
        total={deck.length}
        onRetry={restart}
      >
        <ul className="grid gap-2">
          {result.log.map(({ item, chosen, ok }, i) => (
            <li key={`${item.id}-${i}`} className="rounded-xl border-2 border-ink bg-card px-3.5 py-2.5 shadow-[2px_2px_0_var(--color-ink)]">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[13.5px] font-extrabold leading-snug">{item.prompt}</span>
                <span className={`chip ${ok ? 'bg-c2-soft' : 'bg-c1-soft'}`}>{ok ? 'correct' : 'missed'}</span>
              </div>
              <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-ink-2">
                <b className="text-ink">{item.options[item.answer]}</b>
                {!ok && <> — you chose {chosen >= 0 ? item.options[chosen] : 'nothing'}</>}.<br />
                <span dangerouslySetInnerHTML={{ __html: item.why }} />
              </p>
            </li>
          ))}
        </ul>
      </ResultShell>
    )
  }

  return (
    <QuizRunner
      track={track}
      items={deck}
      perQuestion={perQuestion}
      onQuit={() => navigate('/')}
      onComplete={(score, correct, log) => {
        record(trackId, score)
        addXp(score + 20)
        soundFinish()
        setResult({ score, correct, log })
      }}
    />
  )
}
