import { useMemo, useState } from 'react'
import { RotateCcw, Mic, Video, Circle } from 'lucide-react'
import { Person, Defs } from '@/components/comic/Faces'
import { makeState, play, payslip, EMPLOYERS, type Archetype, type Move } from '@/lib/negotiation'

const MOVES: Array<{ id: Move; label: string; hint: string; group: 'money' | 'info' | 'end' }> = [
  { id: 'justify', label: 'Cite the published band', hint: 'twice, then it wears out', group: 'money' },
  { id: 'anchor', label: 'Anchor high', hint: 'small, safe', group: 'money' },
  { id: 'competing', label: 'Mention the other offer', hint: 'once only', group: 'money' },
  { id: 'structure', label: 'Shift variable into fixed', hint: 'same money, more certainty', group: 'money' },
  { id: 'joining', label: 'Ask for a joining bonus', hint: 'easier to approve', group: 'money' },
  { id: 'relocation', label: 'Ask about relocation', hint: '₹40,000, once', group: 'money' },
  { id: 'annexure', label: 'Ask for the annexure', hint: 'their band leaks', group: 'info' },
  { id: 'time', label: 'Ask for a day', hint: 'buys a turn', group: 'info' },
  { id: 'concede', label: 'Accept', hint: 'ends it', group: 'end' },
  { id: 'walk', label: 'Walk away', hint: 'only at their ceiling', group: 'end' }
]

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

