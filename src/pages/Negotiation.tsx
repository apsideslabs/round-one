import { useMemo, useState } from 'react'
import { RotateCcw, Mic, Video, Circle, AlertTriangle, ChevronDown } from 'lucide-react'
import { Person, Defs } from '@/components/comic/Faces'
import { makeState, play, payslip, score, EMPLOYERS, type Archetype, type Move } from '@/lib/negotiation'

const MOVES: Array<{ id: Move; label: string; hint: string; group: 'money' | 'info' | 'terms' | 'end' }> = [
  { id: 'justify', label: 'Cite the band', hint: 'twice max', group: 'money' },
  { id: 'anchor', label: 'Anchor high', hint: 'safe', group: 'money' },
  { id: 'competing', label: 'Other offer', hint: 'once', group: 'money' },
  { id: 'structure', label: 'Variable → fixed', hint: 'certainty', group: 'money' },
  { id: 'joining', label: 'Joining bonus', hint: 'one-time', group: 'money' },
  { id: 'relocation', label: 'Relocation', hint: '₹40k', group: 'money' },
  { id: 'annexure', label: 'Annexure', hint: 'band leaks', group: 'info' },
  { id: 'askBand', label: 'Grade & band', hint: 'confirms ceiling', group: 'info' },
  { id: 'askVariable', label: 'Variable payout', hint: 'last year', group: 'info' },
  { id: 'askBond', label: 'The bond', hint: 'rarely read', group: 'info' },
  { id: 'askUrgency', label: 'Seats open', hint: 'their deadline', group: 'info' },
  { id: 'tradeNotice', label: 'Trade notice', hint: 'costs later', group: 'terms' },
  { id: 'time', label: 'Ask for a day', hint: 'buys a turn', group: 'terms' },
  { id: 'concede', label: 'Accept', hint: 'ends it', group: 'end' },
  { id: 'walk', label: 'Walk away', hint: 'at ceiling only', group: 'end' }
]

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

