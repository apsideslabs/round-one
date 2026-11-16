import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, RotateCcw, Search, Volume2, VolumeX, ChevronRight } from 'lucide-react'
import { tracks } from '@/data/tracks'
import { games } from '@/data/games'
import { guides } from '@/data/guides'
import { useProgress } from '@/store/progress'
import { setMuted } from '@/lib/fx'

export default function Menu() {
  const { muted, toggleMute, reset, scores, gameBests, lastRound } = useProgress()
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const match = (text: string) => !q || text.toLowerCase().includes(q)
  const shownTracks = useMemo(() => tracks.filter((t) => match(t.name) || match(t.blurb)), [q])
  const shownGames = useMemo(() => games.filter((g) => match(g.name) || match(g.skill)), [q])
  const shownGuides = useMemo(() => guides.filter((g) => match(g.title) || match(g.kicker)), [q])
  const nothing = q && !shownTracks.length && !shownGames.length && !shownGuides.length
  const resume = lastRound ? tracks.find((t) => t.id === lastRound) : null

  const onSound = () => {
    toggleMute()
    setMuted(!muted)
  }

  return (
    <div className="w-full px-4 pb-24 md:pb-12 pt-6 sm:px-6 lg:px-8">
      <header className="max-w-[70ch]">
        <span className="chip">Index</span>
        <h1 className="mt-3 text-balance font-display text-3xl font-extrabold leading-tight tracking-tighter sm:text-4xl">
          Everything in Round One
        </h1>
        <p className="mt-2 text-[15px] font-medium leading-relaxed text-ink-2">
          Five rounds, six games and six guides — the whole map on one page. Your scores are read from this device.
        </p>
      </header>

      <label className="mt-5 block max-w-[560px]">
        <span className="mono-label">Search everything</span>
        <span className="mt-1 flex items-center gap-2 rounded-xl border-2 border-ink bg-card px-3 py-2 shadow-[3px_3px_0_var(--color-ink)]">
          <Search className="h-4 w-4 shrink-0 text-ink-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="round, game or guide — try “verbal”, “estimate”, “star”"
            className="w-full bg-transparent font-sans text-[14px] font-semibold outline-none placeholder:font-normal placeholder:text-ink-3"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3">
              clear
            </button>
          )}
        </span>
      </label>

      {nothing && (
        <p className="mt-6 rounded-xl border-2 border-dashed border-ink/40 px-4 py-6 text-center text-[13.5px] font-semibold text-ink-3">
          Nothing matches “{query}”. Try “logic”, “sequence” or “salary”.
        </p>
      )}

      {!q && resume && (
        <Link
          to={resume.path}
          className="mt-6 flex max-w-[560px] items-center justify-between gap-3 rounded-xl border-2 border-ink px-4 py-3 shadow-[3px_3px_0_var(--color-ink)]"
          style={{ background: resume.soft }}
        >
          <span className="grid gap-0.5">
            <span className="mono-label">Continue where you left off</span>
            <span className="font-display text-base font-extrabold tracking-tight">{resume.name}</span>
          </span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}

      <section className={`mt-8 ${shownTracks.length ? '' : 'hidden'}`}>
        <div className="mb-2.5 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold tracking-tight">Rounds</h2>
          <span className="mono-label">best / maximum</span>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {shownTracks.map((t) => (
            <li key={t.id}>
              <Link
                to={t.path}
                className="flex items-center gap-3 rounded-xl border-2 border-ink bg-card px-3.5 py-3 shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5"
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-ink font-mono text-[11px] font-bold"
                  style={{ background: t.colour, color: t.ink }}
                >
                  {t.no}
                </span>
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span className="truncate text-[14px] font-extrabold">{t.name}</span>
                  <span className="mono-label">{t.meta.join(' · ')}</span>
                </span>
                <span className="font-mono text-[10px] font-bold text-ink-3">
                  {scores[t.id] ? `${scores[t.id]}/${t.max}` : '—'}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-40" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={`mt-8 ${q ? 'hidden' : ''}`}>
        <h2 className="mb-2.5 font-display text-xl font-extrabold tracking-tight">Test</h2>
        <Link
          to="/mock"
          className="flex max-w-[560px] items-center gap-3 rounded-xl border-2 border-ink bg-card px-3.5 py-3 shadow-[3px_3px_0_var(--color-ink)]"
        >
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border-2 border-ink bg-ink text-paper">
            <ArrowRight className="h-4 w-4" />
          </span>
          <span className="grid min-w-0 flex-1 gap-0.5">
            <span className="text-[14px] font-extrabold">Full mock test</span>
            <span className="mono-label">20 questions · 20 minutes · sectional score</span>
          </span>
        </Link>
      </section>

      <section className={`mt-8 ${shownGames.length ? '' : 'hidden'}`}>
        <div className="mb-2.5 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold tracking-tight">Arcade</h2>
          <Link to="/arcade" className="mono-label underline decoration-ink/30 underline-offset-4">
            Open arcade
          </Link>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {shownGames.map((g) => (
            <li key={g.id}>
              <Link
                to={g.path}
                className="flex h-full items-center gap-2.5 rounded-xl border-2 border-ink bg-card px-3 py-2.5 shadow-[2px_2px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5"
              >
                <span className="h-3 w-3 shrink-0 rounded-full border-2 border-ink" style={{ background: g.colour }} />
                <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold">{g.name}</span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3">
                  {gameBests[g.id] ? gameBests[g.id] : 'new'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={`mt-8 ${shownGuides.length ? '' : 'hidden'}`}>
        <div className="mb-2.5 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold tracking-tight">Guides</h2>
          <Link to="/guides" className="mono-label underline decoration-ink/30 underline-offset-4">
            Open guides
          </Link>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {shownGuides.map((g) => (
            <li key={g.slug}>
              <Link
                to={`/guides/${g.slug}`}
                className="flex h-full items-center gap-2.5 rounded-xl border-2 border-ink bg-card px-3 py-2.5 shadow-[2px_2px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5"
              >
                <BookOpen className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 flex-1 truncate text-[13px] font-extrabold">{g.title}</span>
                <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3">{g.minutes}m</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={`mt-8 max-w-[560px] ${q ? 'hidden' : ''}`}>
        <h2 className="mb-2.5 font-display text-xl font-extrabold tracking-tight">Settings</h2>
        <div className="grid gap-2">
          <button
            type="button"
            onClick={onSound}
            className="flex items-center gap-3 rounded-xl border-2 border-ink bg-card px-3.5 py-3 text-left shadow-[2px_2px_0_var(--color-ink)]"
          >
            {muted ? <VolumeX className="h-4 w-4 opacity-50" /> : <Volume2 className="h-4 w-4" />}
            <span className="flex-1 text-[13.5px] font-bold">Sound</span>
            <span className="chip bg-[#f4f2ea] border-line">{muted ? 'muted' : 'on'}</span>
          </button>
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-3 rounded-xl border-2 border-ink bg-card px-3.5 py-3 text-left shadow-[2px_2px_0_var(--color-ink)]"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="flex-1 text-[13.5px] font-bold">Reset all progress</span>
            <span className="chip bg-[#f4f2ea] border-line">clears scores</span>
          </button>
        </div>
      </section>
    </div>
  )
}
