import { useMemo, useState } from 'react'
import { makeState, play, monthlyInHand, type Move, type NegState } from '@/lib/negotiation'
import { Person, Bubble, Defs } from '@/components/comic/Faces'

const MOVES: Array<{ id: Move; label: string; hint: string }> = [
  { id: 'justify', label: 'Justify with the published band', hint: 'costs nothing, works twice' },
  { id: 'anchor', label: 'Anchor high, politely', hint: 'sets the frame' },
  { id: 'competing', label: 'Mention the other offer', hint: 'once only — twice backfires' },
  { id: 'structure', label: 'Ask to move variable into fixed', hint: 'small number, real money' },
  { id: 'concede', label: 'Accept what is on the table', hint: 'ends it here' },
  { id: 'walk', label: 'Walk away', hint: 'only if they are already at the ceiling' }
]

export function Negotiation() {
  const [state, setState] = useState<NegState>(() => makeState(3))
  const lastThem = useMemo(() => [...state.log].reverse().find((l) => l.who === 'them')?.text ?? '', [state.log])
  const gained = state.offer - state.floor
  const inHand = monthlyInHand(state.offer)

  const move = (m: Move) => setState((s) => play(s, m))
  const restart = () => setState(makeState(Math.floor(Math.random() * 9)))

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <div className="grid place-items-center p-3">
        <div className="w-full max-w-[720px]">
          <div className="relative overflow-hidden rounded-2xl border-[3px] border-ink bg-[#fffcf5] shadow-[5px_5px_0_var(--color-ink)]">
            <svg viewBox="0 0 720 330" className="block w-full">
              <Defs />
              <rect width="720" height="330" fill="url(#wall)" />
              <rect x="0" y="230" width="720" height="100" fill="#e7e2d3" />
              <rect x="0" y="230" width="720" height="100" fill="url(#hatch)" opacity="0.25" />
              <rect x="90" y="230" width="540" height="16" fill="#c9a227" stroke="#12151a" strokeWidth="3" />
              <rect x="110" y="246" width="16" height="80" fill="#a8871d" stroke="#12151a" strokeWidth="2.5" />
              <rect x="594" y="246" width="16" height="80" fill="#a8871d" stroke="#12151a" strokeWidth="2.5" />

              <Person x={210} y={104} scale={0.72} skin="#f0c9a4" skinShade="#e0b189" hair="#2b2b2b" shirt="#ff4b26" mood="neutral" hairStyle="short" sweat={state.leverage < 30} />
              <Person x={512} y={104} scale={0.72} skin="#d9a273" skinShade="#c78e5f" hair="#12151a" shirt="#2f5bff" mood={state.over ? 'smile' : state.leverage > 65 ? 'sceptical' : 'neutral'} hairStyle="bun" lookX={2} />

              <Bubble x={512} y={18} text={lastThem.length > 60 ? `${lastThem.slice(0, 58)}…` : lastThem} />

              <g>
                <rect x="0" y="0" width="240" height="30" fill="#12151a" />
                <rect x="240" y="0" width="12" height="30" fill="#f5b01b" />
                <text x="12" y="20" fontSize="10.5" fontWeight="800" fill="#fffcf5" fontFamily="JetBrains Mono, monospace">
                  {`TURNS LEFT ${Math.max(0, state.turns)} · LEVERAGE ${Math.round(state.leverage)}`}
                </text>
              </g>
              <rect width="720" height="330" fill="url(#vignette)" pointerEvents="none" />
            </svg>

            {state.over && (
              <div className="comic-stamp pointer-events-none absolute right-6 top-10 rounded-sm border-4 px-3 py-1 font-display text-lg font-extrabold uppercase tracking-[0.16em]"
                style={{
                  borderColor: state.outcome === 'deal' ? '#0e8c6a' : state.outcome === 'lowball' ? '#b8860b' : '#be123c',
                  color: state.outcome === 'deal' ? '#0e8c6a' : state.outcome === 'lowball' ? '#b8860b' : '#be123c',
                  background: 'rgba(255,252,245,0.9)'
                }}>
                {state.outcome === 'deal' ? 'DEAL' : state.outcome === 'lowball' ? 'LOWBALL' : 'WALKED'}
              </div>
            )}
          </div>

          <div className="mt-2 grid gap-1.5 rounded-xl border-2 border-ink bg-card p-3 shadow-[3px_3px_0_var(--color-ink)] sm:grid-cols-3">
            <div>
              <p className="mono-label">on the table</p>
              <p className="font-display text-2xl font-extrabold tabular-nums">₹{state.offer.toFixed(1)} L</p>
              <p className="text-[10.5px] font-medium text-ink-3">fixed CTC</p>
            </div>
            <div>
              <p className="mono-label">in hand</p>
              <p className="font-display text-2xl font-extrabold tabular-nums">₹{inHand.toLocaleString('en-IN')}</p>
              <p className="text-[10.5px] font-medium text-ink-3">guaranteed, monthly</p>
            </div>
            <div>
              <p className="mono-label">gained over opening</p>
              <p className={`font-display text-2xl font-extrabold tabular-nums ${gained > 0 ? 'text-ok' : 'text-ink-3'}`}>₹{(gained * 100000).toLocaleString('en-IN')}</p>
              <p className="text-[10.5px] font-medium text-ink-3">per year, fixed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-ink bg-paper px-3 py-2">
        <div className="mb-1.5 flex items-center justify-center gap-2">
          <span className="mono-label">leverage</span>
          <div className="h-2.5 w-40 overflow-hidden rounded-full border-2 border-ink bg-[#eeece4]">
            <div className="h-full transition-[width] duration-300" style={{ width: `${state.leverage}%`, background: state.leverage > 60 ? '#0e8c6a' : state.leverage > 30 ? '#f5b01b' : '#be123c' }} />
          </div>
          <span className="font-mono text-[10px] font-bold tabular-nums">{Math.round(state.leverage)}</span>
        </div>

        {!state.over ? (
          <div className="grid gap-1.5 sm:grid-cols-3">
            {MOVES.map((m) => (
              <button key={m.id} type="button" onClick={() => move(m.id)}
                className="rounded-lg border-2 border-ink bg-card px-2.5 py-1.5 text-left shadow-[2px_2px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none">
                <span className="block text-[12px] font-bold leading-tight">{m.label}</span>
                <span className="block font-mono text-[8px] uppercase tracking-wider text-ink-3">{m.hint}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="chip bg-[#f4f2ea] border-line">
              {state.outcome === 'deal'
                ? `closed at ₹${state.offer.toFixed(1)} L — ${gained > 1 ? 'well played' : 'you left money on the table'}`
                : state.outcome === 'lowball'
                  ? 'you accepted the opening number — the most expensive sentence in the room'
                  : 'you walked. Sometimes correct, always final.'}
            </span>
            <button type="button" onClick={restart} className="rounded-lg border-2 border-ink bg-c1 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_var(--color-ink)]">
              negotiate again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
