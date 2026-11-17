import { useState, type ReactNode } from 'react'
import { Check, Grid2x2, RotateCcw, Sparkles } from 'lucide-react'
import { Optics } from '@/lab/Optics'
import { SetLogic } from '@/lab/SetLogic'
import { SortingRace } from '@/lab/SortingRace'
import { OfferDesk } from '@/lab/OfferDesk'
import { GaltonBoard } from '@/lab/GaltonBoard'
import { Negotiation } from '@/lab/Negotiation'
import { Pathfind } from '@/lab/Pathfind'
import { MatrixLab } from '@/lab/MatrixLab'
import { Bayes } from '@/lab/Bayes'
import { MontyHall } from '@/lab/MontyHall'
import { Harmonics } from '@/lab/Harmonics'
import { Spring } from '@/lab/Spring'
import { FloodMaze } from '@/lab/FloodMaze'
import { WaveMatch } from '@/lab/WaveMatch'
import { Projectile } from '@/lab/Projectile'
import { FoldNet } from '@/lab/FoldNet'

const STORE = 'round-one.lab.v1'

interface Stage {
  id: string
  name: string
  objective: string
  render: () => ReactNode
}

const STAGES: Stage[] = [
  {
    id: 'optics',
    name: 'Optics bench',
    objective: 'Change the angle. Mirror mode keeps θᵢ = θᵣ; slab mode bends the ray by Snell.',
    render: () => <Optics />
  },
  {
    id: 'maze',
    name: 'Flood search',
    objective: 'Tap cells to build walls. Watch the search spread and find the shortest path.',
    render: () => <FloodMaze />
  },
  {
    id: 'projectile',
    name: 'Projectile',
    objective: 'Set speed, angle and drag. The dashed arc is the same RK4 model that flies the shot.',
    render: () => <Projectile />
  },
  {
    id: 'sets',
    name: 'Set logic',
    objective: 'Drag the rings. If the premises hold while the conclusion fails, you have found a counterexample.',
    render: () => <SetLogic />
  },
  {
    id: 'fold',
    name: 'Fold the net',
    objective: 'Scrub the slider to fold a flat net into a box.',
    render: () => <FoldNet />
  },
  {
    id: 'galton',
    name: 'Galton board',
    objective: 'Each row is one answer. Drop a hundred interviews and watch where the pile lands.',
    render: () => <GaltonBoard />
  },
  {
    id: 'negotiate',
    name: 'Negotiation',
    objective: 'Six moves against a hidden ceiling. Leverage is visible; their limit is not.',
    render: () => <Negotiation />
  },
  {
    id: 'offer',
    name: 'Offer desk',
    objective: 'Two offers. CTC is not salary — find the monthly number that actually lands in the bank.',
    render: () => <OfferDesk />
  },
  {
    id: 'sorting',
    name: 'Sorting race',
    objective: 'Drag n. Bubble and merge sort the same array — compare the comparison counts.',
    render: () => <SortingRace />
  },
  {
    id: 'pathfind',
    name: 'Dijkstra',
    objective: 'Tap to add walls. Mud costs 5 — watch Dijkstra route around it while BFS would not.',
    render: () => <Pathfind />
  },
  {
    id: 'matrix',
    name: 'Matrix',
    objective: 'Drag a, b, c, d. The unit square transforms; the determinant is the area scale.',
    render: () => <MatrixLab />
  },
  {
    id: 'bayes',
    name: 'Bayes',
    objective: 'Set prevalence, sensitivity and false positives. Read the posterior off a hundred people.',
    render: () => <Bayes />
  },
  {
    id: 'monty',
    name: 'Monty Hall',
    objective: 'Pick a door, then run thousands of trials and watch stay against switch.',
    render: () => <MontyHall />
  },
  {
    id: 'harmonics',
    name: 'Harmonics',
    objective: 'Add odd harmonics to the rotating circles and watch the square wave appear.',
    render: () => <Harmonics />
  },
  {
    id: 'spring',
    name: 'Spring',
    objective: 'Change mass, stiffness and damping. ζ decides whether it rings, settles or crawls.',
    render: () => <Spring />
  },
  {
    id: 'wave',
    name: 'Wave lock',
    objective: 'Turn the dials until your wave sits on top of the blue one.',
    render: () => <WaveMatch />
  }
]

