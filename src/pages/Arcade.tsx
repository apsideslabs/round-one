import { Link } from 'react-router-dom'
import { ArrowRight, Puzzle, Repeat, Calculator, Ruler, ListOrdered, Bug, Eye } from 'lucide-react'
import { games } from '@/data/games'
import { Carousel3D } from '@/components/Carousel3D'
import { useProgress } from '@/store/progress'

const icons: Record<string, typeof Puzzle> = {
  mastermind: Puzzle,
  sequence: Repeat,
  maths: Calculator,
  estimate: Ruler,
  triage: ListOrdered,
  debug: Bug,
  oddtile: Eye
}

export default function Arcade() {
  const gameBests = useProgress((s) => s.gameBests)

  return (
    <div className="w-full px-4 pb-24 md:pb-12 pt-7 sm:px-6 lg:px-8">
      <span className="chip">Arcade</span>
      <h1 className="mt-3 text-balance font-display text-3xl font-extrabold tracking-tighter sm:text-4xl">
        {games.length} drills, each mirroring a real interview task
      </h1>
      <p className="mt-2 max-w-[56ch] text-[15px] font-medium leading-relaxed text-ink-2">
        Three train a faculty — deduction, working memory, speed under pressure. Three rehearse an actual interview task: a guesstimate, a prioritisation call, a debugging round. Scores stay separate from your readiness, because a game is a warm-up, not a verdict.
      </p>

      <div className="mt-6">
        <Carousel3D
          items={games.map((g) => ({
            id: g.id,
            title: g.name,
            tagline: g.tagline,
            meta: g.skill.split('·')[0].trim(),
            path: g.path,
            colour: g.colour,
            soft: g.soft,
            ink: g.ink,
            best: gameBests[g.id]
          }))}
        />
      </div>

      <p className="mono-label mt-6">or pick from the list</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((game) => {
          const Icon = icons[game.id] ?? Puzzle
          const best = gameBests[game.id] ?? 0
          return (
            <div key={game.id}>
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
            </div>
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
