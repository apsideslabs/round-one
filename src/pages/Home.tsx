import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dial } from '@/components/Dial'
import { TrackRow } from '@/components/TrackRow'
import { tracks } from '@/data/tracks'
import { guides } from '@/data/guides'
import { useProgress } from '@/store/progress'
import { readiness } from '@/lib/scoring'
import { QUESTION_COUNT } from '@/data/tracks'

export default function Home() {
  const scores = useProgress((s) => s.scores)
  const ready = readiness(scores)

  return (
    <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
      <section className="mt-5 overflow-hidden rounded-[26px] border-2 border-ink bg-ink p-5 text-white shadow-[8px_8px_0_var(--color-ink)] sm:p-9">
        <div className="grid items-center gap-7 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <span className="chip border-white/35 bg-white/10 text-white">
              <span className="h-2 w-2 rounded-full bg-c1" />
              {QUESTION_COUNT} questions · 4 rounds
            </span>
            <h1 className="mt-3 text-balance font-display text-4xl font-extrabold leading-[0.95] tracking-tighter sm:text-6xl">
              Train the rounds that <em className="not-italic text-c3 underline decoration-c1 decoration-[0.1em] underline-offset-4">cut people.</em>
            </h1>
            <p className="mt-3 max-w-[42ch] text-[15px] font-medium leading-relaxed text-white/70">
              Four rounds, one panel. Practise what the interview actually tests.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button variant="accent" asChild>
                <Link to="/logic">
                  Start round 01 <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="light" asChild>
                <Link to="/panel">Jump to the panel</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-ink bg-card p-4 text-ink shadow-[5px_5px_0_rgba(255,75,38,0.9)]">
            <Dial scores={scores} readiness={ready} />
          </div>
        </div>
      </section>

      <div className="mt-7 mb-3 flex items-end justify-between">
        <h2 className="font-display text-xl font-extrabold tracking-tight">Rounds</h2>
        <span className="mono-label">best score</span>
      </div>

      <section className="overflow-hidden rounded-[20px] border-2 border-ink shadow-[5px_5px_0_var(--color-ink)]">
        {tracks.map((t) => (
          <TrackRow key={t.id} track={t} best={scores[t.id]} />
        ))}
      </section>

      <div className="mt-8 mb-3 flex items-end justify-between">
        <h2 className="font-display text-xl font-extrabold tracking-tight">Learn the method</h2>
        <Link to="/guides" className="mono-label underline decoration-ink/30 underline-offset-4">
          All {guides.length} guides
        </Link>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {guides.slice(0, 3).map((g, i) => (
          <motion.div key={g.slug} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link
              to={`/guides/${g.slug}`}
              className="group flex h-full flex-col gap-2 rounded-2xl border-2 border-ink bg-card p-4 shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5"
            >
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="mono-label">{g.kicker}</span>
              </span>
              <span className="font-display text-lg font-extrabold tracking-tight">{g.title}</span>
              <span className="text-[13px] font-medium leading-relaxed text-ink-2">{g.summary}</span>
              <span className="mono-label mt-auto pt-2">{g.minutes} min read</span>
            </Link>
          </motion.div>
        ))}
      </section>
    </div>
  )
}
