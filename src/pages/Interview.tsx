import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw, ChevronRight } from 'lucide-react'
import { Person, Bubble, Thought, Defs, type Mood } from '@/components/comic/Faces'

type Scene = 'wide' | 'panel' | 'board' | 'you'
type Panel = [number, number, number]

interface Choice { label: string; next: string; fx: Panel }
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
  final?: boolean
}

const NODES: Record<string, Node> = {
  intro: {
    id: 'intro', scene: 'wide', caption: 'Round 1 · the room',
    say: 'Tell me about yourself.', moods: ['neutral', 'neutral', 'sceptical'],
    choices: [
      { label: 'Recite the CV from school onward', next: 'project', fx: [-2, 0, -1] },
      { label: 'One line, then one result with a number', next: 'project', fx: [2, 1, 2] },
      { label: '“I am hardworking and sincere.”', next: 'project', fx: [-1, 1, -1] },
      { label: '“I applied because of what you build — here is why I fit.”', next: 'project', fx: [1, 2, 2] }
    ]
  },
  project: {
    id: 'project', scene: 'panel', caption: 'Round 1 · the project on your CV',
    say: 'Walk me through this project.', moods: ['neutral', 'smile', 'neutral'],
    choices: [
      { label: 'Describe what it does, no numbers', next: 'technical', fx: [0, 0, -1] },
      { label: 'Problem, what you built, the measured result', next: 'technical', fx: [2, 1, 2] },
      { label: '“It was a team project, I did my part.”', next: 'technical', fx: [-1, 0, -1] },
      { label: '“Can I draw the architecture?” — walk to the board', next: 'technical', fx: [2, 1, 1] }
    ]
  },
  technical: {
    id: 'technical', scene: 'board', caption: 'Round 2 · the whiteboard',
    say: 'How does a hash map actually work?', moods: ['neutral', 'neutral', 'neutral'],
    choices: [
      { label: '“I use the library, I don’t know the internals.”', next: 'failure', fx: [-2, 1, 0] },
      { label: 'Buckets, collisions, and the edge you are unsure of', next: 'failure', fx: [2, 2, 2] },
      { label: 'Bluff confidently with the wrong terms', next: 'failure', fx: [-2, -2, -2] },
      { label: '“Give me a second to think aloud.” Then reason it out', next: 'failure', fx: [1, 1, 2] }
    ]
  },
  failure: {
    id: 'failure', scene: 'panel', caption: 'Round 2 · behaviour',
    say: 'Tell me about a time you failed.', moods: ['sceptical', 'neutral', 'neutral'],
    choices: [
      { label: '“I have never really failed.”', next: 'why', fx: [-1, -1, -1] },
      { label: 'Explain how a teammate caused it', next: 'why', fx: [-2, -2, -2] },
      { label: 'Own it, and what changed in how you work', next: 'why', fx: [2, 2, 2] },
      { label: 'A vague answer about “time management”', next: 'why', fx: [0, 0, -1] }
    ]
  },
  why: {
    id: 'why', scene: 'wide', caption: 'Round 3 · HR joins',
    say: 'Why this company, and not the one next door?', moods: ['neutral', 'smile', 'neutral'],
    choices: [
      { label: '“Good growth, good culture.”', next: 'relocate', fx: [0, -1, 0] },
      { label: 'Name their product, and the gap in your own skills', next: 'relocate', fx: [2, 2, 2] },
      { label: '“Any company is fine, I just need a job.”', next: 'relocate', fx: [-2, -2, -2] },
      { label: '“You are the biggest, so the safest.”', next: 'relocate', fx: [0, -2, -1] }
    ]
  },
  relocate: {
    id: 'relocate', scene: 'panel', caption: 'Round 3 · the quiet filter',
    say: 'Any posting, any shift, anywhere in India?', moods: ['neutral', 'neutral', 'sceptical'],
    sweat: true,
    choices: [
      { label: '“Only if it is my home city.”', next: 'ask', fx: [-1, -2, -1] },
      { label: '“Yes — and here is what I have already done to be ready.”', next: 'ask', fx: [1, 2, 2] },
      { label: '“I will decide if I get the offer.”', next: 'ask', fx: [0, -1, 0] },
      { label: '“Whatever, as long as the salary is high.”', next: 'ask', fx: [-1, -2, -1] }
    ]
  },
  ask: {
    id: 'ask', scene: 'wide', caption: 'Round 3 · your turn',
    say: 'Any questions for us?', moods: ['smile', 'smile', 'neutral'],
    choices: [
      { label: '“No, I think I’m good.”', next: 'verdict', fx: [-1, -1, -1] },
      { label: '“What does success look like in the first six months?”', next: 'verdict', fx: [2, 2, 2] },
      { label: 'Ask about salary and leave first', next: 'verdict', fx: [0, -1, 0] },
      { label: 'Ask something the PPT already answered', next: 'verdict', fx: [-1, 0, -1] }
    ]
  },
  verdict: { id: 'verdict', scene: 'you', caption: 'Calibration · after you leave', moods: ['neutral', 'neutral', 'neutral'], final: true }
}

