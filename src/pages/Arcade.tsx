import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Puzzle, Repeat, Calculator } from 'lucide-react'
import { games } from '@/data/games'
import { useProgress } from '@/store/progress'

const icons: Record<string, typeof Puzzle> = { mastermind: Puzzle, sequence: Repeat, maths: Calculator }

export default function Arcade() {
  const gameBests = useProgress((s) => s.gameBests)

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-28 pt-7 sm:px-6">
      <span className="chip">Arcade</span>
      <h1 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tighter sm:text-4xl">
        Three drills that fit in a coffee break
      </h1>
      <p className="mt-2 max-w-[56ch] text-[15px] font-medium leading-relaxed text-ink-2">
        Each one trains a faculty the rounds test — deduction, working memory, and speed under pressure. Scores are kept
        separately from your readiness, because a game is a warm-up, not a verdict.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {games.map((game, i) => {
          const Icon = icons[game.id] ?? Puzzle
          const best = gameBests[game.id] ?? 0
          return (
            <motion.div key={game.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link
                to={game.path}
                className="group flex h-full flex-col overflow-hidden rounded-[20px] border-2 border-ink bg-card shadow-[5px_5px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between gap-3 border-b-2 border-ink px-4 py-3" style={{ background: game.colour, color: game.ink }}>
                  <span className="grid h-9 w-9 place-items-center rounded-lg border-2 border-current">
                    <Icon className="h-4 w-4" strokeWidth={2.4} />
                  </span>
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider opacity-90">
                    {best ? `best ${best}` : 'not played'}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1.5 p-4">
                  <h2 className="font-display text-xl font-extrabold tracking-tight">{game.name}</h2>
                  <p className="text-[13.5px] font-medium leading-relaxed text-ink-2">{game.tagline}</p>
                  <p className="mono-label mt-1">{game.skill}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 font-mono text-[9.5px] font-bold uppercase tracking-wider">
                    Play <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      <div className="card-pop mt-5 p-4">
        <p className="mono-label mb-2">How each one works</p>
        <ul className="grid gap-2.5">
          {games.map((game) => (
            <li key={game.id} className="text-[13px] font-medium leading-relaxed text-ink-2">
              <b className="text-ink">{game.name}.</b> {game.how}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
