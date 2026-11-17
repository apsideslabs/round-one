import { useMemo, useState } from 'react'
import { RotateCcw, Mic, Video, Circle, AlertTriangle } from 'lucide-react'
import { Person, Defs } from '@/components/comic/Faces'
import { makeState, play, payslip, score, EMPLOYERS, type Archetype, type Move } from '@/lib/negotiation'

const MOVES: Array<{ id: Move; label: string; hint: string; group: 'money' | 'info' | 'terms' | 'end' }> = [
  { id: 'justify', label: 'Cite the published band', hint: 'twice, then it wears out', group: 'money' },
  { id: 'anchor', label: 'Anchor high', hint: 'small, safe', group: 'money' },
  { id: 'competing', label: 'Mention the other offer', hint: 'once only', group: 'money' },
  { id: 'structure', label: 'Shift variable into fixed', hint: 'same CTC, more certainty', group: 'money' },
  { id: 'joining', label: 'Ask for a joining bonus', hint: 'easier to approve', group: 'money' },
  { id: 'relocation', label: 'Ask about relocation', hint: '₹40,000, taxable', group: 'money' },
  { id: 'annexure', label: 'Ask for the annexure', hint: 'their band leaks', group: 'info' },
  { id: 'askBand', label: 'Ask for the grade and band', hint: 'confirms the ceiling', group: 'info' },
  { id: 'askVariable', label: 'Ask what variable paid last year', hint: 'usually less than target', group: 'info' },
  { id: 'askBond', label: 'Ask about the bond', hint: 'most people never do', group: 'info' },
  { id: 'askUrgency', label: 'Ask how many seats are open', hint: 'their real deadline', group: 'info' },
  { id: 'tradeNotice', label: 'Trade notice period for fixed pay', hint: 'costs you later', group: 'terms' },
  { id: 'time', label: 'Ask for a day', hint: 'buys a turn', group: 'terms' },
  { id: 'concede', label: 'Accept', hint: 'ends it', group: 'end' },
  { id: 'walk', label: 'Walk away', hint: 'only at their ceiling', group: 'end' }
]

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

