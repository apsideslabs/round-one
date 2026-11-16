import { Link } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import { guides } from '@/data/guides'

const spineColours = ['#ff4b26', '#0e8c6a', '#f5b01b', '#2f5bff', '#be123c', '#0e7490']
const inkFor = (c: string) => (c === '#f5b01b' ? '#12151a' : '#ffffff')

export default function Guides() {
  return (
    <div className="w-full px-4 pb-24 pt-7 sm:px-6 md:pb-12 lg:px-8">
      <header className="max-w-[70ch]">
        <span className="chip">Learn</span>
        <h1 className="mt-3 text-balance font-display text-3xl font-extrabold leading-tight tracking-tighter sm:text-4xl">
          The method behind each round
        </h1>
        <p className="mt-2 text-[15px] font-medium leading-relaxed text-ink-2">
          Six short guides. Pull one off the shelf.
        </p>
      </header>

      {/* the shelf — spines that widen into cards */}
      <section className="mt-7 hidden sm:block">
        <div className="flex items-stretch gap-2">
          {guides.map((g, i) => {
            const colour = spineColours[i % spineColours.length]
            return (
              <Link
                key={g.slug}
                to={`/guides/${g.slug}`}
                className="group relative flex h-[340px] w-16 shrink-0 flex-col overflow-hidden rounded-xl border-2 border-ink shadow-[4px_4px_0_var(--color-ink)] transition-[width] duration-300 ease-out hover:w-[300px] focus-visible:w-[300px]"
                style={{ background: colour, color: inkFor(colour) }}
              >
                {/* spine: vertical title, visible while narrow */}
                <span className="absolute inset-0 flex flex-col items-center justify-between px-2 py-3 transition-opacity duration-200 group-hover:opacity-0 group-focus-visible:opacity-0">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider opacity-80">{String(i + 1).padStart(2, '0')}</span>
                  <span className="[writing-mode:vertical-rl] rotate-180 whitespace-nowrap font-display text-[15px] font-extrabold tracking-tight">
                    {g.title}
                  </span>
                  <span className="font-mono text-[9px] font-bold opacity-80">{g.minutes}m</span>
                </span>

                {/* opened card */}
                <span className="absolute inset-0 flex w-[300px] flex-col gap-2 p-4 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider opacity-85">{g.kicker}</span>
                  <span className="font-display text-xl font-extrabold leading-tight tracking-tight">{g.title}</span>
                  <span className="text-[12.5px] font-medium leading-relaxed opacity-90">{g.summary}</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider">
                    Read <Clock className="h-3 w-3" /> {g.minutes} min <ArrowRight className="h-3 w-3" />
                  </span>
                </span>
              </Link>
            )
          })}
        </div>
        <p className="mono-label mt-3">hover or focus a spine to open it</p>
      </section>

      {/* phones: plain cards, because a shelf needs width */}
      <section className="mt-6 grid gap-2.5 sm:hidden">
        {guides.map((g, i) => (
          <Link
            key={g.slug}
            to={`/guides/${g.slug}`}
            className="flex items-center gap-3 rounded-xl border-2 border-ink bg-card px-3.5 py-3 shadow-[3px_3px_0_var(--color-ink)]"
          >
            <span
              className="grid h-10 w-3 shrink-0 rounded-sm border-2 border-ink"
              style={{ background: spineColours[i % spineColours.length] }}
            />
            <span className="grid min-w-0 flex-1 gap-0.5">
              <span className="truncate font-display text-base font-extrabold tracking-tight">{g.title}</span>
              <span className="mono-label">{g.kicker} · {g.minutes} min</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 opacity-40" />
          </Link>
        ))}
      </section>
    </div>
  )
}
