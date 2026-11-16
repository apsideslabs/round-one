import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  index: number
  label: string
  state: 'idle' | 'correct' | 'wrong' | 'faded'
  disabled: boolean
  onClick: () => void
}

export function OptionButton({ index, label, state, disabled, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'grid w-full grid-cols-[24px_1fr_18px] items-center gap-3 rounded-xl border-2 border-ink bg-card px-3.5 py-3 text-left text-[15px] font-bold text-ink shadow-[3px_3px_0_var(--color-ink)] transition-all duration-150',
        !disabled && 'hover:-translate-x-px hover:-translate-y-px hover:bg-[color-mix(in_srgb,var(--color-c3-soft)_60%,white)] hover:shadow-[4px_4px_0_var(--color-ink)]',
        state === 'correct' && 'bg-ok text-white',
        state === 'wrong' && 'bg-bad text-white',
        state === 'faded' && 'opacity-45'
      )}
    >
      <span
        className={cn(
          'grid h-6 w-6 place-items-center rounded-md border-2 border-ink bg-[#f4f2ea] font-mono text-[11px] font-bold',
          state === 'correct' && 'bg-white text-ok',
          state === 'wrong' && 'bg-white text-bad'
        )}
      >
        {index + 1}
      </span>
      <span className="min-w-0 break-words leading-snug">{label}</span>
      <span className="grid place-items-center">
        {state === 'correct' && <Check className="h-4 w-4" strokeWidth={3} />}
        {state === 'wrong' && <X className="h-4 w-4" strokeWidth={3} />}
      </span>
    </button>
  )
}