export default function Negotiation() {
  const [arch, setArch] = useState<Archetype>('service')
  const [state, setState] = useState(() => makeState('service'))
  const [minute, setMinute] = useState(4)

  const slip = useMemo(() => payslip(state.offer, state.variablePct, state.joining), [state.offer, state.variablePct, state.joining])
  const lastThem = useMemo(() => [...state.log].reverse().find((l) => l.who === 'them')?.text ?? '', [state.log])
  const gained = state.offer - state.opening
  const move = (m: Move) => { setState((s) => play(s, m)); setMinute((v) => v + 2) }
  const restart = (a: Archetype = arch) => { setArch(a); setState(makeState(a)); setMinute(4) }

  const verdictColour = state.outcome === 'deal' ? '#0e8c6a' : state.outcome === 'lowball' ? '#b8860b' : '#be123c'
  const verdictText = state.outcome === 'deal' ? 'DEAL' : state.outcome === 'lowball' ? 'LOWBALL' : state.outcome === 'withdrawn' ? 'WITHDRAWN' : 'WALKED'

  const lines: Array<[string, string, string | null]> = [
    ['annual CTC', `₹${state.offer.toFixed(1)} L`, null],
    ['fixed gross', inr(slip.fixedGross), null],
    ['variable', inr(slip.variable), `${state.variablePct}% · not guaranteed`],
    ['basic', inr(slip.basic), 'drives PF and gratuity'],
    ['HRA', inr(slip.hra), null],
    ['special allowance', inr(slip.special), null],
    ['joining bonus', state.joining ? inr(state.joining) : '—', state.joining ? '12-month clawback' : 'not discussed'],
    ['relocation', state.relocation ? inr(state.relocation) : '—', state.relocation ? 'taxable' : 'not discussed'],
    ['monthly in hand', inr(slip.inHandMonthly), 'guaranteed']
  ]

  return (
    <div className="w-full px-3 pb-24 pt-4 sm:px-6 md:pb-10 lg:px-8">
      <div className="mx-auto max-w-[1080px]">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="chip bg-ink text-paper">Call</span>
            <h1 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Negotiation</h1>
            <p className="mt-0.5 text-[12.5px] font-medium text-ink-3">{state.emp.name} · {state.emp.style}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {(Object.keys(EMPLOYERS) as Archetype[]).map((a) => (
              <button key={a} type="button" onClick={() => restart(a)}
                className={`rounded-lg border-2 border-ink px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider ${arch === a ? 'bg-ink text-paper' : 'bg-card'}`}>
                {a}
              </button>
            ))}
            <button type="button" onClick={() => restart()} className="rounded-lg border-2 border-ink bg-card px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider">
              restart
            </button>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[380px_1fr]">
          {/* the call */}
          <div>
            <div className="relative overflow-hidden rounded-2xl border-[3px] border-ink bg-[#1a1d22] shadow-[6px_6px_0_var(--color-ink)]">
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white/70">
                  <Circle className="h-2 w-2 fill-[#e5484d] text-[#e5484d]" /> live · 00:{String(minute).padStart(2, '0')}
                </span>
                <span className="flex items-center gap-1.5 text-white/40">
                  <Mic className="h-3 w-3" /> <Video className="h-3 w-3" />
                </span>
              </div>

              <svg viewBox="0 0 380 300" className="block w-full">
                <Defs />
                <rect width="380" height="300" fill="#23272e" />
                <rect x="0" y="0" width="380" height="300" fill="url(#hatch)" opacity="0.08" />
                {/* desk edge, low in frame */}
                <rect x="0" y="248" width="380" height="52" fill="#2e333b" />
                <Person x={190} y={132} scale={1.18} skin="#d9a273" skinShade="#c78e5f" hair="#12151a" shirt="#2f5bff"
                  mood={state.over ? 'smile' : state.mood === 'warm' ? 'smile' : state.mood === 'cold' ? 'sceptical' : 'neutral'}
                  hairStyle="bun" lookX={2} sweat={state.mood === 'cold'} />

                {/* self view, small, camera off */}
                <g>
                  <rect x="272" y="14" width="94" height="66" rx="6" fill="#15181c" stroke="#3a4048" strokeWidth="2" />
                  <text x="319" y="52" textAnchor="middle" fontSize="9" fill="#8b939e" fontFamily="JetBrains Mono, monospace">you · cam off</text>
                </g>

                <text x="16" y="286" fontSize="9" fill="#8b939e" fontFamily="JetBrains Mono, monospace">
                  {state.tell}
                </text>
              </svg>

              <div className="border-t-2 border-[#3a4048] bg-[#15181c] px-3 py-2">
                <p className="text-[12px] font-medium leading-snug text-white/90">
                  {lastThem}
                </p>
              </div>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {[
                ['turns', String(Math.max(0, state.turns))],
                ['leverage', String(Math.round(state.leverage))],
                ['mood', state.mood]
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border-2 border-ink bg-card px-2 py-1 text-center">
                  <p className="mono-label">{k}</p>
                  <p className="font-display text-sm font-extrabold capitalize">{v}</p>
                </div>
              ))}
            </div>

            {state.revealedCeiling && (
              <p className="mt-1.5 rounded-lg border-2 border-ink bg-c3-soft px-2 py-1 text-[10.5px] font-bold">
                she let slip: the grade closes near ₹{state.emp.ceiling.toFixed(1)} L
              </p>
            )}
          </div>

          {/* the sheet on the desk */}
          <div className="relative rounded-2xl border-[3px] border-ink bg-[#fffcf5] p-3 shadow-[6px_6px_0_var(--color-ink)]">
            <div className="mb-2 flex items-start justify-between">
              <div>
                <p className="mono-label">offer sheet · {state.emp.name}</p>
                <p className="text-[11px] font-medium text-ink-3">pen marks appear as the call goes on</p>
              </div>
            {state.over && (
                <div className="comic-stamp rounded-sm border-4 px-2.5 py-0.5 font-display text-sm font-extrabold uppercase tracking-[0.16em]"
                  style={{ borderColor: verdictColour, color: verdictColour, background: 'rgba(255,252,245,0.9)' }}>
                  {verdictText}
                </div>
              )}
            </div>

            <dl className="grid gap-0">
              {lines.map(([k, v, note], i) => (
                <div key={k} className={`grid grid-cols-[1fr_auto] items-baseline gap-2 border-b border-line/70 py-1 ${i === lines.length - 1 ? 'border-0 pt-2' : ''}`}>
                  <dt className="flex items-baseline gap-1.5 font-mono text-[9.5px] uppercase tracking-wide text-ink-3">
                    {k}
                    {note && <span className="font-mono text-[8px] normal-case tracking-normal text-ink-3/70">{note}</span>}
                  </dt>
                  <dd className={`font-mono text-[12px] font-bold tabular-nums ${i === lines.length - 1 ? 'text-[15px] text-ok' : ''} ${v === '—' ? 'text-ink-3/50' : ''}`}>{v}</dd>
                </div>
              ))}
            </dl>

            {/* her margin notes — the flaws show up in what she scribbles */}
            <div className="mt-2 grid gap-1.5">
              {[
                state.revealedCeiling && 'grade closes 7.2 — do not say that again',
                state.usedCompeting && 'said another offer. twice? ask for the letter',
                state.mood === 'cold' && 'underlined: STANDARD BAND. stop pushing',
                state.usedJustify > 0 && 'check band sheet before next call',
                state.joining > 0 && 'joining bonus — finance will ask why',
                state.turns <= 2 && 'review Thursday. close this.'
              ].filter(Boolean).slice(0, 3).map((note, i) => (
                <p key={i} className="w-fit max-w-[92%] rotate-[-0.6deg] rounded-sm border-2 border-ink/30 bg-[#fdf3c8] px-2 py-1 font-mono text-[10px] font-bold text-ink-2 shadow-[2px_2px_0_rgba(18,21,26,0.12)]"
                  style={{ marginLeft: `${i * 14}px`, transform: `rotate(${i % 2 ? 0.7 : -0.6}deg)` }}>
                  {note}
                </p>
              ))}
            </div>

            {state.over && (
              <div className="mt-2 grid gap-2">
                <p className="text-[12px] font-medium leading-relaxed text-ink-2">
                  {state.outcome === 'deal'
                    ? `She moved ₹${Math.round(gained * 100000).toLocaleString('en-IN')} over her opening number — and she was not going to volunteer it.`
                    : state.outcome === 'lowball'
                      ? 'You took the first number. It was designed to be taken.'
                      : state.outcome === 'withdrawn'
                        ? 'She pulled the offer. The second competing offer was a bluff she called.'
                        : 'You walked before she reached her ceiling. Sometimes right, always final.'}
                </p>
                <div>
                  <p className="mono-label mb-1">what you never tried</p>
                  <ul className="grid gap-0.5 text-[11.5px] font-medium text-ink-3">
                    {!state.usedAnnexure && <li>· Asking for the annexure — it leaks their band for free.</li>}
                    {state.usedJustify === 0 && <li>· Citing the published band before naming a number.</li>}
                    {!state.usedCompeting && <li>· One honest competing offer, used once.</li>}
                    {state.joining === 0 && <li>· A joining bonus, which is easier to approve than a band.</li>}
                    {gained < 0.8 && <li>· Not conceding inside the first three turns.</li>}
                  </ul>
                </div>
                <button type="button" onClick={() => restart()} className="inline-flex w-fit items-center gap-1.5 rounded-lg border-2 border-ink bg-c1 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_var(--color-ink)]">
                  <RotateCcw className="h-3 w-3" /> call again
                </button>
              </div>
            )}
          </div>
        </div>

        {/* the moves, as a toolbar under the whole desk */}
        {!state.over && (
          <div className="mt-3 rounded-xl border-2 border-ink bg-card p-2.5 shadow-[3px_3px_0_var(--color-ink)]">
            <p className="mono-label mb-1.5">what you say next</p>
            <div className="grid gap-2 md:grid-cols-3">
              {(['money', 'info', 'end'] as const).map((group) => (
                <div key={group}>
                  <p className="mb-1 font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-ink-3/70">
                    {group === 'money' ? 'money' : group === 'info' ? 'information' : 'endings'}
                  </p>
                  <div className="grid gap-1">
                    {MOVES.filter((m) => m.group === group).map((m) => (
                      <button key={m.id} type="button" onClick={() => move(m.id)}
                        className={`flex items-baseline justify-between gap-2 rounded-lg border-2 border-ink px-2 py-1 text-left transition-transform hover:-translate-y-0.5 active:translate-y-0.5 ${group === 'end' ? 'bg-[#f4f2ea]' : group === 'info' ? 'bg-c3-soft' : 'bg-paper'}`}>
                        <span className="text-[11.5px] font-bold leading-tight">{m.label}</span>
                        <span className="shrink-0 font-mono text-[7.5px] uppercase tracking-wider text-ink-3">{m.hint}</span>
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
          <ul className="grid max-h-[160px] gap-1 overflow-auto">
            {state.log.slice(-8).map((l, i) => (
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
