import { useMemo, useState } from 'react'

/**
 * Two offers, decomposed. CTC is not salary: it includes employer PF, a
 * gratuity provision, insurance and variable pay you may never see. This
 * computes the only number that pays rent — guaranteed monthly in-hand — with
 * the assumptions printed rather than hidden.
 */
interface Offer {
  name: string
  ctc: number // lakhs per year
  basicPct: number // basic as % of fixed gross
  variablePct: number // % of CTC
  insurance: number // rupees per year
  joining: number // one-time, outside CTC
  pfCapped: boolean // PF on full basic, or capped at 15,000/month
}

const PF_CEILING_BASIC = 15000 * 12
const PT = 2400
const GRATUITY_PCT = 0.0481

function taxNewRegime(taxable: number) {
  const slabs: Array<[number, number, number]> = [
    [0, 400000, 0],
    [400000, 800000, 0.05],
    [800000, 1200000, 0.1],
    [1200000, 1600000, 0.15],
    [1600000, 2000000, 0.2],
    [2000000, 2400000, 0.25],
    [2400000, Infinity, 0.3]
  ]
  let tax = 0
  for (const [lo, hi, rate] of slabs) {
    if (taxable > lo) tax += (Math.min(taxable, hi) - lo) * rate
  }
  // section 87A rebate under the new regime
  if (taxable <= 1200000) tax = Math.max(0, tax - 60000)
  return tax * 1.04 // 4% cess
}