export default function Negotiation() {
  const [arch, setArch] = useState<Archetype>('service')
  const [state, setState] = useState(() => makeState('service'))
  const [minute, setMinute] = useState(4)
  const [openLog, setOpenLog] = useState(false)

  const slip = useMemo(() => payslip(state.offer, state.variablePct), [state.offer, state.variablePct])
  const result = useMemo(() => score(state), [state])
  const lastThem = useMemo(() => [...state.log].reverse().find((l) => l.who === 'them')?.text ?? '', [state.log])
  const gained = state.offer - state.opening
  const move = (m: Move) => { setState((s) => play(s, m)); setMinute((v) => v + 2) }
  const restart = (a: Archetype = arch) => { setArch(a); setState(makeState(a)); setMinute(4) }

  const verdictColour = state.outcome === 'deal' ? '#0e8c6a' : state.outcome === 'lowball' ? '#b8860b' : '#be123c'
  const verdictText = state.outcome === 'deal' ? 'SIGNED' : state.outcome === 'lowball' ? 'LOWBALL' : state.outcome === 'withdrawn' ? 'WITHDRAWN' : 'WALKED'

  return (
    <div className="w-full px-3 pb-20 pt-3 sm:px-5 md:pb-6 lg:px-6">
      <div className="mx-auto max-w-[1180px]">
        {/* header, one line */}
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <h1 className="font-display text-xl font-extrabold tracking-tight">Negotiation</h1>
            <span className="hidden text-[11.5px] font-medium text-ink-3 sm:inline">
              {state.emp.name} · {state.emp.recruiter}, {state.emp.role}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {(Object.keys(EMPLOYERS) as Archetype[]).map((a) => (
              <button key={a} type="button" onClick={() => restart(a)}
                className={`rounded-md border-2 border-ink px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-wider ${arch === a ? 'bg-ink text-paper' : 'bg-card'}`}>
                {a}
              </button>
            ))}
            <button type="button" onClick={() => restart()} className="rounded-md border-2 border-ink bg-card px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-wider">restart</button>
          </div>
        </div>

        {/* one screen: her on the left, the sheet and your moves on the right */}
        <div className="grid gap-2.5 lg:grid-cols-[330px_1fr] lg:items-start">
          {/* left: the call */}
          <div className="grid gap-2">
            <div className="relative overflow-hidden rounded-xl border-[3px] border-ink bg-[#1a1d22] shadow-[5px_5px_0_var(--color-ink)]">
              <div className="flex items-center justify-between px-2.5 py-1">
                <span className="flex items-center gap-1.5 font-mono text-[8.5px] font-bold uppercase tracking-wider text-white/70">
                  <Circle className="h-1.5 w-1.5 fill-[#e5484d] text-[#e5484d]" /> live · 00:{String(minute).padStart(2, '0')}
                </span>
                <span className="flex items-center gap-1 text-white/40"><Mic className="h-2.5 w-2.5" /><Video className="h-2.5 w-2.5" /></span>
              </div>

              <svg viewBox="0 0 330 250" preserveAspectRatio="xMidYMid slice" className="block w-full max-h-[168px] sm:max-h-[210px] lg:max-h-none">
                <Defs />
                <rect width="330" height="250" fill="#23272e" />
                <rect width="330" height="250" fill="url(#hatch)" opacity="0.08" />
                <rect x="0" y="210" width="330" height="40" fill="#2e333b" />
                <Person x={165} y={92} scale={0.86} skin="#d9a273" skinShade="#c78e5f" hair="#12151a" shirt="#2f5bff"
                  mood={state.over ? 'smile' : state.mood === 'warm' ? 'smile' : state.mood === 'cold' ? 'sceptical' : 'neutral'}
                  hairStyle="bun" lookX={2} sweat={state.mood === 'cold'} />
                <rect x="236" y="8" width="86" height="56" rx="5" fill="#15181c" stroke="#3a4048" strokeWidth="2" />
                <text x="279" y="40" textAnchor="middle" fontSize="8" fill="#8b939e" fontFamily="JetBrains Mono, monospace">you · cam off</text>
                <rect x="8" y="8" width="140" height="18" rx="3" fill="rgba(0,0,0,0.45)" />
                <text x="14" y="21" fontSize="8.5" fill="#cfd6df" fontFamily="JetBrains Mono, monospace">{state.emp.recruiter}</text>
                <text x="10" y="240" fontSize="8.5" fill="#8b939e" fontFamily="JetBrains Mono, monospace">{state.tell}</text>
              </svg>

              <div className="border-t-2 border-[#3a4048] bg-[#15181c] px-2.5 py-1.5">
                <p className="text-[11.5px] font-medium leading-snug text-white/90">{lastThem}</p>
              </div>
            </div>

            {/* turns · leverage · mood, one row */}
            <div className="grid grid-cols-3 gap-1.5">
              {[['turns', String(Math.max(0, state.turns))], ['leverage', String(Math.round(state.leverage))], ['mood', state.mood]].map(([k, v]) => (
                <div key={k} className="rounded-lg border-2 border-ink bg-card px-1.5 py-0.5 text-center">
                  <p className="font-mono text-[7px] font-bold uppercase tracking-wider text-ink-3">{k}</p>
                  <p className="font-display text-[13px] font-extrabold capitalize leading-tight">{v}</p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border-2 border-ink bg-card px-2 py-1">
              <div className="mb-0.5 flex items-center justify-between">
                <span className="font-mono text-[7px] font-bold uppercase tracking-wider text-ink-3">her ceiling</span>
                <span className="font-mono text-[9px] font-bold">{state.revealedCeiling ? `₹${state.emp.ceiling.toFixed(1)} L` : '?'}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full border-2 border-ink bg-[#eeece4]">
                <div className="h-full transition-[width] duration-300" style={{ width: `${Math.min(100, (state.offer / state.emp.ceiling) * 100)}%`, background: state.offer >= state.emp.ceiling - 0.1 ? '#0e8c6a' : '#f5b01b' }} />
              </div>
            </div>

            {/* transcript, folded away */}
            <div className="rounded-lg border-2 border-ink bg-card">
              <button type="button" onClick={() => setOpenLog((v) => !v)} className="flex w-full items-center justify-between px-2 py-1">
                <span className="font-mono text-[7px] font-bold uppercase tracking-wider text-ink-3">transcript · {state.log.length}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${openLog ? 'rotate-180' : ''}`} />
              </button>
              <ul className={`grid gap-1 overflow-auto px-2 pb-1.5 ${openLog ? 'max-h-[180px]' : 'max-h-[34px]'}`}>
                {state.log.slice(openLog ? -12 : -1).map((l, i) => (
                  <li key={i} className="grid grid-cols-[36px_1fr] gap-1.5 text-[10.5px] font-medium leading-snug">
                    <span className="font-mono text-[7.5px] font-bold uppercase text-ink-3/70">{l.who}</span>
                    <span className={l.who === 'you' ? 'text-ink' : 'text-ink-2'}>{l.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* right: the sheet, then your moves — same screen as her */}
          <div className="grid gap-2">
            <div className="order-2 rounded-xl border-[3px] border-ink bg-[#fffcf5] p-2.5 shadow-[5px_5px_0_var(--color-ink)] lg:order-1">
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <p className="mono-label">offer sheet · grade G{state.grade} · {state.emp.name}</p>
                {state.over && (
                  <div className="comic-stamp rounded-sm border-[3px] px-2 py-0.5 font-display text-[11px] font-extrabold uppercase tracking-[0.14em]"
                    style={{ borderColor: verdictColour, color: verdictColour, background: 'rgba(255,252,245,0.9)' }}>{verdictText}</div>
                )}
              </div>

              <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-[1.1fr_0.9fr]">
                {[
                  { head: 'A · fixed', rows: [['ctc', `₹${state.offer.toFixed(1)} L`], ['fixed gross', inr(slip.fixedGross)], ['basic', inr(slip.basic)], ['hra', inr(slip.hra)], ['special', inr(slip.special)]] },
                  { head: 'B · variable', rows: [['target', `${inr(slip.variable)} · ${state.variablePct}%`], ['paid last yr', `${state.emp.variablePaid}%`]] },
                  { head: 'C · one-time', rows: [['joining', state.joining ? inr(state.joining) : '—'], ['relocation', state.relocation ? inr(state.relocation) : '—']] },
                  { head: 'D · conditions', rows: [['bond', state.bond ? `${state.bond} yr` : 'none'], ['notice', `${state.notice} mo`], ['probation', `${state.emp.probation} mo`]] }
                ].map((sec) => (
                  <div key={sec.head}>
                    <p className="font-mono text-[7.5px] font-bold uppercase tracking-[0.14em] text-ink-3/80">{sec.head}</p>
                    {sec.rows.map(([k, v]) => (
                      <div key={k} className="flex items-baseline justify-between gap-2 border-b border-dotted border-line/80">
                        <span className="shrink-0 font-mono text-[8.5px] uppercase tracking-wide text-ink-3">{k}</span>
                        <span className="font-mono text-[10.5px] font-bold tabular-nums">{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              <div className="mt-1.5 flex items-baseline justify-between rounded-lg border-2 border-ink bg-c2-soft px-2 py-0.5">
                <span className="font-mono text-[8.5px] font-bold uppercase tracking-wide">monthly in hand</span>
                <span className="font-display text-sm font-extrabold tabular-nums text-ok">{inr(slip.inHandMonthly)}</span>
              </div>

              {/* her scribbles, inline */}
              <div className="mt-1.5 flex flex-wrap gap-1">
                {[
                  state.revealedCeiling && `grade closes ${state.emp.ceiling.toFixed(1)} — do not repeat`,
                  state.usedCompeting && 'another offer. twice? ask for the letter',
                  state.mood === 'cold' && 'underlined: STANDARD BAND',
                  state.usedUrgency && 'told them Thursday. why'
                ].filter(Boolean).slice(0, 3).map((note, i) => (
                  <span key={i} className="rounded-sm border border-ink/30 bg-[#fdf3c8] px-1.5 py-0.5 font-mono text-[8.5px] font-bold text-ink-2"
                    style={{ transform: `rotate(${i % 2 ? 0.6 : -0.6}deg)` }}>{note}</span>
                ))}
              </div>

              {state.over && (
                <div className="mt-2 grid gap-1.5 rounded-lg border-2 border-ink bg-[#f7f5ee] p-2">
                  <div className="grid grid-cols-3 gap-2">
                    {[['cash', inr(result.cash)], ['terms cost', `−${inr(result.termsCost)}`], ['net', inr(result.net)]].map(([k, v]) => (
                      <div key={k}>
                        <p className="font-mono text-[7px] font-bold uppercase tracking-wider text-ink-3">{k}</p>
                        <p className={`font-display text-[13px] font-extrabold tabular-nums ${k === 'net' ? (result.net > 0 ? 'text-ok' : 'text-bad') : ''}`}>{v}</p>
                      </div>
                    ))}
                  </div>
                  {result.notes.map((n) => (
                    <p key={n} className="flex items-start gap-1 text-[10.5px] font-medium text-ink-2">
                      <AlertTriangle className="mt-0.5 h-2.5 w-2.5 shrink-0 text-[#b8860b]" /> {n}
                    </p>
                  ))}
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => restart()} className="inline-flex items-center gap-1 rounded-lg border-2 border-ink bg-c1 px-2.5 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_var(--color-ink)]">
                      <RotateCcw className="h-2.5 w-2.5" /> call again
                    </button>
                    <span className="text-[10.5px] font-medium text-ink-3">
                      {state.outcome === 'deal' ? `moved ₹${Math.round(gained * 100000).toLocaleString('en-IN')}` : state.outcome === 'lowball' ? 'took the first number' : state.outcome === 'withdrawn' ? 'she pulled it' : 'you walked'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {!state.over && (
              <div className="order-1 rounded-xl border-2 border-ink bg-card p-2 shadow-[3px_3px_0_var(--color-ink)] lg:order-2">
                <p className="mono-label mb-1">what you say next</p>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 sm:grid-cols-4">
                  {(['money', 'info', 'terms', 'end'] as const).map((group) => (
                    <div key={group}>
                      <p className="mb-0.5 font-mono text-[7px] font-bold uppercase tracking-[0.12em] text-ink-3/70">
                        {group === 'info' ? 'info' : group === 'end' ? 'endings' : group}
                      </p>
                      <div className="grid gap-[3px]">
                        {MOVES.filter((m) => m.group === group).map((m) => (
                          <button key={m.id} type="button" onClick={() => move(m.id)}
                            className={`rounded border-2 border-ink px-1.5 py-[3px] text-left leading-tight transition-transform hover:-translate-y-px active:translate-y-px ${group === 'end' ? 'bg-[#f4f2ea]' : group === 'info' ? 'bg-c3-soft' : group === 'terms' ? 'bg-[#efece1]' : 'bg-paper'}`}>
                            <span className="block text-[10.5px] font-bold">{m.label}</span>
                            <span className="block font-mono text-[6.5px] uppercase tracking-wider text-ink-3">{m.hint}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
