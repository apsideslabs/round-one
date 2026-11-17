import { useMemo, useState } from 'react'
import { RotateCcw, FileText, Info } from 'lucide-react'
import { Person, Bubble, Defs } from '@/components/comic/Faces'
import { makeState, play, payslip, EMPLOYERS, type Archetype, type Move } from '@/lib/negotiation'

const MOVES: Array<{ id: Move; label: string; hint: string; group: 'money' | 'info' | 'end' }> = [
  { id: 'justify', label: 'Justify with the published band', hint: 'works twice, then they tire of it', group: 'money' },
  { id: 'anchor', label: 'Anchor high, politely', hint: 'small, steady, safe', group: 'money' },
  { id: 'competing', label: 'Mention the other offer', hint: 'once only — twice backfires', group: 'money' },
  { id: 'structure', label: 'Move variable into fixed', hint: 'same CTC, more certainty', group: 'money' },
  { id: 'joining', label: 'Ask for a joining bonus', hint: 'one-time cash, clawback attached', group: 'money' },
  { id: 'relocation', label: 'Ask about relocation', hint: '₹40,000, once', group: 'money' },
  { id: 'annexure', label: 'Ask for the full annexure', hint: 'reveals their band', group: 'info' },
  { id: 'time', label: 'Ask for a day to decide', hint: 'buys a turn, costs a little', group: 'info' },
  { id: 'concede', label: 'Accept what is on the table', hint: 'ends it here', group: 'end' },
  { id: 'walk', label: 'Walk away', hint: 'only works at their ceiling', group: 'end' }
]

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