const JUDGES = [
  { key: 'tech', name: 'P·ONE', role: 'technical', colour: '#2f5bff' },
  { key: 'hr', name: 'P·TWO', role: 'HR · culture', colour: '#be123c' },
  { key: 'mgr', name: 'P·THREE', role: 'hiring manager', colour: '#0e8c6a' }
]

const verdictFor = (score: number) => (score >= 6 ? 'select' : score >= 2 ? 'maybe' : 'no')

export default function Interview() {
  const [nodeId, setNodeId] = useState('intro')
  const [scores, setScores] = useState<Panel>([0, 0, 0])
  const [history, setHistory] = useState<string[]>([])
  const node = NODES[nodeId]

  const choose = (c: Choice) => {
    setScores((s) => [s[0] + c.fx[0], s[1] + c.fx[1], s[2] + c.fx[2]])
    setHistory((h) => [...h, nodeId])
    setNodeId(c.next)
  }
  const restart = () => { setNodeId('intro'); setScores([0, 0, 0]); setHistory([]) }

  const verdicts = scores.map(verdictFor)
  const selects = verdicts.filter((v) => v === 'select').length
  const overall = selects >= 2 ? 'SELECTED' : verdicts.includes('select') ? 'BORDERLINE' : 'NOT THIS TIME'
  const overallColour = overall === 'SELECTED' ? '#0e8c6a' : overall === 'BORDERLINE' ? '#b8860b' : '#be123c'

  const meter = (v: number) => Math.max(0, Math.min(8, v + 2))

  return (
    <div className="w-full px-3 pb-24 pt-4 sm:px-6 md:pb-10 lg:px-8">
      <div className="mx-auto max-w-[1020px]">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="chip bg-ink text-paper">Scene</span>
            <h1 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">The interview</h1>
            <p className="mt-0.5 text-[12.5px] font-medium text-ink-3">
              Three interviewers, three scorecards. They decide separately — and then argue.
            </p>
          </div>
          <div className="grid gap-1">
            {JUDGES.map((j, i) => (
              <div key={j.key} className="flex items-center gap-2">
                <span className="w-[74px] font-mono text-[8px] font-bold uppercase tracking-wider text-ink-3">{j.name}</span>
                <div className="flex gap-[3px]">
                  {Array.from({ length: 8 }, (_, k) => (
                    <span key={k} className={`h-2.5 w-4 rounded-[2px] border border-ink ${k < meter(scores[i]) ? 'border-ink' : 'border-ink/20'}`} style={{ background: k < meter(scores[i]) ? j.colour : '#eeece4' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div key={node.id} className="comic-panel relative overflow-hidden rounded-2xl border-[3px] border-ink bg-[#fffcf5] shadow-[7px_7px_0_var(--color-ink)]">
          <svg viewBox="0 0 800 450" className="block w-full">
            <Defs />
            <rect width="800" height="450" fill="url(#wall)" />
            <line x1="0" y1="300" x2="800" y2="300" stroke="#12151a" strokeWidth="3" />
            <rect x="0" y="300" width="800" height="150" fill="#e7e2d3" />
            <rect x="0" y="300" width="800" height="150" fill="url(#hatch)" opacity="0.25" />
            <rect x="600" y="40" width="150" height="120" fill="#cfe3ee" stroke="#12151a" strokeWidth="4" />
            <line x1="675" y1="40" x2="675" y2="160" stroke="#12151a" strokeWidth="3" />
            <line x1="600" y1="100" x2="750" y2="100" stroke="#12151a" strokeWidth="3" />
            <polygon points="600,160 750,160 470,450 120,450" fill="url(#light)" opacity="0.5" />
            <rect x="70" y="46" width="110" height="80" fill="#efece1" stroke="#12151a" strokeWidth="3.5" />
            <path d="M 78 118 l 30 -40 l 22 26 l 18 -18 l 24 32 Z" fill="#b9c7a6" stroke="#12151a" strokeWidth="2" />

            {node.scene === 'board' && (
              <g>
                <rect x="180" y="42" width="440" height="200" fill="#fbfbf6" stroke="#12151a" strokeWidth="4" />
                <rect x="180" y="42" width="440" height="200" fill="url(#halftone)" opacity="0.12" />
                <g stroke="#2f5bff" strokeWidth="3" fill="none">
                  <rect x="222" y="76" width="88" height="46" rx="4" />
                  <rect x="352" y="76" width="88" height="46" rx="4" />
                  <rect x="482" y="76" width="88" height="46" rx="4" />
                  <path d="M 310 99 h 42 M 440 99 h 42" />
                </g>
                <g stroke="#be123c" strokeWidth="2.5" fill="none">
                  <path d="M 222 168 h 348" strokeDasharray="6 5" />
                  <circle cx="270" cy="168" r="9" />
                  <circle cx="356" cy="168" r="9" />
                  <circle cx="442" cy="168" r="9" />
                </g>
                <text x="222" y="200" fontSize="11" fontFamily="JetBrains Mono, monospace" fill="#12151a" opacity="0.6">
                  buckets · collisions
                </text>
              </g>
            )}

            {(node.scene === 'wide' || node.scene === 'panel') && (
              <>
                <rect x="150" y="300" width="620" height="20" fill="#c9a227" stroke="#12151a" strokeWidth="3.5" />
                <rect x="150" y="300" width="620" height="20" fill="url(#wood)" opacity="0.6" />
                <rect x="176" y="320" width="20" height="110" fill="#a8871d" stroke="#12151a" strokeWidth="3" />
                <rect x="726" y="320" width="20" height="110" fill="#a8871d" stroke="#12151a" strokeWidth="3" />
                <ellipse cx="470" cy="432" rx="330" ry="20" fill="#12151a" opacity="0.10" />
                <path d="M 300 300 l 10 -40 l 90 0 l 6 40 Z" fill="#8e9aa6" stroke="#12151a" strokeWidth="3" />
                <rect x="296" y="296" width="116" height="8" rx="3" fill="#6f7a86" stroke="#12151a" strokeWidth="2.5" />
                <rect x="470" y="272" width="34" height="30" rx="4" fill="#fffcf5" stroke="#12151a" strokeWidth="3" />
                <path d="M 504 278 q 16 6 0 18" fill="none" stroke="#12151a" strokeWidth="3" />
                <rect x="520" y="290" width="70" height="12" fill="#fffcf5" stroke="#12151a" strokeWidth="2.5" transform="rotate(-4 520 290)" />
              </>
            )}

            {node.scene !== 'you' && (
              <>
                <Person x={392} y={node.scene === 'panel' ? 118 : 128} scale={node.scene === 'panel' ? 0.96 : 0.86} skin="#f0c9a4" skinShade="#e0b189" hair="#2b2b2b" shirt="#2f5bff" mood={node.moods[0]} hairStyle="short" glasses lookX={-2} />
                <Person x={502} y={node.scene === 'panel' ? 110 : 120} scale={node.scene === 'panel' ? 1.02 : 0.92} skin="#d9a273" skinShade="#c78e5f" hair="#12151a" shirt="#be123c" mood={node.moods[1]} hairStyle="bun" lookX={-2} />
                <Person x={614} y={node.scene === 'panel' ? 118 : 128} scale={node.scene === 'panel' ? 0.96 : 0.86} skin="#c98d5c" skinShade="#b47a4b" hair="#3d2b1f" shirt="#0e8c6a" mood={node.moods[2]} hairStyle="bald" beard lookX={-2} />
                {[392, 502, 614].map((cx, i) => (
                  <g key={cx}>
                    <rect x={cx - 34} y="304" width="68" height="14" rx="2" fill="#12151a" opacity="0.85" />
                    <text x={cx} y="314" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#fffcf5" fontFamily="JetBrains Mono, monospace">
                      {JUDGES[i].name}
                    </text>
                  </g>
                ))}
                <g filter="url(#soft)">
                  <ellipse cx="86" cy="392" rx="58" ry="60" fill="#12151a" />
                  <path d="M 18 450 q 68 -54 136 0 Z" fill="#ff4b26" stroke="#12151a" strokeWidth="3" />
                </g>
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

            <g>
              <rect x="0" y="0" width="330" height="34" fill="#12151a" />
              <rect x="330" y="0" width="16" height="34" fill="#f5b01b" />
              <text x="16" y="22" fontSize="11.5" fontWeight="800" fill="#fffcf5" fontFamily="JetBrains Mono, monospace">
                {node.caption.toUpperCase()}
              </text>
            </g>
            <rect width="800" height="450" fill="url(#vignette)" pointerEvents="none" />
          </svg>

          {node.final && (
            <>
              {JUDGES.map((j, i) => {
                const v = verdicts[i]
                const text = v === 'select' ? 'SELECT' : v === 'maybe' ? 'MAYBE' : 'NO'
                const colour = v === 'select' ? '#0e8c6a' : v === 'maybe' ? '#b8860b' : '#be123c'
                return (
                  <div
                    key={j.key}
                    className="comic-stamp pointer-events-none absolute rounded-sm border-[3px] px-2 py-0.5 font-display text-[10px] font-extrabold uppercase tracking-[0.14em] sm:text-[11px]"
                    style={{
                      left: '3.5%',
                      top: `${54 + i * 13}%`,
                      borderColor: colour,
                      color: colour,
                      background: 'rgba(255,252,245,0.86)',
                      animationDelay: `${i * 0.28}s`
                    }}
                  >
                    {j.name} · {text}
                  </div>
                )
              })}
              <div
                className="comic-stamp pointer-events-none absolute bottom-6 right-8 rounded-sm border-4 px-3 py-1 font-display text-base font-extrabold uppercase tracking-[0.16em] sm:text-lg"
                style={{ borderColor: overallColour, color: overallColour, background: 'rgba(255,252,245,0.9)', animationDelay: '0.9s' }}
              >
                {overall}
              </div>
            </>
          )}
        </div>

        <div className="mt-2 flex gap-1.5">
          {history.map((h, i) => (
            <div key={`${h}-${i}`} className="h-8 flex-1 rounded border-2 border-ink/25 bg-[#efece1]" />
          ))}
          <div className="h-8 flex-1 rounded border-2 border-ink bg-c3-soft" />
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {node.choices?.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => choose(c)}
              className="group flex items-center justify-between gap-2 rounded-xl border-2 border-ink bg-card px-3.5 py-2.5 text-left text-[13px] font-bold leading-snug shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <span>{c.label}</span>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
          {node.final && (
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-c1 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-[3px_3px_0_var(--color-ink)]"
            >
              <RotateCcw className="h-3.5 w-3.5" /> walk in again
            </button>
          )}
        </div>

        {node.final && (
          <p className="mt-3 max-w-[70ch] text-[12.5px] font-medium leading-relaxed text-ink-2">
            {overall === 'SELECTED'
              ? 'Two of three scored you above the line, so calibration lists you as a definite offer.'
              : overall === 'BORDERLINE'
                ? 'One yes, and the rest unsure. This is the bucket that gets argued over — trainable weakness or disqualifying.'
                : 'Nobody scored you above the line. The decision takes a minute and nobody disagrees.'}{' '}
            <Link to="/panel" className="font-bold underline underline-offset-4">Practise the written panel →</Link>
          </p>
        )}
      </div>
    </div>
  )
}
