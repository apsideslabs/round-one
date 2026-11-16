import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, Clock, Flame, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dial } from '@/components/Dial'
import { TrackRow } from '@/components/TrackRow'
import { tracks, trackById, QUESTION_COUNT, type TrackId } from '@/data/tracks'
import { guides } from '@/data/guides'
import { games } from '@/data/games'
import { useProgress } from '@/store/progress'
import { readiness } from '@/lib/scoring'
import { currentStreak, lastSeven } from '@/lib/streak'
import { pct } from '@/lib/utils'

const shell = 'w-full px-4 sm:px-6 lg:px-8'

/** The guide that matches each round, used for the next-step suggestion. */
const guideFor: Record<TrackId, string> = {
  logic: 'classification',
  verbal: 'star-answers',
  memory: 'star-answers',
  riddles: 'classification',
  panel: 'star-answers',
  morality: 'salary-negotiation'
}

export default function Home() {
  const { scores, gameBests, lastRound, days } = useProgress()
  const ready = readiness(scores)
  const streak = currentStreak(days)
  const week = lastSeven(days)

  // What to do next: resume the last round, else the round with the lowest share.
  const weakest = [...tracks].sort(
    (a, b) => pct(scores[a.id] ?? 0, a.max) - pct(scores[b.id] ?? 0, b.max)
  )[0]
  const resume = lastRound ? trackById(lastRound) : weakest
  const resumeScore = scores[resume.id] ?? 0
  const resumePct = pct(resumeScore, resume.max)

  const plan = [
    {
      kind: 'Round',
      title: resume.name,
      reason: lastRound ? 'where you left off' : 'your lowest score so far',
      to: resume.path,
      meta: `${resumeScore}/${resume.max}`
    },
    {
      kind: 'Game',
      title: (games.find((g) => !gameBests[g.id]) ?? games[0]).name,
      reason: games.some((g) => !gameBests[g.id]) ? 'not played yet' : 'keep the streak alive',
      to: (games.find((g) => !gameBests[g.id]) ?? games[0]).path,
      meta: '3 min'
    },
    {
      kind: 'Guide',
      title: guides.find((g) => g.slug === guideFor[resume.id])?.title ?? guides[0].title,
      reason: `the method behind ${resume.short.toLowerCase()}`,
      to: `/guides/${guides.find((g) => g.slug === guideFor[resume.id])?.slug ?? guides[0].slug}`,
      meta: `${guides.find((g) => g.slug === guideFor[resume.id])?.minutes ?? 6} min`
    }
  ]

  return (
    <div className="w-full">
      {/* lead: the single next action, not a brochure */}
      <section className="w-full bg-ink text-white">
        <div className={`${shell} grid items-center gap-8 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:py-12`}>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip border-white/35 bg-white/10 text-white">
                <Flame className="h-3 w-3" /> {streak} day{streak === 1 ? '' : 's'}
              </span>
              <span className="chip border-white/35 bg-white/10 text-white">
                {QUESTION_COUNT} questions · {tracks.length} rounds · {games.length} games
              </span>
            </div>

            <p className="mono-label mt-5 text-white/50">{lastRound ? 'Continue' : 'Start here'}</p>
            <h1 className="mt-1 font-display text-3xl font-extrabold leading-[1.05] tracking-tighter sm:text-5xl">
              {resume.name}
            </h1>
            <p className="mt-2 max-w-[46ch] text-[14px] font-medium leading-relaxed text-white/70">
              {lastRound
                ? `You were here last. Best so far: ${resumeScore} of ${resume.max} (${resumePct}%).`
                : `Nothing attempted yet. Best so far is a blank page — ${resume.meta.join(', ').toLowerCase()}.`}
            </p>

            <div className="mt-3 h-2 w-full max-w-[340px] overflow-hidden rounded-full border-2 border-white/30">
              <div className="h-full transition-[width] duration-700" style={{ width: `${resumePct}%`, background: resume.colour }} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Button variant="accent" asChild>
                <Link to={resume.path}>
                  {lastRound ? 'Continue' : 'Start'} round <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="light" asChild>
                <Link to="/arcade">Arcade</Link>
              </Button>
              <Button variant="light" asChild>
                <Link to="/menu">Everything</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-ink bg-card p-4 text-ink shadow-[6px_6px_0_rgba(255,75,38,0.9)]">
            <div className="mb-3 flex items-center justify-between">
              <span className="mono-label">This week</span>
              <span className="font-mono text-[10px] font-bold">{streak} day streak</span>
            </div>
            <div className="mb-4 grid grid-cols-7 gap-1.5">
              {week.map((d) => (
                <div key={d.key} className="grid justify-items-center gap-1">
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-md border-2 border-ink text-[9px] font-bold ${
                      d.done ? 'bg-c2 text-white' : d.isToday ? 'bg-c3' : 'bg-card text-ink-3'
                    }`}
                  >
                    {d.done ? '✓' : ''}
                  </span>
                  <span className="font-mono text-[8px] font-bold uppercase text-ink-3">{d.label}</span>
                </div>
              ))}
            </div>
            <Dial scores={scores} readiness={ready} />
            <p className="mono-label mt-3 text-center">Progress is kept even if a day is missed</p>
          </div>
        </div>
      </section>

      {/* today's plan */}
      <div className={`${shell} pt-7`}>
        <div className="mb-2.5 flex items-end justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">Today’s plan</h2>
          <span className="mono-label">three things, about 15 minutes</span>
        </div>
        <ul className="grid gap-2.5 sm:grid-cols-3">
          {plan.map((item, i) => (
            <li key={`${item.kind}-${item.title}`}>
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link
                  to={item.to}
                  className="group flex h-full flex-col gap-1 rounded-xl border-2 border-ink bg-card px-3.5 py-3 shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="mono-label">{item.kind}</span>
                    <span className="font-mono text-[9px] font-bold text-ink-3">{item.meta}</span>
                  </span>
                  <span className="font-display text-base font-extrabold leading-tight tracking-tight">{item.title}</span>
                  <span className="text-[12.5px] font-medium leading-relaxed text-ink-3">{item.reason}</span>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-1.5 font-mono text-[9px] font-bold uppercase tracking-wider">
                    <Play className="h-3 w-3" /> Go
                  </span>
                </Link>
              </motion.div>
            </li>
          ))}
        </ul>
      </div>

      {/* rounds */}
      <div className={`${shell} pb-1 pt-8`}>
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">All rounds</h2>
          <span className="mono-label">best score</span>
        </div>
      </div>
      <section className="w-full border-y-2 border-ink">
        {tracks.map((t) => (
          <TrackRow key={t.id} track={t} best={scores[t.id]} />
        ))}
      </section>

      {/* arcade + guides */}
      <div className={`${shell} pb-28 pt-8`}>
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">Arcade</h2>
          <Link to="/arcade" className="mono-label underline decoration-ink/30 underline-offset-4">
            All {games.length} games
          </Link>
        </div>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {games.slice(0, 6).map((game) => (
            <Link
              key={game.id}
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
          ))}
        </section>

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
