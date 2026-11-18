import { useEffect, useMemo, useState } from 'react'
import { RotateCcw, Users, Clock } from 'lucide-react'
import { Person, Defs, type Mood } from '@/components/comic/Faces'
import { makeGD, act, step, verdict, SPEAKERS, TOPICS, type Action, type GDState } from '@/lib/gd'

const ACTIONS: Array<{ id: Action; label: string; hint: string; group: 'enter' | 'add' | 'lead' | 'risk' }> = [
  { id: 'open', label: 'Open the discussion', hint: 'only free floor there is', group: 'enter' },
  { id: 'connector', label: '“Building on that…”', hint: 'name them, extend it', group: 'enter' },
  { id: 'structure', label: 'Propose a structure', hint: 'separates two arguments', group: 'lead' },
  { id: 'fact', label: 'Put a number on the table', hint: 'three facts available', group: 'add' },
  { id: 'include', label: 'Bring Priya in', hint: 'the quiet one', group: 'lead' },
  { id: 'summarise', label: 'Summarise the group', hint: 'earned after minute 8', group: 'lead' },
  { id: 'interrupt', label: 'Cut someone off', hint: 'costs listening and teamwork', group: 'risk' },
  { id: 'wait', label: 'Stay quiet this turn', hint: 'no score, no damage', group: 'risk' }
]

const MOODS: Record<string, Mood> = {
  dominator: 'frown', silent: 'neutral', fact: 'smile', peacemaker: 'smile', summariser: 'neutral'
}

