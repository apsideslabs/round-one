import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Flame, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dial } from '@/components/Dial'
import { HeroCanvas } from '@/components/HeroCanvas'
import { TrackRow } from '@/components/TrackRow'
import { tracks, trackById, QUESTION_COUNT, type TrackId } from '@/data/tracks'
import { guides } from '@/data/guides'
import { games } from '@/data/games'
import { useProgress } from '@/store/progress'
import { readiness } from '@/lib/scoring'
import { currentStreak } from '@/lib/streak'
import { Heatmap } from '@/components/Heatmap'
import { pct } from '@/lib/utils'

const shell = 'w-full px-4 sm:px-6 lg:px-8'

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

  const weakest = [...tracks].sort((a, b) => pct(scores[a.id] ?? 0, a.max) - pct(scores[b.id] ?? 0, b.max))[0]
  const resume = lastRound ? trackById(lastRound) : weakest
  const resumeScore = scores[resume.id] ?? 0
  const resumePct = pct(resumeScore, resume.max)

  const nextGame = games.find((g) => !gameBests[g.id]) ?? games[0]
  const nextGuide = guides.find((g) => g.slug === guideFor[resume.id]) ?? guides[0]

  return (
    <div className="w-full">
      {/* ---------- the hero, restored ---------- */}
      <section className="relative w-full overflow-hidden bg-ink text-white">
        <HeroCanvas className="pointer-events-auto absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_20%_0%,rgba(18,21,26,0.96)_0%,rgba(18,21,26,0.55)_45%,rgba(18,21,26,0)_75%)]" />
        <div className={`${shell} relative grid items-center gap-8 py-9 lg:grid-cols-[1.1fr_0.9fr] lg:py-14`}>
          <div>
            <span className="chip border-white/35 bg-white/10 text-white">
              <span className="h-2 w-2 rounded-full bg-c1" />
              {QUESTION_COUNT} questions · {tracks.length} rounds · {games.length} games
            </span>
            <h1 className="mt-4 text-balance font-display text-4xl font-extrabold leading-[0.94] tracking-tighter sm:text-6xl lg:text-7xl">
              Train the rounds that{' '}
              <em className="relative not-italic text-c3">
                cut people.
                <span className="hero-underline" aria-hidden="true" />
              </em>
            </h1>
            <p className="mt-4 max-w-[46ch] text-[15px] font-medium leading-relaxed text-white/70 sm:text-base">
              Aptitude, verbal, memory, riddles, a scored panel and moral reasoning — practise what the interview actually
              tests.
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
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="mono-label">Readiness</span>
              <span className="chip bg-[#f4f2ea] border-line">
                <Flame className="h-3 w-3" /> {streak} day{streak === 1 ? '' : 's'}
              </span>
            </div>
            <Dial scores={scores} readiness={ready} compact />
            <div className="mt-3 flex items-center justify-between gap-3">
              <Heatmap days={days} />
              <span className="mono-label shrink-0 text-right leading-tight">
                {days.length} day{days.length === 1 ? '' : 's'}
                <br />
                practised
              </span>
            </div>
            <p className="mono-label mt-2 text-center">progress is kept if a day is missed</p>
          </div>
        </div>
      </section>

      {/* ---------- continue ---------- */}
      <section className="w-full border-b-2 border-ink bg-card">
        <div className={`${shell} flex flex-wrap items-center justify-between gap-4 py-4`}>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border-2 border-ink font-mono text-[11px] font-bold"
              style={{ background: resume.colour, color: resume.ink }}
            >
              {resume.no}
            </span>
            <div className="min-w-0 flex-1">
              <p className="mono-label">{lastRound ? 'Continue' : 'Start here'}</p>
              <p className="truncate font-display text-lg font-extrabold leading-tight tracking-tight">{resume.name}</p>
              <div className="mt-1 flex max-w-[280px] items-center gap-2">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full border border-ink bg-[#f2f0e8]">
                  <span className="block h-full" style={{ width: `${resumePct}%`, background: resume.colour }} />
                </span>
                <span className="font-mono text-[9px] font-bold text-ink-3">{resumeScore}/{resume.max}</span>
              </div>
            </div>
          </div>
          <Button size="sm" asChild>
            <Link to={resume.path}>
              {lastRound ? 'Resume' : 'Begin'} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ---------- today's plan ---------- */}
      <div className={`${shell} pt-7`}>
        <div className="mb-2.5 flex items-end justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">Today’s plan</h2>
          <span className="mono-label">three things, about 15 minutes</span>
        </div>
        <ul className="grid gap-2.5 sm:grid-cols-3">
          {[
            { kind: 'Round', title: resume.name, reason: lastRound ? 'where you left off' : 'your lowest score so far', to: resume.path, meta: `${resumeScore}/${resume.max}` },
            { kind: 'Game', title: nextGame.name, reason: gameBests[nextGame.id] ? 'keep the streak alive' : 'not played yet', to: nextGame.path, meta: '3 min' },
            { kind: 'Guide', title: nextGuide.title, reason: `the method behind ${resume.short.toLowerCase()}`, to: `/guides/${nextGuide.slug}`, meta: `${nextGuide.minutes} min` }
          ].map((item, i) => (
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

      {/* ---------- rounds ---------- */}
      <div className={`${shell} pb-1 pt-8`}>
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold tracking-tight sm:text-2xl">All rounds</h2>
          <span className="mono-label">best score</span>
        </div>
      </div>
      <section className="w-full border-y-2 border-ink pb-16">
        {tracks.map((t) => (
          <TrackRow key={t.id} track={t} best={scores[t.id]} />
        ))}
      </section>
    </div>
  )
}
