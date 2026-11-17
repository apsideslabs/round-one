import { useState } from 'react'
import { Person, Bubble, Thought, Halftone, type Mood } from './ComicFaces'

type Scene = 'room' | 'panel' | 'candidate'

interface Choice {
  label: string
  next: string
  points: number
  stamp?: string
}

interface Node {
  id: string
  scene: Scene
  caption: string
  say?: { text: string; x: number; y: number }
  moods: [Mood, Mood, Mood]
  thought?: string
  choices?: Choice[]
  verdict?: 'yes' | 'maybe' | 'no'
}

const NODES: Record<string, Node> = {
  open: {
    id: 'open',
    scene: 'room',
    caption: 'Panel 1 · You sit down',
    say: { text: 'Tell me about yourself.', x: 296, y: 84 },
    moods: ['neutral', 'neutral', 'neutral'],
    choices: [
      { label: 'Recite the CV from school onward', next: 'cv', points: -1 },
      { label: 'One line, then one result with a number', next: 'proof', points: 2 },
      { label: '“I am hardworking and sincere.”', next: 'cliche', points: 0 }
    ]
  },
  cv: {
    id: 'cv',
    scene: 'panel',
    caption: 'Panel 2 · Forty seconds of school marks',
    moods: ['bored', 'bored', 'neutral'],
    thought: 'he is listing subjects',
    choices: [{ label: '…and then I did my internship, and then…', next: 'why', points: -1 }]
  },
  proof: {
    id: 'proof',
    scene: 'panel',
    caption: 'Panel 2 · One sentence, one number',
    moods: ['impressed', 'smile', 'neutral'],
    thought: 'finally, a result',
    choices: [{ label: 'That project cut our report time from 3 days to 4 hours.', next: 'why', points: 1 }]
  },
  cliche: {
    id: 'cliche',
    scene: 'panel',
    caption: 'Panel 2 · The sentence everyone says',
    moods: ['frown', 'bored', 'neutral'],
    thought: 'generic',
    choices: [{ label: 'Everyone says that, I know. Here is the proof…', next: 'why', points: 0 }]
  },
  why: {
    id: 'why',
    scene: 'room',
    caption: 'Panel 3 · Question two',
    say: { text: 'Why this company?', x: 296, y: 84 },
    moods: ['neutral', 'smile', 'neutral'],
    choices: [
      { label: '“Good growth, good culture.”', next: 'end_generic', points: 0 },
      { label: 'Name their product and your gap in it', next: 'end_strong', points: 2 },
      { label: '“Any company is fine, I just need a job.”', next: 'end_weak', points: -2 }
    ]
  },
  end_strong: {
    id: 'end_strong',
    scene: 'candidate',
    caption: 'Panel 4 · You name the thing they build',
    moods: ['impressed', 'impressed', 'smile'],
    thought: 'he did the homework',
    verdict: 'yes'
  },
  end_generic: {
    id: 'end_generic',
    scene: 'candidate',
    caption: 'Panel 4 · Nothing they can hold on to',
    moods: ['neutral', 'bored', 'neutral'],
    thought: 'could be any company',
    verdict: 'maybe'
  },
  end_weak: {
    id: 'end_weak',
    scene: 'candidate',
    caption: 'Panel 4 · The sentence that ends it',
    moods: ['frown', 'frown', 'bored'],
    thought: 'no pull toward us',
    verdict: 'no'
  }
}

