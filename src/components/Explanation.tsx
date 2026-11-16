import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

interface Props {
  ok: boolean
  points: number
  why: string
  nextLabel: string
  onNext: () => void
}

export function Explanation({ ok, points, why, nextLabel, onNext }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="mt-4 rounded-xl border-2 border-ink bg-c3-soft px-4 py-3.5 shadow-[3px_3px_0_var(--color-ink)]"
    >
      <div className="mb-1.5 flex flex-wrap items-center gap-2.5">
        <span className={`font-display text-lg font-extrabold ${ok ? 'text-ok' : 'text-bad'}`}>
          {ok ? 'Correct!' : 'Not quite'}
        </span>
        <span className="chip bg-card">{ok ? `+${points} pts` : '0 pts'}</span>
      </div>
      <p className="max-w-[64ch] text-sm font-medium leading-relaxed text-ink-2" dangerouslySetInnerHTML={{ __html: why }} />
      <div className="mt-3 flex justify-end">
        <Button size="sm" onClick={onNext}>
          {nextLabel}
        </Button>
      </div>
    </motion.div>
  )
}
