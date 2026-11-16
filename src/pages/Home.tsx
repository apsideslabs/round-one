import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dial } from '@/components/Dial'
import { TrackRow } from '@/components/TrackRow'
import { tracks, QUESTION_COUNT } from '@/data/tracks'
import { guides } from '@/data/guides'
import { games } from '@/data/games'
import { useProgress } from '@/store/progress'
import { readiness } from '@/lib/scoring'

const shell = 'w-full px-4 sm:px-6 lg:px-8'

export default function Home() {
  const scores = useProgress((s) => s.scores)
  const gameBests = useProgress((s) => s.gameBests)
  const ready = readiness(scores)
  const roundWord = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'][tracks.length] ?? String(tracks.length)

  return (
    <div className="w-full">
      {/* full-bleed hero */}
      <section className="w-full bg-ink text-white">
        <div className={`${shell} grid items-center gap-10 py-10 lg:grid-cols-[1.15fr_0.85fr] lg:py-16`}>
          <div>
            <span className="chip border-white/35 bg-white/10 text-white">
              <span className="h-2 w-2 rounded-full bg-c1" />
              {QUESTION_COUNT} questions · {tracks.length} rounds · {games.length} games
            </span>
            <h1 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[0.94] tracking-tighter sm:text-6xl lg:text-7xl">
              Train the rounds that{' '}
              <em className="not-italic text-c3 underline decoration-c1 decoration-[0.1em] underline-offset-4">cut people.</em>
            </h1>
            <p className="mt-4 max-w-[46ch] text-[15px] font-medium leading-relaxed text-white/70 sm:text-base">
              {roundWord} rounds, one panel. Practise what the interview actually tests — then warm up in the arcade.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button variant="accent" asChild>
                <Link to="/logic">
                  Start round 01 <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="light" asChild>
                <Link to="/panel">Jump to the panel</Link>
              </Button>
              <Button variant="light" asChild>
                <Link to="/arcade">Arcade</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-ink bg-card p-4 text-ink shadow-[6px_6px_0_rgba(255,75,38,0.9)]">
            <Dial scores={scores} readiness={ready} />
          </div>
        </div>
      </section>

      {/* full-bleed rounds */}
      <div className={`${shell} pb-1 pt-8`}>
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">Rounds</h2>
          <span className="mono-label">best score</span>
        </div>
      </div>
      <section className="w-full border-y-2 border-ink">
        {tracks.map((t) => (
          <TrackRow key={t.id} track={t} best={scores[t.id]} />
        ))}
      </section>

      {/* arcade */}
      <div className={`${shell} pb-28 pt-8`}>
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">Arcade</h2>
          <Link to="/arcade" className="mono-label underline decoration-ink/30 underline-offset-4">
            All {games.length} games
          </Link>
        </div>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {games.slice(0, 6).map((game, i) => (
            <motion.div key={game.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link
                to={game.path}
                className="group flex h-full flex-col gap-1.5 overflow-hidden rounded-2xl border-2 border-ink bg-card shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5"
              >
                <span className="flex items-center justify-between gap-2 border-b-2 border-ink px-3 py-2" style={{ background: game.colour, color: game.ink }}>
                  <span className="font-mono text-[8.5px] font-bold uppercase tracking-wider">{game.skill}</span>
                  <span className="font-mono text-[8.5px] font-bold uppercase tracking-wider opacity-90">
                    {gameBests[game.id] ? `best ${gameBests[game.id]}` : 'new'}
                  </span>
                </span>
                <span className="flex flex-1 flex-col gap-1 px-3.5 pb-3.5 pt-3">
                  <span className="font-display text-lg font-extrabold tracking-tight">{game.name}</span>
                  <span className="text-[13px] font-medium leading-relaxed text-ink-2">{game.tagline}</span>
                </span>
              </Link>
            </motion.div>
          ))}
        </section>

        {/* guides */}
        <div className="mb-3 mt-10 flex items-end justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">Learn the method</h2>
          <Link to="/guides" className="mono-label underline decoration-ink/30 underline-offset-4">
            All {guides.length} guides
          </Link>
        </div>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {guides.slice(0, 3).map((g) => (
            <Link
              key={g.slug}
              to={`/guides/${g.slug}`}
              className="group flex h-full flex-col gap-2 rounded-2xl border-2 border-ink bg-card p-4 shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="mono-label">{g.kicker}</span>
              </span>
              <span className="font-display text-lg font-extrabold tracking-tight">{g.title}</span>
              <span className="text-[13px] font-medium leading-relaxed text-ink-2">{g.summary}</span>
              <span className="mono-label mt-auto inline-flex items-center gap-1.5 pt-2">
                <Clock className="h-3 w-3" /> {g.minutes} min
              </span>
            </Link>
          ))}
        </section>
      </div>
    </div>
  )
}