export function Comic() {
  const [nodeId, setNodeId] = useState('open')
  const [points, setPoints] = useState(0)
  const [history, setHistory] = useState<string[]>([])
  const node = NODES[nodeId]

  const choose = (c: Choice) => {
    setPoints((p) => p + c.points)
    setHistory((h) => [...h, nodeId])
    setNodeId(c.next)
  }

  const restart = () => {
    setNodeId('open')
    setPoints(0)
    setHistory([])
  }

  const verdict = node.verdict
  const stamp = verdict === 'yes' ? 'SELECTED' : verdict === 'maybe' ? 'ON THE FENCE' : verdict === 'no' ? 'NOT THIS TIME' : null
  const stampColour = verdict === 'yes' ? '#0e8c6a' : verdict === 'maybe' ? '#f5b01b' : '#be123c'

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto] overflow-hidden">
      <div className="grid place-items-center p-3">
        <div className="w-full max-w-[760px]">
          {/* the panel itself */}
          <div
            key={node.id}
            className="comic-panel relative overflow-hidden rounded-xl border-2 border-ink bg-[#fffcf5] shadow-[5px_5px_0_var(--color-ink)]"
          >
              <svg viewBox="0 0 640 360" className="block w-full">
                <defs>
                  <Halftone id="dots" />
                </defs>

                {/* room */}
                <rect width="640" height="360" fill="#f7f5ee" />
                <rect x="0" y="0" width="640" height="250" fill="#efece1" />
                <line x1="0" y1="250" x2="640" y2="250" stroke="#12151a" strokeWidth="2.5" />
                <rect x="470" y="34" width="120" height="86" fill="#dfe9ef" stroke="#12151a" strokeWidth="3" />
                <line x1="530" y1="34" x2="530" y2="120" stroke="#12151a" strokeWidth="2" />
                <line x1="470" y1="77" x2="590" y2="77" stroke="#12151a" strokeWidth="2" />

                {node.scene === 'room' && (
                  <>
                    {/* desk */}
                    <rect x="150" y="250" width="440" height="16" fill="#c9a227" stroke="#12151a" strokeWidth="3" />
                    <rect x="170" y="266" width="16" height="70" fill="#a8871d" stroke="#12151a" strokeWidth="2.5" />
                    <rect x="556" y="266" width="16" height="70" fill="#a8871d" stroke="#12151a" strokeWidth="2.5" />
                    {/* panellists behind the desk */}
                    <Person x={300} y={120} scale={0.62} skin="#f0c9a4" hair="#2b2b2b" shirt="#2f5bff" mood={node.moods[0]} hairStyle="short" glasses />
                    <Person x={392} y={116} scale={0.64} skin="#d9a273" hair="#12151a" shirt="#be123c" mood={node.moods[1]} hairStyle="bun" />
                    <Person x={486} y={120} scale={0.62} skin="#c98d5c" hair="#3d2b1f" shirt="#0e8c6a" mood={node.moods[2]} hairStyle="curly" />
                    {/* candidate, back of head, foreground */}
                    <g>
                      <ellipse cx="62" cy="322" rx="46" ry="50" fill="#12151a" />
                      <path d="M 8 360 q 54 -40 108 0 Z" fill="#ff4b26" stroke="#12151a" strokeWidth="3" />
                    </g>
                  </>
                )}

                {node.scene === 'panel' && (
                  <>
                    <rect x="0" y="250" width="640" height="110" fill="url(#dots)" opacity="0.5" />
                    <Person x={180} y={130} scale={1.0} skin="#f0c9a4" hair="#2b2b2b" shirt="#2f5bff" mood={node.moods[0]} hairStyle="short" glasses />
                    <Person x={330} y={124} scale={1.05} skin="#d9a273" hair="#12151a" shirt="#be123c" mood={node.moods[1]} hairStyle="bun" />
                    <Person x={480} y={130} scale={1.0} skin="#c98d5c" hair="#3d2b1f" shirt="#0e8c6a" mood={node.moods[2]} hairStyle="curly" />
                  </>
                )}

                {node.scene === 'candidate' && (
                  <>
                    <rect x="0" y="250" width="640" height="110" fill="url(#dots)" opacity="0.5" />
                    <Person x={320} y={130} scale={1.5} skin="#f0c9a4" hair="#2b2b2b" shirt="#ff4b26" mood="neutral" hairStyle="short" />
                    <Person x={96} y={150} scale={0.5} skin="#d9a273" hair="#12151a" shirt="#be123c" mood={node.moods[1]} hairStyle="bun" />
                    <Person x={548} y={150} scale={0.5} skin="#c98d5c" hair="#3d2b1f" shirt="#0e8c6a" mood={node.moods[2]} hairStyle="curly" />
                  </>
                )}

                {node.say && <Bubble x={node.say.x} y={node.say.y}>{node.say.text}</Bubble>}
                {node.thought && <Thought x={360} y={92}>{node.thought}</Thought>}

                {/* caption box */}
                <rect x="16" y="16" width="300" height="30" fill="#12151a" />
                <text x="28" y="36" fontSize="11" fontWeight="700" fill="#fffcf5" fontFamily="JetBrains Mono, monospace">
                  {node.caption.toUpperCase()}
                </text>
              </svg>

              {stamp && (
                <div
                  className="comic-stamp pointer-events-none absolute right-6 top-6 border-4 px-3 py-1 font-display text-xl font-extrabold uppercase tracking-widest"
                  style={{ borderColor: stampColour, color: stampColour, background: 'rgba(255,252,245,0.88)' }}
                >
                  {stamp}
                </div>
              )}
          </div>

          {/* thumbnails of the panels you have already lived through */}
          {history.length > 0 && (
            <div className="mt-2 flex gap-1.5">
              {history.map((h, i) => (
                <div key={`${h}-${i}`} className="h-8 flex-1 rounded border-2 border-ink/30 bg-[#efece1]" />
              ))}
              <div className="h-8 flex-1 rounded border-2 border-ink bg-c3-soft" />
            </div>
          )}
        </div>
      </div>

      <div className="border-t-2 border-ink bg-paper px-3 py-2">
        <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
          <span className="chip bg-[#f4f2ea] border-line">impression</span>
          <div className="flex gap-1">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i} className={`h-2.5 w-6 rounded-sm border border-ink ${i < Math.max(0, Math.min(6, points + 2)) ? 'bg-c2' : 'bg-[#eeece4]'}`} />
            ))}
          </div>
          <button type="button" onClick={restart} className="rounded-lg border-2 border-ink bg-card px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]">
            restart scene
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {node.choices?.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => choose(c)}
              className="max-w-[280px] rounded-lg border-2 border-ink bg-card px-3 py-1.5 text-left text-[12px] font-bold leading-snug shadow-[2px_2px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
            >
              {c.label}
            </button>
          ))}
          {stamp && (
            <button type="button" onClick={restart} className="rounded-lg border-2 border-ink bg-c1 px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_var(--color-ink)]">
              run it again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
