import { useState } from 'react'

/** A flat net that folds into a box as you scrub. Pure CSS 3D, no library. */
export function FoldNet() {
  const [p, setP] = useState(0)
  const S = 96
  const angle = p * 90

  const face = (transform: string, colour: string, label: string) => (
    <div
      key={label}
      className="absolute grid place-items-center border-2 border-ink font-mono text-[10px] font-bold"
      style={{
        width: S,
        height: S,
        background: colour,
        transform,
        backfaceVisibility: 'visible'
      }}
    >
      {label}
    </div>
  )

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <div className="grid place-items-center overflow-hidden">
        <div
          className="relative"
          style={{ width: S, height: S, transformStyle: 'preserve-3d', transform: `rotateX(-24deg) rotateY(-32deg) scale(1.15)` }}
        >
          {/* base */}
          {face('translateZ(0)', '#f5b01b', 'base')}
          {/* four walls hinged on the base edges */}
          {face(`translateY(${-S}px) rotateX(${angle}deg)`, '#ff4b26', 'north')}
          {face(`translateY(${S}px) rotateX(${-angle}deg)`, '#0e8c6a', 'south')}
          {face(`translateX(${-S}px) rotateY(${-angle}deg)`, '#2f5bff', 'west')}
          {face(`translateX(${S}px) rotateY(${angle}deg)`, '#be123c', 'east')}
          {/* lid hinged on the north wall */}
          {face(
            `translateY(${-S}px) rotateX(${angle}deg) translateY(${-S}px) rotateX(${angle}deg)`,
            '#0e7490',
            'lid'
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 border-t-2 border-ink bg-paper px-4 py-2.5">
        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3">scrub to fold</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={p}
          onChange={(e) => setP(Number(e.target.value))}
          className="w-64 accent-[#ff4b26]"
        />
        <span className="chip bg-[#f4f2ea] border-line">{Math.round(p * 100)}%</span>
        <button
          type="button"
          onClick={() => setP((v) => (v > 0.5 ? 0 : 1))}
          className="rounded-lg border-2 border-ink bg-card px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]"
        >
          {p > 0.5 ? 'unfold' : 'fold'}
        </button>
      </div>
    </div>
  )
}
