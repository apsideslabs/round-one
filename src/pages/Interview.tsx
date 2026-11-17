import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw, ChevronRight } from 'lucide-react'
import { Person, Bubble, Thought, Defs, type Mood } from '@/components/comic/Faces'

type Scene = 'wide' | 'panel' | 'you'

interface Choice { label: string; next: string; points: number }
interface Node {
  id: string
  scene: Scene
  caption: string
  say?: string
  moods: [Mood, Mood, Mood]
  thought?: string
  sfx?: string
  sweat?: boolean
  choices?: Choice[]
  verdict?: 'yes' | 'maybe' | 'no'
}

const NODES: Record<string, Node> = {
  open: {
    id: 'open', scene: 'wide', caption: 'Panel 1 · the room',
    say: 'Tell me about yourself.', moods: ['neutral', 'neutral', 'sceptical'],
    choices: [
      { label: 'Recite the CV from school onward', next: 'cv', points: -1 },
      { label: 'One line, then one result with a number', next: 'proof', points: 2 },
      { label: '“I am hardworking and sincere.”', next: 'cliche', points: 0 }
    ]
  },
  cv: {
    id: 'cv', scene: 'panel', caption: 'Panel 2 · forty seconds of marks',
    moods: ['bored', 'bored', 'neutral'], thought: 'he is listing subjects', sfx: '…',
    choices: [{ label: '…and then my internship, and then…', next: 'why', points: -1 }]
  },
  proof: {
    id: 'proof', scene: 'panel', caption: 'Panel 2 · one sentence, one number',
    moods: ['impressed', 'smile', 'neutral'], thought: 'finally, a result', sfx: '!!',
    choices: [{ label: '“That cut our report time from 3 days to 4 hours.”', next: 'why', points: 1 }]
  },
  cliche: {
    id: 'cliche', scene: 'panel', caption: 'Panel 2 · the sentence everyone says',
    moods: ['frown', 'bored', 'sceptical'], thought: 'generic', sweat: true,
    choices: [{ label: '“I know everyone says that — here is the proof.”', next: 'why', points: 0 }]
  },
  why: {
    id: 'why', scene: 'wide', caption: 'Panel 3 · question two',
    say: 'Why this company?', moods: ['neutral', 'smile', 'sceptical'],
    choices: [
      { label: '“Good growth, good culture.”', next: 'weak_q', points: 0 },
      { label: 'Name their product, and your gap in it', next: 'strong_q', points: 2 },
      { label: '“Any company is fine, I just need a job.”', next: 'dead', points: -2 }
    ]
  },
  weak_q: {
    id: 'weak_q', scene: 'wide', caption: 'Panel 4 · the follow-up',
    say: 'What is your weakness?', moods: ['neutral', 'neutral', 'sceptical'],
    choices: [
      { label: '“I am a perfectionist.”', next: 'end_maybe', points: -1 },
      { label: 'A real one, plus what you changed', next: 'end_yes', points: 2 },
      { label: '“I do not really have one.”', next: 'dead', points: -2 }
    ]
  },
  strong_q: {
    id: 'strong_q', scene: 'wide', caption: 'Panel 4 · the follow-up',
    say: 'What is your weakness?', moods: ['smile', 'neutral', 'neutral'],
    choices: [
      { label: '“I am a perfectionist.”', next: 'end_maybe', points: -1 },
      { label: 'A real one, plus what you changed', next: 'end_yes', points: 2 }
    ]
  },
  dead: {
    id: 'dead', scene: 'you', caption: 'Panel 5 · the room goes quiet',
    moods: ['frown', 'bored', 'sceptical'], thought: 'no pull toward us', sweat: true, verdict: 'no'
  },
  end_maybe: {
    id: 'end_maybe', scene: 'you', caption: 'Panel 5 · they write something down',
    moods: ['neutral', 'neutral', 'sceptical'], thought: 'could be anyone', verdict: 'maybe'
  },
  end_yes: {
    id: 'end_yes', scene: 'you', caption: 'Panel 5 · they lean in',
    moods: ['impressed', 'impressed', 'smile'], thought: 'he knows himself', verdict: 'yes'
  }
}

