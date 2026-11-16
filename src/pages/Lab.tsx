import { useState, type ReactNode } from 'react'
import { Check, Grid2x2, RotateCcw, Sparkles } from 'lucide-react'
import { MirrorBeam } from '@/lab/MirrorBeam'
import { FloodMaze } from '@/lab/FloodMaze'
import { WaveMatch } from '@/lab/WaveMatch'
import { Slingshot } from '@/lab/Slingshot'
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
    id: 'mirror',
    name: 'Mirror & beam',
    objective: 'Drag anywhere to turn the mirror until the beam lands in the target.',
    render: () => <MirrorBeam />
  },
  {
    id: 'maze',
    name: 'Flood search',
    objective: 'Tap cells to build walls. Watch the search spread and find the shortest path.',
    render: () => <FloodMaze />
  },
  {
    id: 'slingshot',
    name: 'Slingshot',
    objective: 'Drag back from the orb and release — let the wells bend the shot into the target.',
    render: () => <Slingshot />
  },
  {
    id: 'fold',
    name: 'Fold the net',
    objective: 'Scrub the slider to fold a flat net into a box.',
    render: () => <FoldNet />
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
        <div className="flex items-center gap-1.5">
          {STAGES.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStageId(s.id)}
              className={`rounded-lg border-2 border-ink px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider ${
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
            className={`grid h-7 w-7 place-items-center rounded-lg border-2 border-ink ${stageId === null ? 'bg-c1 text-white' : 'bg-card'}`}
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
