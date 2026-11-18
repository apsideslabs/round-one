import { Link } from 'react-router-dom'
import { Tape } from '@/lab/Tape'

export default function Lab() {
  return (
    <div className="w-full px-3 pb-20 pt-3 sm:px-5 md:pb-6 lg:px-6">
      <div className="mx-auto flex h-[calc(100dvh-6rem)] max-w-[1150px] flex-col md:h-[calc(100dvh-4.5rem)]">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="chip bg-ink text-paper">Lab</span>
            <h1 className="mt-1 font-display text-xl font-extrabold tracking-tight">The tape</h1>
            <p className="text-[11.5px] font-medium text-ink-3">ninety seconds of a real interview, scrubbable</p>
          </div>
          <Link to="/negotiate" className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3 underline underline-offset-4">promoted tools →</Link>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border-[3px] border-ink bg-[#f7f5ee] shadow-[6px_6px_0_var(--color-ink)]">
          <Tape />
        </div>
      </div>
    </div>
  )
}