function compute(o: Offer) {
  const ctc = o.ctc * 100000
  const variable = ctc * (o.variablePct / 100)
  const fixedCtc = ctc - variable

  // basic is a share of fixed gross; solve the circularity one pass
  let basic = fixedCtc * (o.basicPct / 100)
  const pfBase = o.pfCapped ? Math.min(basic, PF_CEILING_BASIC) : basic
  let employerPf = 0.12 * pfBase
  let gratuity = GRATUITY_PCT * basic

  const fixedGross = fixedCtc - employerPf - gratuity - o.insurance
  basic = fixedGross * (o.basicPct / 100)
  const pfBase2 = o.pfCapped ? Math.min(basic, PF_CEILING_BASIC) : basic
  employerPf = 0.12 * pfBase2
  gratuity = GRATUITY_PCT * basic

  const employeePf = 0.12 * pfBase2
  const taxable = Math.max(0, fixedGross - 75000)
  const tds = taxNewRegime(taxable)
  const inHandYear = fixedGross - employeePf - PT - tds

  return {
    ctc,
    variable,
    fixedCtc,
    employerPf,
    gratuity,
    fixedGross,
    basic,
    employeePf,
    tds,
    inHandYear,
    inHandMonth: inHandYear / 12,
    firstYearCash: inHandYear + variable + o.joining,
    longTerm: employerPf + gratuity,
    gapPct: ((ctc / 12 - inHandYear / 12) / (ctc / 12)) * 100
  }
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`

export function OfferDesk() {
  const [a, setA] = useState<Offer>({ name: 'Offer A', ctc: 6, basicPct: 50, variablePct: 10, insurance: 8000, joining: 0, pfCapped: false })
  const [b, setB] = useState<Offer>({ name: 'Offer B', ctc: 7.2, basicPct: 40, variablePct: 20, insurance: 10000, joining: 50000, pfCapped: true })

  const ra = useMemo(() => compute(a), [a])
  const rb = useMemo(() => compute(b), [b])

  const control = (label: string, value: number, onChange: (n: number) => void, min: number, max: number, step: number, suffix = '') => (
    <label className="flex items-center justify-between gap-2">
      <span className="font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-ink-3">{label}</span>
      <span className="flex items-center gap-1.5">
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-24 accent-[#ff4b26]" />
        <span className="w-12 text-right font-mono text-[10px] font-bold tabular-nums">{value}{suffix}</span>
      </span>
    </label>
  )

  const column = (o: Offer, r: ReturnType<typeof compute>, set: (o: Offer) => void, colour: string) => (
    <div className="rounded-xl border-2 border-ink bg-card p-3 shadow-[3px_3px_0_var(--color-ink)]">
      <div className="mb-2 flex items-center gap-2">
        <span className="h-3 w-3 rounded-sm border border-ink" style={{ background: colour }} />
        <input
          value={o.name}
          onChange={(e) => set({ ...o, name: e.target.value })}
          className="min-w-0 flex-1 bg-transparent text-[13px] font-extrabold outline-none"
        />
      </div>

      <div className="mb-2 rounded-lg border-2 border-ink px-2 py-1.5" style={{ background: colour }}>
        <span className="block font-mono text-[7.5px] font-bold uppercase tracking-[0.12em] text-white/80">headline ctc</span>
        <span className="font-display text-lg font-extrabold text-white">{o.ctc} LPA</span>
      </div>

      <div className="mb-2 rounded-lg border-2 border-ink bg-[#f7f5ee] px-2 py-1.5">
        <span className="block font-mono text-[7.5px] font-bold uppercase tracking-[0.12em] text-ink-3">guaranteed in-hand</span>
        <span className="font-display text-xl font-extrabold tabular-nums">{inr(r.inHandMonth)}<span className="text-[10px] font-bold text-ink-3"> /mo</span></span>
        <span className="mt-0.5 block font-mono text-[8px] font-bold text-ink-3">{r.gapPct.toFixed(0)}% below CTC ÷ 12</span>
      </div>

      <dl className="grid gap-0.5 text-[10.5px]">
        {[
          ['fixed gross / yr', inr(r.fixedGross)],
          ['variable (not sure)', inr(r.variable)],
          ['employer PF', inr(r.employerPf)],
          ['gratuity provision', inr(r.gratuity)],
          ['your PF deduction', inr(r.employeePf)],
          ['income tax (new)', inr(r.tds)],
          ['first-year cash', inr(r.firstYearCash)],
          ['long-term savings', inr(r.longTerm)]
        ].map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-2 border-b border-line/60 py-0.5 last:border-0">
            <dt className="font-mono text-[8.5px] uppercase tracking-wide text-ink-3">{k}</dt>
            <dd className="font-mono text-[10px] font-bold tabular-nums">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-2 grid gap-1">
        {control('basic %', o.basicPct, (n) => set({ ...o, basicPct: n }), 30, 70, 5, '%')}
        {control('variable %', o.variablePct, (n) => set({ ...o, variablePct: n }), 0, 30, 5, '%')}
        {control('ctc', o.ctc, (n) => set({ ...o, ctc: n }), 3, 20, 0.2, 'L')}
        {control('insurance', o.insurance, (n) => set({ ...o, insurance: n }), 0, 25000, 1000)}
        {control('joining bonus', o.joining, (n) => set({ ...o, joining: n }), 0, 200000, 10000)}
        <label className="mt-1 flex items-center gap-2">
          <input type="checkbox" checked={o.pfCapped} onChange={(e) => set({ ...o, pfCapped: e.target.checked })} className="h-3 w-3 accent-[#ff4b26]" />
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-ink-3">PF capped at ₹15,000 basic</span>
        </label>
      </div>
    </div>
  )

  const winner = ra.inHandMonth >= rb.inHandMonth ? a.name : b.name
  const diff = Math.abs(ra.inHandMonth - rb.inHandMonth)

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto] overflow-auto">
      <div className="grid gap-3 p-3 sm:grid-cols-2">
        {column(a, ra, setA, '#ff4b26')}
        {column(b, rb, setB, '#2f5bff')}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 border-t-2 border-ink bg-paper px-3 py-2">
        <span className="chip bg-ink text-paper">{winner} pays {inr(diff)} more per month</span>
        <span className="chip bg-[#f4f2ea] border-line">basic drives PF and gratuity · variable is a target, not a promise</span>
        <span className="chip bg-[#f4f2ea] border-line">new regime · ₹75,000 standard deduction · 4% cess · PT ₹2,400/yr</span>
      </div>
    </div>
  )
}