export default function Interview() {
  const [nodeId, setNodeId] = useState('open')
  const [points, setPoints] = useState(0)
  const [history, setHistory] = useState<string[]>([])
  const node = NODES[nodeId]

  const choose = (c: Choice) => {
    setPoints((p) => p + c.points)
    setHistory((h) => [...h, nodeId])
    setNodeId(c.next)
  }
  const restart = () => { setNodeId('open'); setPoints(0); setHistory([]) }

  const verdict = node.verdict
  const stamp = verdict === 'yes' ? 'SELECTED' : verdict === 'maybe' ? 'ON THE FENCE' : verdict === 'no' ? 'NOT THIS TIME' : null
  const stampColour = verdict === 'yes' ? '#0e8c6a' : verdict === 'maybe' ? '#b8860b' : '#be123c'
  const meter = Math.max(0, Math.min(6, points + 2))

  return (
    <div className="w-full px-3 pb-24 pt-4 sm:px-6 md:pb-10 lg:px-8">
      <div className="mx-auto max-w-[980px]">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="chip bg-ink text-paper">Scene</span>
            <h1 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">The interview</h1>
            <p className="mt-0.5 text-[12.5px] font-medium text-ink-3">Four answers. Three faces. One stamp at the end.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="mono-label">impression</span>
            <div className="flex gap-1">
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className={`h-3 w-7 rounded-[3px] border-2 border-ink ${i < meter ? 'bg-c2' : 'bg-[#eeece4]'}`} />
              ))}
            </div>
          </div>
        </div>

        <div key={node.id} className="comic-panel relative overflow-hidden rounded-2xl border-[3px] border-ink bg-[#fffcf5] shadow-[7px_7px_0_var(--color-ink)]">
          <svg viewBox="0 0 800 450" className="block w-full">
            <Defs />
            {/* room */}
            <rect width="800" height="450" fill="url(#wall)" />
            <rect x="0" y="0" width="800" height="300" fill="url(#wall)" />
            <line x1="0" y1="300" x2="800" y2="300" stroke="#12151a" strokeWidth="3" />
            <rect x="0" y="300" width="800" height="150" fill="#e7e2d3" />
            <rect x="0" y="300" width="800" height="150" fill="url(#hatch)" opacity="0.25" />

            {/* window + light */}
            <rect x="600" y="40" width="150" height="120" fill="#cfe3ee" stroke="#12151a" strokeWidth="4" />
            <line x1="675" y1="40" x2="675" y2="160" stroke="#12151a" strokeWidth="3" />
            <line x1="600" y1="100" x2="750" y2="100" stroke="#12151a" strokeWidth="3" />
            <polygon points="600,160 750,160 470,450 120,450" fill="url(#light)" opacity="0.55" />

            {/* framed picture */}
            <rect x="70" y="46" width="110" height="80" fill="#efece1" stroke="#12151a" strokeWidth="3.5" />
            <path d="M 78 118 l 30 -40 l 22 26 l 18 -18 l 24 32 Z" fill="#b9c7a6" stroke="#12151a" strokeWidth="2" />

            {node.scene === 'wide' && (
              <>
                {/* desk */}
                <rect x="150" y="300" width="620" height="20" fill="#c9a227" stroke="#12151a" strokeWidth="3.5" />
                <rect x="150" y="300" width="620" height="20" fill="url(#wood)" opacity="0.6" />
                <rect x="176" y="320" width="20" height="110" fill="#a8871d" stroke="#12151a" strokeWidth="3" />
                <rect x="726" y="320" width="20" height="110" fill="#a8871d" stroke="#12151a" strokeWidth="3" />

                <ellipse cx="470" cy="432" rx="330" ry="20" fill="#12151a" opacity="0.10" />
                {/* props: laptop, mug, papers, nameplates */}
                <g>
                  <path d="M 300 300 l 10 -40 l 90 0 l 6 40 Z" fill="#8e9aa6" stroke="#12151a" strokeWidth="3" />
                  <rect x="296" y="296" width="116" height="8" rx="3" fill="#6f7a86" stroke="#12151a" strokeWidth="2.5" />
                </g>
                <rect x="470" y="272" width="34" height="30" rx="4" fill="#fffcf5" stroke="#12151a" strokeWidth="3" />
                <path d="M 504 278 q 16 6 0 18" fill="none" stroke="#12151a" strokeWidth="3" />
                <rect x="520" y="290" width="70" height="12" fill="#fffcf5" stroke="#12151a" strokeWidth="2.5" transform="rotate(-4 520 290)" />
                <rect x="200" y="290" width="60" height="12" fill="#fffcf5" stroke="#12151a" strokeWidth="2.5" transform="rotate(3 200 290)" />

                {/* panellists */}
                <Person x={392} y={128} scale={0.86} skin="#f0c9a4" skinShade="#e0b189" hair="#2b2b2b" shirt="#2f5bff" mood={node.moods[0]} hairStyle="short" glasses lookX={-2} />
                <Person x={502} y={120} scale={0.92} skin="#d9a273" skinShade="#c78e5f" hair="#12151a" shirt="#be123c" mood={node.moods[1]} hairStyle="bun" lookX={-2} />
                <Person x={614} y={128} scale={0.86} skin="#c98d5c" skinShade="#b47a4b" hair="#3d2b1f" shirt="#0e8c6a" mood={node.moods[2]} hairStyle="bald" beard lookX={-2} />

                {/* nameplates */}
                {[392, 502, 614].map((cx, i) => (
                  <g key={cx}>
                    <rect x={cx - 34} y="304" width="68" height="14" rx="2" fill="#12151a" opacity="0.85" />
                    <text x={cx} y="314" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#fffcf5" fontFamily="JetBrains Mono, monospace">
                      {['P·ONE', 'P·TWO', 'P·THREE'][i]}
                    </text>
                  </g>
                ))}

                {/* candidate, foreground, out of focus */}
                <g filter="url(#soft)">
                  <ellipse cx="86" cy="392" rx="58" ry="60" fill="#12151a" />
                  <path d="M 18 450 q 68 -54 136 0 Z" fill="#ff4b26" stroke="#12151a" strokeWidth="3" />
                </g>
              </>
            )}

            {node.scene === 'panel' && (
              <>
                <rect x="0" y="300" width="800" height="150" fill="url(#halftone)" opacity="0.45" />
                <Person x={230} y={150} scale={1.15} skin="#f0c9a4" skinShade="#e0b189" hair="#2b2b2b" shirt="#2f5bff" mood={node.moods[0]} hairStyle="short" glasses lookX={2} />
                <Person x={400} y={142} scale={1.22} skin="#d9a273" skinShade="#c78e5f" hair="#12151a" shirt="#be123c" mood={node.moods[1]} hairStyle="bun" lookX={2} />
                <Person x={572} y={150} scale={1.15} skin="#c98d5c" skinShade="#b47a4b" hair="#3d2b1f" shirt="#0e8c6a" mood={node.moods[2]} hairStyle="bald" beard lookX={2} />
              </>
            )}

            {node.scene === 'you' && (
              <>
                <rect x="0" y="300" width="800" height="150" fill="url(#halftone)" opacity="0.45" />
                <Person x={400} y={130} scale={1.5} skin="#f0c9a4" skinShade="#e0b189" hair="#2b2b2b" shirt="#ff4b26" mood={node.sweat ? 'frown' : 'neutral'} hairStyle="short" sweat={node.sweat} />
                <Person x={120} y={188} scale={0.52} skin="#d9a273" hair="#12151a" shirt="#be123c" mood={node.moods[1]} hairStyle="bun" lookX={2} />
                <Person x={680} y={188} scale={0.52} skin="#c98d5c" hair="#3d2b1f" shirt="#0e8c6a" mood={node.moods[2]} hairStyle="bald" beard lookX={-2} />
              </>
            )}

            {node.say && <Bubble x={502} y={22} text={node.say} />}
            {node.thought && <Thought x={502} y={24} text={node.thought} />}
            {node.sfx && (
              <text x={70} y={250} fontSize="34" fontWeight="900" fill="#12151a" fontFamily="Bricolage Grotesque, sans-serif" opacity="0.8">
                {node.sfx}
              </text>
            )}

            {/* caption tab */}
            <g>
              <rect x="0" y="0" width="330" height="34" fill="#12151a" />
              <rect x="330" y="0" width="16" height="34" fill="#f5b01b" />
              <text x="16" y="22" fontSize="11.5" fontWeight="800" fill="#fffcf5" fontFamily="JetBrains Mono, monospace">
                {node.caption.toUpperCase()}
              </text>
            </g>

            <rect width="800" height="450" fill="url(#vignette)" pointerEvents="none" />
          </svg>

          {stamp && (
            <div
              className="comic-stamp pointer-events-none absolute right-8 top-12 rounded-sm border-[5px] px-4 py-1.5 font-display text-2xl font-extrabold uppercase tracking-[0.18em] sm:text-3xl"
              style={{ borderColor: stampColour, color: stampColour, background: 'rgba(255,252,245,0.82)' }}
            >
              {stamp}
            </div>
          )}
        </div>

        {/* filmstrip */}
        <div className="mt-2 flex gap-1.5">
          {history.map((h, i) => (
            <div key={`${h}-${i}`} className="h-9 flex-1 rounded border-2 border-ink/25 bg-[#efece1]" />
          ))}
          <div className="h-9 flex-1 rounded border-2 border-ink bg-c3-soft" />
        </div>

        {/* choices */}
        <div className="mt-3 flex flex-wrap items-stretch gap-2">
          {node.choices?.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => choose(c)}
              className="group flex min-w-[240px] max-w-[360px] flex-1 items-center justify-between gap-2 rounded-xl border-2 border-ink bg-card px-3.5 py-2.5 text-left text-[13px] font-bold leading-snug shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <span>{c.label}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
          {stamp && (
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-c1 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-[3px_3px_0_var(--color-ink)]"
            >
              <RotateCcw className="h-3.5 w-3.5" /> walk in again
            </button>
          )}
        </div>

        {stamp && (
          <p className="mt-3 text-[12.5px] font-medium leading-relaxed text-ink-2">
            {verdict === 'yes'
              ? 'They leaned in: you named something of theirs and showed a result of yours.'
              : verdict === 'maybe'
                ? 'Polite, forgettable. Nothing in the answers could only have come from you.'
                : 'One sentence about needing a job undid the rest. The panel writes you off quietly.'}{' '}
            <Link to="/panel" className="font-bold underline underline-offset-4">Practise the written panel →</Link>
          </p>
        )}
      </div>
    </div>
  )
}