export default function Negotiation() {
  const [arch, setArch] = useState<Archetype>('service')
  const [state, setState] = useState(() => makeState('service'))
  const [showLog, setShowLog] = useState(false)

  const lastThem = useMemo(() => [...state.log].reverse().find((l) => l.who === 'them')?.text ?? '', [state.log])
  const slip = useMemo(() => payslip(state.offer, state.variablePct, state.joining), [state.offer, state.variablePct, state.joining])
  const gained = state.offer - state.opening
  const mood = state.mood

  const move = (m: Move) => setState((s) => play(s, m))
  const restart = (a: Archetype = arch) => { setArch(a); setState(makeState(a)) }

  const verdictColour = state.outcome === 'deal' ? '#0e8c6a' : state.outcome === 'lowball' ? '#b8860b' : '#be123c'
  const verdictText = state.outcome === 'deal' ? 'DEAL' : state.outcome === 'lowball' ? 'LOWBALL' : state.outcome === 'withdrawn' ? 'WITHDRAWN' : 'WALKED'

  return (
    <div className="w-full px-3 pb-24 pt-4 sm:px-6 md:pb-10 lg:px-8">
      <div className="mx-auto max-w-[1020px]">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="chip bg-ink text-paper">Tool</span>
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

        <div className="grid gap-3 lg:grid-cols-[1fr_320px]">
          {/* scene */}
          <div>
            <div className="comic-panel relative overflow-hidden rounded-2xl border-[3px] border-ink bg-[#fffcf5] shadow-[7px_7px_0_var(--color-ink)]">
              <svg viewBox="0 0 720 330" className="block w-full">
                <Defs />
                <rect width="720" height="330" fill="url(#wall)" />
                <rect x="0" y="230" width="720" height="100" fill="#e7e2d3" />
                <rect x="0" y="230" width="720" height="100" fill="url(#hatch)" opacity="0.25" />
                <rect x="70" y="230" width="580" height="16" fill="#c9a227" stroke="#12151a" strokeWidth="3" />
                <rect x="70" y="230" width="580" height="16" fill="url(#wood)" opacity="0.55" />
                <rect x="92" y="246" width="16" height="80" fill="#a8871d" stroke="#12151a" strokeWidth="2.5" />
                <rect x="612" y="246" width="16" height="80" fill="#a8871d" stroke="#12151a" strokeWidth="2.5" />

                <Person x={210} y={104} scale={0.74} skin="#f0c9a4" skinShade="#e0b189" hair="#2b2b2b" shirt="#ff4b26"
                  mood={state.over ? 'smile' : state.leverage < 30 ? 'frown' : 'neutral'} hairStyle="short" sweat={state.leverage < 30} />
                <Person x={512} y={104} scale={0.74} skin="#d9a273" skinShade="#c78e5f" hair="#12151a" shirt="#2f5bff"
                  mood={mood === 'warm' ? 'smile' : mood === 'cold' ? 'sceptical' : 'neutral'} hairStyle="bun" lookX={2} />

                <Bubble x={512} y={16} text={lastThem.length > 62 ? `${lastThem.slice(0, 60)}…` : lastThem} />

                <g>
                  <rect x="0" y="0" width="260" height="30" fill="#12151a" />
                  <rect x="260" y="0" width="12" height="30" fill="#f5b01b" />
                  <text x="12" y="20" fontSize="10.5" fontWeight="800" fill="#fffcf5" fontFamily="JetBrains Mono, monospace">
                    {`TURNS ${Math.max(0, state.turns)} · LEVERAGE ${Math.round(state.leverage)} · MOOD ${mood.toUpperCase()}`}
                  </text>
                </g>
                <rect width="720" height="330" fill="url(#vignette)" pointerEvents="none" />
              </svg>

              {state.over && (
                <div className="comic-stamp pointer-events-none absolute right-6 top-10 rounded-sm border-4 px-3 py-1 font-display text-lg font-extrabold uppercase tracking-[0.16em]"
                  style={{ borderColor: verdictColour, color: verdictColour, background: 'rgba(255,252,245,0.9)' }}>
                  {verdictText}
                </div>
              )}
            </div>

            {/* numbers */}
            <div className="mt-2 grid gap-1.5 rounded-xl border-2 border-ink bg-card p-3 shadow-[3px_3px_0_var(--color-ink)] sm:grid-cols-4">
              {[
                ['on the table', `₹${state.offer.toFixed(1)} L`, 'CTC'],
                ['fixed', `₹${(state.offer * (1 - state.variablePct / 100)).toFixed(1)} L`, `${state.variablePct}% variable`],
                ['in hand', inr(slip.inHandMonthly), 'per month'],
                ['gained', `₹${Math.round(gained * 100000).toLocaleString('en-IN')}`, 'over opening']
              ].map(([label, value, sub]) => (
                <div key={label}>
                  <p className="mono-label">{label}</p>
                  <p className={`font-display text-lg font-extrabold tabular-nums ${label === 'gained' && gained > 0 ? 'text-ok' : ''}`}>{value}</p>
                  <p className="text-[10px] font-medium text-ink-3">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* transcript */}
          <div className="rounded-xl border-2 border-ink bg-card p-2.5 shadow-[3px_3px_0_var(--color-ink)]">
            <button type="button" onClick={() => setShowLog((v) => !v)} className="mb-1.5 flex w-full items-center justify-between">
              <span className="mono-label">what was said</span>
              <span className="font-mono text-[9px] font-bold text-ink-3">{showLog ? 'hide' : `${state.log.length} lines`}</span>
            </button>
            <ul className={`grid gap-1.5 overflow-auto ${showLog ? 'max-h-[420px]' : 'max-h-[300px]'}`}>
              {state.log.slice(showLog ? 0 : -6).map((l, i) => (
                <li key={i} className={`rounded-lg border-2 px-2 py-1 text-[11.5px] font-medium leading-snug ${l.who === 'you' ? 'border-ink/30 bg-[#f4f2ea]' : 'border-ink/15 bg-paper'}`}>
                  <span className="mono-label mr-1">{l.who === 'you' ? 'you' : 'them'}</span>
                  {l.text}
                </li>
              ))}
            </ul>
            {state.revealedCeiling && (
              <p className="mt-2 flex items-start gap-1 rounded-lg border-2 border-ink bg-c3-soft px-2 py-1 text-[10.5px] font-bold">
                <Info className="mt-0.5 h-3 w-3 shrink-0" /> their band closes near ₹{state.emp.ceiling.toFixed(1)} L
              </p>
            )}
          </div>
        </div>

        {/* moves */}
        {!state.over ? (
          <div className="mt-3 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {MOVES.map((m) => (
              <button key={m.id} type="button" onClick={() => move(m.id)}
                className={`rounded-lg border-2 border-ink px-2.5 py-1.5 text-left shadow-[2px_2px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none ${m.group === 'end' ? 'bg-[#f4f2ea]' : 'bg-card'}`}>
                <span className="block text-[12px] font-bold leading-tight">{m.label}</span>
                <span className="block font-mono text-[8px] uppercase tracking-wider text-ink-3">{m.hint}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {/* the letter */}
            <div className="rounded-xl border-2 border-ink bg-[#fffcf5] p-3 shadow-[3px_3px_0_var(--color-ink)]">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="mono-label">the offer letter, as it would arrive</span>
              </div>
              <dl className="grid gap-0.5 text-[11.5px]">
                {[
                  ['annual CTC', inr(slip.ctc)],
                  ['fixed gross', inr(slip.fixedGross)],
                  ['basic', inr(slip.basic)],
                  ['HRA', inr(slip.hra)],
                  ['special allowance', inr(slip.special)],
                  ['variable (not guaranteed)', inr(slip.variable)],
                  ['employer PF', inr(slip.employerPf)],
                  ['gratuity provision', inr(slip.gratuity)],
                  ['your PF deduction', inr(slip.employeePf)],
                  ['joining bonus', inr(state.joining)],
                  ['relocation', inr(state.relocation)]
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between border-b border-line/60 py-0.5 last:border-0">
                    <dt className="font-mono text-[9px] uppercase tracking-wide text-ink-3">{k}</dt>
                    <dd className="font-mono text-[10.5px] font-bold tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-2 rounded-lg border-2 border-ink bg-c2-soft px-2 py-1 font-display text-sm font-extrabold">
                {inr(slip.inHandMonthly)} a month, guaranteed
              </p>
            </div>

            <div className="rounded-xl border-2 border-ink bg-card p-3 shadow-[3px_3px_0_var(--color-ink)]">
              <p className="mono-label mb-1">what happened</p>
              <p className="text-[12.5px] font-medium leading-relaxed text-ink-2">
                {state.outcome === 'deal'
                  ? `You moved them ₹${(gained * 100000).toLocaleString('en-IN')} over their opening number — that is real money every month for as long as you stay.`
                  : state.outcome === 'lowball'
                    ? 'You accepted the opening number. Most candidates do, which is exactly why it is the opening number.'
                    : state.outcome === 'withdrawn'
                      ? 'Pushing a cold employer twice cost you the offer. Leverage is a bank balance, not a weapon.'
                      : 'You walked before they reached their ceiling. Sometimes right, always final.'}
              </p>
              <p className="mono-label mb-1 mt-2.5">what you could have done</p>
              <ul className="grid gap-0.5 text-[11.5px] font-medium text-ink-3">
                {!state.usedAnnexure && <li>· Ask for the annexure first — it reveals their band for free.</li>}
                {state.usedJustify === 0 && <li>· Justify with the published range before naming any number.</li>}
                {!state.usedCompeting && <li>· One competing offer is worth ₹60,000–90,000 a year. Save it for when it is true.</li>}
                {gained < 0.8 && <li>· Never concede in the first three turns.</li>}
                {state.joining === 0 && <li>· A joining bonus is easier to approve than a higher band.</li>}
              </ul>
              <button type="button" onClick={() => restart()} className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border-2 border-ink bg-c1 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_var(--color-ink)]">
                <RotateCcw className="h-3 w-3" /> negotiate again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
