import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause, SkipBack, StickyNote, Wand2 } from 'lucide-react'
import { Person, Defs, type Mood } from '@/components/comic/Faces'
import { TAPE, beatAt, attentionAt, tapeDuration, turningPoints } from '@/data/tape'

/** Drag through a real interview and watch the room lose interest. */
export function Tape() {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const raf = useRef(0)
  const last = useRef(0)
  const duration = tapeDuration(TAPE)
  const beat = beatAt(TAPE, t)
  const { low, high } = useMemo(() => turningPoints(TAPE), [])

  useEffect(() => {
    if (!playing) return
    last.current = performance.now()
    const tick = (now: number) => {
      const dt = (now - last.current) / 1000
      last.current = now
      setT((v) => {
        const next = v + dt
        if (next >= duration) { setPlaying(false); return duration }
        return next
      })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [playing, duration])

  const notes = TAPE.filter((b) => b.note)
  const currentNote = [...notes].reverse().find((n) => n.t <= t)

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <div className="grid min-h-0 gap-2 p-2.5 lg:grid-cols-[1fr_300px]">
        {/* the frame */}
        <div className="relative overflow-hidden rounded-xl border-[3px] border-ink bg-[#fffcf5] shadow-[5px_5px_0_var(--color-ink)]">
          <svg viewBox="0 0 700 330" className="block h-full w-full">
            <Defs />
            <rect width="700" height="330" fill="url(#wall)" />
            <rect x="0" y="230" width="700" height="100" fill="#e7e2d3" />
            <rect x="0" y="230" width="700" height="100" fill="url(#hatch)" opacity="0.22" />
            <rect x="70" y="230" width="560" height="16" fill="#c9a227" stroke="#12151a" strokeWidth="3" />

            <Person x={210} y={104} scale={0.8} skin="#f0c9a4" skinShade="#e0b189" hair="#2b2b2b" shirt="#2f5bff" mood={beat.moods[0] as Mood} hairStyle="short" glasses lookX={-2} />
            <Person x={350} y={98} scale={0.86} skin="#d9a273" skinShade="#c78e5f" hair="#12151a" shirt="#be123c" mood={beat.moods[1] as Mood} hairStyle="bun" lookX={-2} />
            <Person x={490} y={104} scale={0.8} skin="#c98d5c" skinShade="#b47a4b" hair="#3d2b1f" shirt="#0e8c6a" mood={beat.moods[2] as Mood} hairStyle="bald" beard lookX={-2} />

            {/* subtitle */}
            <rect x="16" y="256" width="668" height="58" fill="rgba(18,21,26,0.88)" rx="6" />
            <text x="30" y="276" fontSize="9" fontWeight="800" fill="#f5b01b" fontFamily="JetBrains Mono, monospace">
              {beat.who === 'you' ? 'YOU' : 'PANEL'} · {String(Math.floor(beat.t)).padStart(2, '0')}s
            </text>
            <foreignObject x="30" y="280" width="640" height="30">
              <div style={{ font: '600 12.5px Manrope, sans-serif', color: '#fffcf5', lineHeight: 1.25 }}>{beat.line}</div>
            </foreignObject>

            {/* attention meter, in frame */}
            <g>
              <rect x="16" y="14" width="150" height="8" rx="4" fill="rgba(18,21,26,0.14)" />
              <rect x="16" y="14" width={Math.max(4, (attentionAt(TAPE, t) / 100) * 150)} height="8" rx="4"
                fill={attentionAt(TAPE, t) > 55 ? '#0e8c6a' : attentionAt(TAPE, t) > 35 ? '#f5b01b' : '#be123c'} />
              <text x="174" y="22" fontSize="9" fontWeight="800" fill="#12151a" fontFamily="JetBrains Mono, monospace">
                ATTENTION {Math.round(attentionAt(TAPE, t))}
              </text>
            </g>
            <rect width="700" height="330" fill="url(#vignette)" pointerEvents="none" />
          </svg>

          {beat.ghost && (
            <div className="absolute left-3 top-9 max-w-[420px] rounded-lg border-2 border-ink bg-c3-soft px-2 py-1">
              <span className="mono-label flex items-center gap-1"><Wand2 className="h-2.5 w-2.5" /> what a strong answer said here</span>
              <p className="text-[11.5px] font-bold leading-snug">{beat.ghost}</p>
            </div>
          )}
        </div>

        {/* their notes */}
        <div className="grid content-start gap-2">
          <div className="rounded-xl border-2 border-ink bg-card p-2 shadow-[3px_3px_0_var(--color-ink)]">
            <p className="mono-label mb-1 flex items-center gap-1"><StickyNote className="h-2.5 w-2.5" /> what they wrote</p>
            {currentNote ? (
              <p className="rounded-sm border-2 border-ink/25 bg-[#fdf3c8] px-2 py-1 font-mono text-[11px] font-bold leading-snug">
                {currentNote.note}
              </p>
            ) : (
              <p className="text-[11px] font-medium text-ink-3">Nothing yet. Keep scrubbing.</p>
            )}
          </div>

          <div className="rounded-xl border-2 border-ink bg-card p-2 shadow-[3px_3px_0_var(--color-ink)]">
            <p className="mono-label mb-1">the two moments that decided it</p>
            <button type="button" onClick={() => setT(high.t)} className="mb-1 w-full rounded-lg border-2 border-ink bg-c2-soft px-2 py-1 text-left">
              <span className="block font-mono text-[8px] font-bold uppercase text-ink-3">{high.t}s · attention {high.attention}</span>
              <span className="block text-[11px] font-bold leading-tight">where you had the room</span>
            </button>
            <button type="button" onClick={() => setT(low.t)} className="w-full rounded-lg border-2 border-ink bg-c1-soft px-2 py-1 text-left">
              <span className="block font-mono text-[8px] font-bold uppercase text-ink-3">{low.t}s · attention {low.attention}</span>
              <span className="block text-[11px] font-bold leading-tight">where you lost it</span>
            </button>
          </div>

          <div className="rounded-xl border-2 border-ink bg-card p-2 shadow-[3px_3px_0_var(--color-ink)]">
            <p className="mono-label mb-1">read the tape</p>
            <p className="text-[11px] font-medium leading-snug text-ink-3">
              Attention fell from {high.attention} to {low.attention} in {low.t - high.t} seconds. The recovery at 52s came from one
              concrete failure — not from a better introduction.
            </p>
          </div>
        </div>
      </div>

      {/* the tape itself */}
      <div className="border-t-2 border-ink bg-paper px-3 py-1.5">
        <div className="mb-1 flex items-center gap-2">
          <button type="button" onClick={() => setPlaying((p) => !p)} className="grid h-7 w-7 place-items-center rounded-md border-2 border-ink bg-c1 text-white shadow-[2px_2px_0_var(--color-ink)]">
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button type="button" onClick={() => { setT(0); setPlaying(false) }} className="grid h-7 w-7 place-items-center rounded-md border-2 border-ink bg-card shadow-[2px_2px_0_var(--color-ink)]">
            <SkipBack className="h-3.5 w-3.5" />
          </button>
          <span className="font-mono text-[10px] font-bold tabular-nums">{t.toFixed(1)}s / {duration}s</span>
          <span className="ml-auto font-mono text-[9px] uppercase tracking-wider text-ink-3">drag the tape · every mark is a moment they reacted</span>
        </div>

        <div className="relative">
          <input
            type="range" min={0} max={duration} step={0.1} value={t}
            onChange={(e) => { setPlaying(false); setT(Number(e.target.value)) }}
            className="w-full accent-[#ff4b26]"
          />
          <div className="relative -mt-1 h-4">
            {TAPE.filter((b) => b.who !== 'note').map((b) => (
              <button key={b.t} type="button" onClick={() => { setPlaying(false); setT(b.t) }}
                title={b.line}
                className="absolute top-0 h-3 w-[3px] -translate-x-1/2 rounded-full"
                style={{
                  left: `${(b.t / duration) * 100}%`,
                  background: b.who === 'you' ? '#ff4b26' : '#2f5bff',
                  opacity: Math.abs(b.t - t) < 3 ? 1 : 0.45
                }} />
            ))}
            {notes.map((n) => (
              <span key={`n${n.t}`} className="absolute top-0 h-3 w-3 -translate-x-1/2 rounded-sm border border-ink bg-[#fdf3c8]"
                style={{ left: `${(n.t / duration) * 100}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