function loadKept(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORE) ?? '[]') as string[]
  } catch {
    return []
  }
}

export default function Lab() {
  const [stageId, setStageId] = useState<string | null>(null)
  const [kept, setKept] = useState<string[]>(loadKept)
  const [nonce, setNonce] = useState(0)

  const stage = STAGES.find((s) => s.id === stageId) ?? null

  const toggleKeep = (id: string) => {
    setKept((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      try {
        localStorage.setItem(STORE, JSON.stringify(next))
      } catch {
        /* private mode */
      }
      return next
    })
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem-4rem)] w-full flex-col overflow-hidden md:h-[calc(100dvh-3.5rem)]">
      {/* HUD — top */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b-2 border-ink bg-paper px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="chip bg-ink text-paper">Workspace</span>
          {stage ? (
            <span className="truncate text-[13px] font-extrabold">{stage.name}</span>
          ) : (
            <span className="truncate text-[13px] font-bold text-ink-3">blank stage</span>
          )}
        </div>
        <div className="flex max-w-full items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:thin]">
          {STAGES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStageId(s.id)}
              className={`shrink-0 whitespace-nowrap rounded-lg border-2 border-ink px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider ${
                stageId === s.id ? 'bg-c1 text-white' : 'bg-card'
              }`}
            >
              {s.name}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setStageId(null)}
            aria-label="Blank stage" 
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 border-ink ${stageId === null ? 'bg-c1 text-white' : 'bg-card'}`}
          >
            <Grid2x2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* the stage */}
      <div className="relative min-h-0 flex-1 bg-[#f7f5ee]">
        {stage ? (
          <div key={`${stage.id}-${nonce}`} className="absolute inset-0">
            {stage.render()}
          </div>
        ) : (
          <div
            className="absolute inset-0 grid place-items-center"
            style={{
              backgroundImage:
                'linear-gradient(rgba(18,21,26,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(18,21,26,0.07) 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}
          >
            <div className="max-w-[38ch] px-6 text-center">
              <p className="font-display text-2xl font-extrabold leading-tight tracking-tight text-ink/30">
                An empty stage.
              </p>
              <p className="mt-2 text-[13px] font-medium leading-relaxed text-ink-3">
                Pick an experiment above and it fills this space — no paragraphs, just something to move.
              </p>
              <p className="mt-3 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-ink-3">
                lab first · nothing ships until it is kept here
              </p>
            </div>
          </div>
        )}
      </div>

      {/* HUD — bottom */}
      <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t-2 border-ink bg-paper px-3 py-2">
        <p className="min-w-0 flex-1 truncate font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-ink-2">
          {stage ? stage.objective : 'choose a stage to begin'}
        </p>
        <div className="flex items-center gap-1.5">
          {stage && (
            <>
              <button
                type="button"
                onClick={() => setNonce((n) => n + 1)}
                className="inline-flex items-center gap-1.5 rounded-lg border-2 border-ink bg-card px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider"
              >
                <RotateCcw className="h-3 w-3" /> reset
              </button>
              <button
                type="button"
                onClick={() => toggleKeep(stage.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg border-2 border-ink px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider ${
                  kept.includes(stage.id) ? 'bg-c2 text-white' : 'bg-card'
                }`}
              >
                {kept.includes(stage.id) ? <Check className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
                {kept.includes(stage.id) ? 'kept' : 'keep for the app'}
              </button>
            </>
          )}
          {kept.length > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-lg border-2 border-ink bg-card px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider">
              shortlist · {kept.map((id) => STAGES.find((s) => s.id === id)?.name ?? id).join(' · ')}
            </span>
          )}
        </div>
      </footer>
    </div>
  )
}
