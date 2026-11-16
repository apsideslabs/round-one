import { useMemo, useState } from 'react'

/** Play the doors, then run ten thousand trials and compare stay against switch. */
export function MontyHall() {
  const [trials, setTrials] = useState(2000)
  const [door, setDoor] = useState<number | null>(null)

  const result = useMemo(() => {
    let stay = 0
    let swap = 0
    for (let i = 0; i < trials; i++) {
      const prize = Math.floor(Math.random() * 3)
      const pick = Math.floor(Math.random() * 3)
      // host opens a losing door that is not the pick
      const openable = [0, 1, 2].filter((d) => d !== pick && d !== prize)
      const opened = openable[Math.floor(Math.random() * openable.length)]
      const switchTo = [0, 1, 2].find((d) => d !== pick && d !== opened)!
      if (pick === prize) stay++
      if (switchTo === prize) swap++
      void opened
    }
    return { stay: (stay / trials) * 100, swap: (swap / trials) * 100 }
  }, [trials])

  const prize = useMemo(() => Math.floor(Math.random() * 3), [door])

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <div className="grid place-items-center gap-6 p-4">
        <div className="flex gap-3">
          {[0, 1, 2].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDoor(d)}
              className={`grid h-28 w-24 place-items-center rounded-xl border-2 border-ink text-2xl font-extrabold shadow-[4px_4px_0_var(--color-ink)] ${
                door === d ? (d === prize ? 'bg-c2 text-white' : 'bg-c1 text-white') : 'bg-card'
              }`}
            >
              {door === null ? d + 1 : d === prize ? '★' : '·'}
            </button>
          ))}
        </div>

        <div className="w-full max-w-md">
          {[
            { label: 'stay', value: result.stay, colour: '#f5b01b' },
            { label: 'switch', value: result.swap, colour: '#0e8c6a' }
          ].map((bar) => (
            <div key={bar.label} className="mb-2 grid grid-cols-[64px_1fr_52px] items-center gap-2">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3">{bar.label}</span>
              <div className="h-5 overflow-hidden rounded-md border-2 border-ink bg-[#eeece4]">
                <div className="h-full transition-[width] duration-300" style={{ width: `${bar.value}%`, background: bar.colour }} />
              </div>
              <span className="font-mono text-[10px] font-bold tabular-nums">{bar.value.toFixed(1)}%</span>
            </div>
          ))}
          <p className="mt-1 text-center font-mono text-[8.5px] font-bold uppercase tracking-[0.12em] text-ink-3">
            theory: stay 33.3% · switch 66.7%
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 border-t-2 border-ink bg-paper px-3 py-2">
        <label className="flex items-center gap-1.5">
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-ink-3">trials</span>
          <input type="range" min={100} max={10000} step={100} value={trials} onChange={(e) => setTrials(Number(e.target.value))} className="w-32 accent-[#0e8c6a]" />
          <span className="font-mono text-[10px] font-bold tabular-nums">{trials}</span>
        </label>
        <button type="button" onClick={() => setDoor(null)} className="rounded-lg border-2 border-ink bg-card px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]">
          new round
        </button>
        <span className="chip bg-[#f4f2ea] border-line">pick a door to reveal the prize</span>
      </div>
    </div>
  )
}