export default function GroupDiscussion() {
  const [topicIdx, setTopicIdx] = useState(() => Math.floor(Math.random() * TOPICS.length))
  const [state, setState] = useState<GDState>(() => makeGD(topicIdx))
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running || state.over) return
    const id = window.setInterval(() => setState((s) => step(s)), 1400)
    return () => window.clearInterval(id)
  }, [running, state.over])

  const v = useMemo(() => verdict(state), [state])
  const airtime = Math.min(100, state.airtime * 8)
  const floorName = state.floor ? SPEAKERS.find((s) => s.id === state.floor)?.name : null

  const move = (a: Action) => { setState((s) => act(s, a)); setRunning(true) }
  const restart = () => { const t = Math.floor(Math.random() * TOPICS.length); setTopicIdx(t); setState(makeGD(t)); setRunning(false) }

  return (
    <div className="w-full px-3 pb-20 pt-3 sm:px-5 md:pb-6 lg:px-6">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-2">
            <h1 className="font-display text-xl font-extrabold tracking-tight">Group discussion</h1>
            <span className="text-[11.5px] font-medium text-ink-3">{state.topic.title}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 rounded-md border-2 border-ink bg-card px-1.5 py-0.5 font-mono text-[9px] font-bold">
              <Clock className="h-2.5 w-2.5" /> {Math.min(12, state.minute).toFixed(1)} / 12 min
            </span>
            <button type="button" onClick={restart} className="rounded-md border-2 border-ink bg-card px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-wider">new topic</button>
          </div>
        </div>

        <div className="grid gap-2.5 lg:grid-cols-[1fr_360px] lg:items-start">
          {/* the table */}
          <div className="grid gap-2">
            <div className="relative overflow-hidden rounded-xl border-[3px] border-ink bg-[#fffcf5] shadow-[5px_5px_0_var(--color-ink)]">
              <svg viewBox="0 0 720 320" className="block w-full max-h-[260px] sm:max-h-none">
                <Defs />
                <rect width="720" height="320" fill="url(#wall)" />
                <rect x="0" y="215" width="720" height="105" fill="#e7e2d3" />
                <rect x="0" y="215" width="720" height="105" fill="url(#hatch)" opacity="0.22" />
                <ellipse cx="360" cy="232" rx="270" ry="60" fill="#c9a227" stroke="#12151a" strokeWidth="4" />
                <ellipse cx="360" cy="226" rx="232" ry="46" fill="#e3d7ae" opacity="0.55" />

                {SPEAKERS.slice(0, 3).map((sp, i) => (
                  <g key={sp.id}>
                    <Person x={200 + i * 160} y={92} scale={0.72} skin={['#d9a273', '#f0c9a4', '#c98d5c'][i]}
                      skinShade="#c78e5f" hair="#12151a" shirt={sp.colour} mood={MOODS[sp.archetype]} hairStyle={['short', 'bun', 'curly'][i] as 'short' | 'bun' | 'curly'} lookX={2} />
                    <text x={200 + i * 160} y={196} textAnchor="middle" fontSize="9" fontWeight="800" fill="#12151a" fontFamily="JetBrains Mono, monospace">{sp.name.toUpperCase()}</text>
                  </g>
                ))}
                {SPEAKERS.slice(3, 5).map((sp, i) => (
                  <g key={sp.id}>
                    <ellipse cx={250 + i * 220} cy={300} rx="40" ry="34" fill="#12151a" />
                    <path d={`M ${210 + i * 220} 320 q 40 -40 80 0 Z`} fill={sp.colour} stroke="#12151a" strokeWidth="3" />
                    <text x={250 + i * 220} y={292} textAnchor="middle" fontSize="9" fontWeight="800" fill="#fffcf5" fontFamily="JetBrains Mono, monospace">{sp.name.toUpperCase()}</text>
                  </g>
                ))}
                <g>
                  <ellipse cx="360" cy="292" rx="46" ry="38" fill="#ff4b26" stroke="#12151a" strokeWidth="3" />
                  <text x="360" y="296" textAnchor="middle" fontSize="10" fontWeight="800" fill="#fffcf5" fontFamily="JetBrains Mono, monospace">YOU</text>
                </g>

                {/* who holds the floor */}
                <g>
                  <rect x="0" y="0" width={floorName ? 220 : 150} height="28" fill={floorName ? '#12151a' : '#0e8c6a'} />
                  <rect x={floorName ? 220 : 150} y="0" width="10" height="28" fill="#f5b01b" />
                  <text x="12" y="19" fontSize="10.5" fontWeight="800" fill="#fffcf5" fontFamily="JetBrains Mono, monospace">
                    {floorName ? `${floorName.toUpperCase()} HAS THE FLOOR` : 'FLOOR IS FREE'}
                  </text>
                </g>
                <rect width="720" height="320" fill="url(#vignette)" pointerEvents="none" />
              </svg>
            </div>

            {/* live transcript */}
            <div className="rounded-xl border-2 border-ink bg-card p-2 shadow-[3px_3px_0_var(--color-ink)]">
              <div className="mb-1 flex items-center justify-between">
                <p className="mono-label">what is being said</p>
                <span className="flex items-center gap-1 font-mono text-[8px] font-bold uppercase text-ink-3">
                  <Users className="h-2.5 w-2.5" /> your airtime {Math.round(airtime)}%
                </span>
              </div>
              <div className="mb-1.5 h-1.5 overflow-hidden rounded-full border border-ink bg-[#eeece4]">
                <div className="h-full bg-c1" style={{ width: `${airtime}%` }} />
              </div>
              <ul className="grid max-h-[132px] gap-1 overflow-auto">
                {state.log.slice(-6).map((l, i) => (
                  <li key={i} className={`grid grid-cols-[54px_1fr] gap-1.5 text-[11px] font-medium leading-snug ${l.kind === 'you' ? 'rounded bg-c1-soft px-1 py-0.5' : ''}`}>
                    <span className="font-mono text-[8px] font-bold uppercase text-ink-3">{l.who}</span>
                    <span className={l.kind === 'you' ? 'font-bold text-ink' : 'text-ink-2'}>{l.text}</span>
                  </li>
                ))}
                {state.log.length === 0 && <li className="text-[11px] text-ink-3">Nobody has spoken. The floor is free — the first fifteen seconds are yours if you want them.</li>}
              </ul>
            </div>
          </div>

          {/* your moves + scorecard */}
          <div className="grid gap-2">
            {!state.over ? (
              <div className="rounded-xl border-2 border-ink bg-card p-2 shadow-[3px_3px_0_var(--color-ink)]">
                <p className="mono-label mb-1">what you do</p>
                <div className="grid gap-1">
                  {ACTIONS.map((a) => (
                    <button key={a.id} type="button" onClick={() => move(a.id)}
                      className={`flex items-baseline justify-between gap-2 rounded border-2 border-ink px-2 py-1 text-left transition-transform hover:-translate-y-px active:translate-y-px ${a.group === 'risk' ? 'bg-[#f4f2ea]' : a.group === 'lead' ? 'bg-c3-soft' : 'bg-paper'}`}>
                      <span className="text-[11px] font-bold leading-tight">{a.label}</span>
                      <span className="shrink-0 font-mono text-[7px] uppercase tracking-wider text-ink-3">{a.hint}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-ink bg-card p-2.5 shadow-[3px_3px_0_var(--color-ink)]">
                <div className="mb-1 flex items-baseline justify-between">
                  <p className="mono-label">evaluator sheet</p>
                  <span className={`font-display text-sm font-extrabold ${v.advance ? 'text-ok' : 'text-bad'}`}>{v.total} / {v.outOf}</span>
                </div>
                <div className="grid gap-1">
                  {(Object.keys(state.scores) as Array<keyof typeof state.scores>).map((k) => (
                    <div key={k} className="grid grid-cols-[86px_1fr_26px] items-center gap-1.5">
                      <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-ink-3">{k}</span>
                      <div className="h-2 overflow-hidden rounded border border-ink bg-[#eeece4]">
                        <div className="h-full" style={{ width: `${(state.scores[k] / 5) * 100}%`, background: state.scores[k] >= 3.5 ? '#0e8c6a' : state.scores[k] >= 2.5 ? '#f5b01b' : '#be123c' }} />
                      </div>
                      <span className="font-mono text-[9px] font-bold tabular-nums">{state.scores[k].toFixed(1)}</span>
                    </div>
                  ))}
                </div>
                <p className={`mt-1.5 rounded border-2 border-ink px-2 py-1 text-center font-mono text-[9px] font-bold uppercase ${v.advance ? 'bg-c2-soft' : 'bg-c1-soft'}`}>
                  {v.advance ? 'advance to interview' : 'eliminated at this round'}
                </p>
                {v.notes.length > 0 && (
                  <ul className="mt-1.5 grid gap-0.5">
                    {v.notes.slice(0, 4).map((n) => (
                      <li key={n} className="text-[10.5px] font-medium leading-snug text-ink-2">· {n}</li>
                    ))}
                  </ul>
                )}
                <button type="button" onClick={restart} className="mt-2 inline-flex items-center gap-1 rounded-lg border-2 border-ink bg-c1 px-2.5 py-1 font-mono text-[8.5px] font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_var(--color-ink)]">
                  <RotateCcw className="h-2.5 w-2.5" /> another topic
                </button>
              </div>
            )}

            <div className="rounded-xl border-2 border-ink bg-card p-2 shadow-[3px_3px_0_var(--color-ink)]">
              <p className="mono-label mb-1">your record</p>
              <div className="grid grid-cols-2 gap-1">
                {[
                  ['entries', state.entries],
                  ['built on others', state.builds],
                  ['interruptions', state.interruptions],
                  ['numbers used', state.factsUsed]
                ].map(([k, val]) => (
                  <div key={String(k)} className="flex items-baseline justify-between border-b border-line/60 pb-0.5">
                    <span className="font-mono text-[8px] uppercase tracking-wide text-ink-3">{k}</span>
                    <span className="font-mono text-[10px] font-bold tabular-nums">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
