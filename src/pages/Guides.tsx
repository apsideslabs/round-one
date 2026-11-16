import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import { guides } from '@/data/guides'

export default function Guides() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-7 sm:px-8 lg:px-12">
      <span className="chip">Learn</span>
      <h1 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tighter sm:text-4xl">
        The method behind each round
      </h1>
      <p className="mt-2 max-w-[54ch] text-[15px] font-medium leading-relaxed text-ink-2">
        Short, specific guides. Each one gives you the rule, the traps that catch people, and a worked example you can copy the shape of.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((g) => (
          <Link
            key={g.slug}
            to={`/guides/${g.slug}`}
            className="group flex flex-col gap-2 rounded-2xl border-2 border-ink bg-card p-4 shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5"
          >
            <span className="mono-label">{g.kicker}</span>
            <span className="font-display text-xl font-extrabold tracking-tight">{g.title}</span>
            <span className="text-[13px] font-medium leading-relaxed text-ink-2">{g.summary}</span>
            <span className="mt-auto flex items-center justify-between pt-2">
              <span className="mono-label inline-flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> {g.minutes} min
              </span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
