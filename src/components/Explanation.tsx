import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  ok: boolean
  points: number
  why: string
  answerLabel?: string
  chosenLabel?: string
  chosenIndex?: number | null
  answerIndex?: number
  options?: string[]
  steps?: string[]
  wrong?: Record<number, string>
  nextLabel: string
  onNext: () => void
}

export function Explanation({
  ok,
  points,
  why,
  options,
  answerIndex,
  chosenIndex,
  steps,
  wrong,
  nextLabel,
  onNext
}: Props) {
  const hasBreakdown = Boolean(steps?.length || wrong)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="mt-4 rounded-xl border-2 border-ink bg-c3-soft px-4 py-3.5 shadow-[3px_3px_0_var(--color-ink)]"
    >
      <div className="mb-2 flex flex-wrap items-center gap-2.5">
        <span className={`font-display text-lg font-extrabold ${ok ? 'text-ok' : 'text-bad'}`}>
          {ok ? 'Correct!' : 'Not quite'}
        </span>
        <span className="chip bg-card">{ok ? `+${points} pts` : '0 pts'}</span>
      </div>

      <p className="max-w-[64ch] text-sm font-medium leading-relaxed text-ink-2" dangerouslySetInnerHTML={{ __html: why }} />

      {hasBreakdown && options && answerIndex !== undefined && (
        <div className="mt-3.5 grid gap-3 border-t-2 border-dashed border-ink/25 pt-3.5">
          {steps?.length ? (
            <div>
              <p className="mono-label mb-1.5">The working</p>
              <ol className="grid gap-1.5">
                {steps.map((step, i) => (
                  <li key={step} className="grid grid-cols-[20px_1fr] gap-2 text-[13px] font-medium leading-relaxed text-ink-2">
                    <span className="grid h-5 w-5 place-items-center rounded border-2 border-ink bg-card font-mono text-[9px] font-bold">
                      {i + 1}
                    </span>
                    <span dangerouslySetInnerHTML={{ __html: step }} />
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          <div>
            <p className="mono-label mb-1.5">Option by option</p>
            <ul className="grid gap-1.5">
              {options.map((option, i) => {
                const isAnswer = i === answerIndex
                const isChosen = i === chosenIndex
                const note = isAnswer ? null : wrong?.[i]
                if (isAnswer) {
                  return (
                    <li key={option} className="grid grid-cols-[18px_1fr] gap-2 rounded-lg border-2 border-ok bg-card px-2.5 py-2">
                      <Check className="mt-0.5 h-4 w-4 text-ok" strokeWidth={3} />
                      <span className="text-[13px] font-bold leading-snug text-ink">
                        {option}
                        <span className="ml-1.5 rounded bg-ok px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-wider text-white">
                          answer
                        </span>
                      </span>
                    </li>
                  )
                }
                if (!note) return null
                return (
                  <li
                    key={option}
                    className={`grid grid-cols-[18px_1fr] gap-2 rounded-lg border-2 px-2.5 py-2 ${
                      isChosen ? 'border-bad bg-card' : 'border-ink/20 bg-card/60'
                    }`}
                  >
                    <X className="mt-0.5 h-4 w-4 text-bad" strokeWidth={3} />
                    <span className="text-[13px] font-medium leading-snug text-ink-2">
                      <b className="text-ink">{option}</b>
                      {isChosen && (
                        <span className="ml-1.5 rounded bg-bad px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-wider text-white">
                          you chose
                        </span>
                      )}
                      <span className="mt-0.5 block" dangerouslySetInnerHTML={{ __html: note }} />
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}

      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={onNext}>
          {nextLabel}
        </Button>
      </div>
    </motion.div>
  )
}