export default function Negotiation() {
  const [arch, setArch] = useState<Archetype>('service')
  const [state, setState] = useState(() => makeState('service'))
  const [minute, setMinute] = useState(4)

  const slip = useMemo(() => payslip(state.offer, state.variablePct), [state.offer, state.variablePct])
  const result = useMemo(() => score(state), [state])
  const lastThem = useMemo(() => [...state.log].reverse().find((l) => l.who === 'them')?.text ?? '', [state.log])
  const gained = state.offer - state.opening
  const move = (m: Move) => { setState((s) => play(s, m)); setMinute((v) => v + 2) }
  const restart = (a: Archetype = arch) => { setArch(a); setState(makeState(a)); setMinute(4) }

  const verdictColour = state.outcome === 'deal' ? '#0e8c6a' : state.outcome === 'lowball' ? '#b8860b' : '#be123c'
  const verdictText = state.outcome === 'deal' ? 'SIGNED' : state.outcome === 'lowball' ? 'LOWBALL' : state.outcome === 'withdrawn' ? 'WITHDRAWN' : 'WALKED'

  return (
    <div className="w-full px-3 pb-24 pt-4 sm:px-6 md:pb-10 lg:px-8">
      <div className="mx-auto max-w-[1120px]">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="chip bg-ink text-paper">Call</span>
            <h1 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Negotiation</h1>
            <p className="mt-0.5 text-[12.5px] font-medium text-ink-3">
              {state.emp.name} · {state.emp.recruiter}, {state.emp.role} · {state.emp.style}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(EMPLOYERS) as Archetype[]).map((a) => (
              <button key={a} type="button" onClick={() => restart(a)}
                className={`rounded-lg border-2 border-ink px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${arch === a ? 'bg-ink text-paper' : 'bg-card'}`}>
                {a}
              </button>
            ))}
            <button type="button" onClick={() => restart()} className="rounded-lg border-2 border-ink bg-card px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider">restart</button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[360px_1fr]">
          {/* call tile */}
          <div>
            <div className="relative overflow-hidden rounded-2xl border-[3px] border-ink bg-[#1a1d22] shadow-[6px_6px_0_var(--color-ink)]">
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white/70">
                  <Circle className="h-2 w-2 fill-[#e5484d] text-[#e5484d]" /> live · 00:{String(minute).padStart(2, '0')} · hd
                </span>
                <span className="flex items-center gap-1.5 text-white/40"><Mic className="h-3 w-3" /><Video className="h-3 w-3" /></span>
              </div>

              <svg viewBox="0 0 360 300" className="block w-full">
                <Defs />
                <rect width="360" height="300" fill="#23272e" />
                <rect width="360" height="300" fill="url(#hatch)" opacity="0.08" />
                <rect x="0" y="250" width="360" height="50" fill="#2e333b" />
                <Person x={180} y={130} scale={1.14} skin="#d9a273" skinShade="#c78e5f" hair="#12151a" shirt="#2f5bff"
                  mood={state.over ? 'smile' : state.mood === 'warm' ? 'smile' : state.mood === 'cold' ? 'sceptical' : 'neutral'}
                  hairStyle="bun" lookX={2} sweat={state.mood === 'cold'} />
                <rect x="256" y="12" width="92" height="64" rx="6" fill="#15181c" stroke="#3a4048" strokeWidth="2" />
                <text x="302" y="48" textAnchor="middle" fontSize="9" fill="#8b939e" fontFamily="JetBrains Mono, monospace">you · cam off</text>
                <rect x="10" y="12" width="150" height="20" rx="4" fill="rgba(0,0,0,0.45)" />
                <text x="18" y="26" fontSize="9" fill="#cfd6df" fontFamily="JetBrains Mono, monospace">{state.emp.recruiter}</text>
                <text x="12" y="288" fontSize="9" fill="#8b939e" fontFamily="JetBrains Mono, monospace">{state.tell}</text>
              </svg>

              <div className="border-t-2 border-[#3a4048] bg-[#15181c] px-3 py-2">
                <p className="text-[12px] font-medium leading-snug text-white/90">{lastThem}</p>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {[['turns', String(Math.max(0, state.turns))], ['leverage', String(Math.round(state.leverage))], ['mood', state.mood]].map(([k, v]) => (
                <div key={k} className="rounded-lg border-2 border-ink bg-card px-2 py-1 text-center">
                  <p className="mono-label">{k}</p>
                  <p className="font-display text-sm font-extrabold capitalize">{v}</p>
                </div>
              ))}
            </div>

            {/* leverage bar with the hidden ceiling */}
            <div className="mt-1.5 rounded-lg border-2 border-ink bg-card px-2 py-1.5">
              <div className="mb-1 flex items-center justify-between">
                <span className="mono-label">her ceiling</span>
                <span className="font-mono text-[9px] font-bold">{state.revealedCeiling ? `₹${state.emp.ceiling.toFixed(1)} L` : '?'}</span>
              </div>
              <div className="relative h-2.5 overflow-hidden rounded-full border-2 border-ink bg-[#eeece4]">
                <div className="h-full transition-[width] duration-300" style={{ width: `${Math.min(100, (state.offer / state.emp.ceiling) * 100)}%`, background: state.offer >= state.emp.ceiling - 0.1 ? '#0e8c6a' : '#f5b01b' }} />
              </div>
            </div>
          </div>

          {/* sheet */}
          <div className="rounded-2xl border-[3px] border-ink bg-[#fffcf5] p-3 shadow-[6px_6px_0_var(--color-ink)]">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="mono-label">offer sheet · grade G{state.grade} · {state.emp.name}</p>
                <p className="text-[11px] font-medium text-ink-3">her pen marks appear as the call goes on</p>
              </div>
              {state.over && (
                <div className="comic-stamp rounded-sm border-4 px-2.5 py-0.5 font-display text-sm font-extrabold uppercase tracking-[0.16em]"
                  style={{ borderColor: verdictColour, color: verdictColour, background: 'rgba(255,252,245,0.9)' }}>{verdictText}</div>
              )}
            </div>

            <div className="grid gap-2.5">
              {[
                {
                  head: 'A · fixed pay',
                  rows: [
                    ['annual ctc', `₹${state.offer.toFixed(1)} L`],
                    ['fixed gross', inr(slip.fixedGross)],
                    ['basic', inr(slip.basic)],
                    ['hra', inr(slip.hra)],
                    ['special allowance', inr(slip.special)]
                  ]
                },
                {
                  head: 'B · variable',
                  rows: [
                    ['target variable', `${inr(slip.variable)} · ${state.variablePct}%`],
                    ['paid last year', `${state.emp.variablePaid}% of target`]
                  ]
                },
                {
                  head: 'C · one-time',
                  rows: [
                    ['joining bonus', state.joining ? inr(state.joining) : '—'],
                    ['relocation', state.relocation ? inr(state.relocation) : '—']
                  ]
                },
                {
                  head: 'D · conditions',
                  rows: [
                    ['bond', state.bond ? `${state.bond} year${state.bond > 1 ? 's' : ''}` : 'none'],
                    ['notice period', `${state.notice} months`],
                    ['probation', `${state.emp.probation} months`]
                  ]
                }
              ].map((sec) => (
                <div key={sec.head}>
                  <p className="mb-0.5 font-mono text-[8.5px] font-bold uppercase tracking-[0.16em] text-ink-3/80">{sec.head}</p>
                  <dl className="grid gap-0">
                    {sec.rows.map(([k, v]) => (
                      <div key={k} className="flex items-baseline justify-between gap-3 border-b border-dotted border-line/80 py-0.5">
                        <dt className="font-mono text-[9px] uppercase tracking-wide text-ink-3">{k}</dt>
                        <dd className="font-mono text-[11px] font-bold tabular-nums">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-3 rounded-lg border-2 border-ink bg-c2-soft px-2 py-1">
                <span className="font-mono text-[9px] font-bold uppercase tracking-wide">monthly in hand</span>
                <span className="font-display text-base font-extrabold tabular-nums text-ok">{inr(slip.inHandMonthly)}</span>
              </div>
            </div>

            {/* her notes */}
            <div className="mt-2 grid gap-1.5">
              {[
                state.revealedCeiling && `grade closes ${state.emp.ceiling.toFixed(1)} — do not say that again`,
                state.usedCompeting && 'said another offer. twice? ask for the letter',
                state.mood === 'cold' && 'underlined: STANDARD BAND. stop pushing',
                state.usedUrgency && 'told them Thursday. why did I say that',
                state.bond > 0 && 'bond page — nobody reads the bond page'
              ].filter(Boolean).slice(0, 3).map((note, i) => (
                <p key={i} className="w-fit max-w-[92%] rounded-sm border-2 border-ink/30 bg-[#fdf3c8] px-2 py-1 font-mono text-[10px] font-bold text-ink-2 shadow-[2px_2px_0_rgba(18,21,26,0.12)]"
                  style={{ marginLeft: `${i * 14}px`, transform: `rotate(${i % 2 ? 0.7 : -0.6}deg)` }}>{note}</p>
              ))}
            </div>

            {state.over && (
              <div className="mt-2 grid gap-2 rounded-lg border-2 border-ink bg-[#f7f5ee] p-2.5">
                <div className="grid grid-cols-3 gap-2">
                  {[['cash this year', inr(result.cash)], ['what terms cost', `−${inr(result.termsCost)}`], ['net', inr(result.net)]].map(([k, v]) => (
                    <div key={k}>
                      <p className="mono-label">{k}</p>
                      <p className={`font-display text-sm font-extrabold tabular-nums ${k === 'net' ? (result.net > 0 ? 'text-ok' : 'text-bad') : ''}`}>{v}</p>
                    </div>
                  ))}
                </div>
                {result.notes.length > 0 && (
                  <ul className="grid gap-0.5">
                    {result.notes.map((n) => (
                      <li key={n} className="flex items-start gap-1 text-[11px] font-medium text-ink-2">
                        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-[#b8860b]" /> {n}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => restart()} className="inline-flex items-center gap-1.5 rounded-lg border-2 border-ink bg-c1 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_var(--color-ink)]">
                    <RotateCcw className="h-3 w-3" /> call again
                  </button>
                  <span className="text-[11px] font-medium text-ink-3">
                    {state.outcome === 'deal' ? `she moved ₹${Math.round(gained * 100000).toLocaleString('en-IN')} over her opening` : state.outcome === 'lowball' ? 'you took the first number' : state.outcome === 'withdrawn' ? 'she pulled the offer' : 'you walked'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* moves */}
        {!state.over && (
          <div className="mt-3 rounded-xl border-2 border-ink bg-card p-2.5 shadow-[3px_3px_0_var(--color-ink)]">
            <p className="mono-label mb-1.5">what you say next</p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {(['money', 'info', 'terms', 'end'] as const).map((group) => (
                <div key={group}>
                  <p className="mb-1 font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-ink-3/70">
                    {group === 'info' ? 'information' : group === 'end' ? 'endings' : group}
                  </p>
                  <div className="grid gap-1">
                    {MOVES.filter((m) => m.group === group).map((m) => (
                      <button key={m.id} type="button" onClick={() => move(m.id)}
                        className={`rounded-lg border-2 border-ink px-2 py-1 text-left transition-transform hover:-translate-y-0.5 active:translate-y-0.5 ${group === 'end' ? 'bg-[#f4f2ea]' : group === 'info' ? 'bg-c3-soft' : group === 'terms' ? 'bg-[#efece1]' : 'bg-paper'}`}>
                        <span className="block text-[11.5px] font-bold leading-tight">{m.label}</span>
                        <span className="block font-mono text-[7.5px] uppercase tracking-wider text-ink-3">{m.hint}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* transcript */}
        <div className="mt-3 rounded-xl border-2 border-ink bg-card p-2.5 shadow-[3px_3px_0_var(--color-ink)]">
          <p className="mono-label mb-1.5">transcript · {state.log.length} lines</p>
          <ul className="grid max-h-[170px] gap-1 overflow-auto">
            {state.log.slice(-9).map((l, i) => (
              <li key={i} className="grid grid-cols-[44px_1fr] gap-2 text-[11.5px] font-medium leading-snug">
                <span className={`font-mono text-[8.5px] font-bold uppercase ${l.who === 'you' ? 'text-ink-3' : 'text-ink-3/70'}`}>{l.who}</span>
                <span className={l.who === 'you' ? 'text-ink' : 'text-ink-2'}>{l.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
