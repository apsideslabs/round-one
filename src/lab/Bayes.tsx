import { useState } from 'react'

/** A 10x10 population grid: prevalence, sensitivity and false-positive rate. */
export function Bayes() {
  const [prevalence, setPrevalence] = useState(10) // percent
  const [sensitivity, setSensitivity] = useState(90) // percent
  const [falsePositive, setFalsePositive] = useState(9) // percent

  const cells = Array.from({ length: 100 }, (_, i) => {
    const sick = i < prevalence
    const positive = sick ? (i * 37) % 100 < sensitivity : ((i * 61) % 100) < falsePositive
    return { sick, positive }
  })

  const truePos = cells.filter((c) => c.sick && c.positive).length
  const falsePos = cells.filter((c) => !c.sick && c.positive).length
  const posterior = truePos + falsePos > 0 ? (truePos / (truePos + falsePos)) * 100 : 0

  const row = (label: string, v: number, set: (n: number) => void, colour: string) => (
    <label className="flex items-center gap-1.5">
      <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-ink-3">{label}</span>
      <input type="range" min={1} max={40} step={1} value={v} onChange={(e) => set(e.target.value.length ? Number(e.target.value) : 1)} className="w-24" style={{ accentColor: colour }} />
      <span className="w-8 font-mono text-[10px] font-bold tabular-nums">{v}%</span>
    </label>
  )

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <div className="grid place-items-center p-3">
        <div className="grid grid-cols-10 gap-[3px]">
          {cells.map((c, i) => (
            <div
              key={i}
              className={`h-6 w-6 rounded-[2px] border border-ink/20 ${
                c.sick && c.positive
                  ? 'bg-c1'
                  : c.sick
                    ? 'bg-c1/30'
                    : c.positive
                      ? 'bg-c3'
                      : 'bg-[#eeece4]'
              }`}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 border-t-2 border-ink bg-paper px-3 py-2">
        {row('prevalence', prevalence, setPrevalence, '#ff4b26')}
        {row('sensitivity', sensitivity, setSensitivity, '#0e8c6a')}
        {row('false +', falsePositive, setFalsePositive, '#f5b01b')}
        <span className="chip bg-ink text-paper">P(sick | positive) = {posterior.toFixed(0)}%</span>
        <span className="chip bg-[#f4f2ea] border-line">
          {truePos} true positives · {falsePos} false positives out of 100
        </span>
      </div>
    </div>
  )
}
