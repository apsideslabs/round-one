import { useEffect, useMemo, useRef, useState } from 'react'
import { analytic, band, dropOne, ROWS_FROM_SCORES, type Row } from '@/lib/galton'

const GRADES = ['strong', 'ok', 'weak'] as const
const LABELS = ['intro', 'project', 'technical', 'failure', 'why us', 'relocate', 'questions', 'close']

interface Ball { x: number; y: number; speed: number; path: number[]; bin: number; done: boolean; hero: boolean }

export function GaltonBoard() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [grades, setGrades] = useState<Array<'strong' | 'ok' | 'weak'>>(['strong', 'ok', 'weak', 'ok', 'strong', 'weak', 'ok', 'strong'])
  const [, setDropped] = useState<number[]>(new Array(9).fill(0))
  const bins = useRef<number[]>(new Array(9).fill(0))
  const [hero, setHero] = useState<{ score: number; path: number[] } | null>(null)
  const balls = useRef<Ball[]>([])

  const rows: Row[] = useMemo(() => ROWS_FROM_SCORES(grades, LABELS), [grades])
  const exact = useMemo(() => analytic(rows), [rows])

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0

    const layout = (w: number, h: number) => {
      const top = 46
      const rowGap = (h - 130) / (rows.length + 1)
      const spacing = w / (rows.length + 3)
      return { top, rowGap, spacing }
    }

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      if (canvas.width !== Math.floor(rect.width * dpr)) {
        canvas.width = Math.floor(rect.width * dpr)
        canvas.height = Math.floor(rect.height * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const w = rect.width
      const h = rect.height
      const { top, rowGap, spacing } = layout(w, h)
      ctx.clearRect(0, 0, w, h)

      // bins
      const binW = w / 9
      const counts = bins.current
      const maxCount = Math.max(1, ...counts, ...exact.map((p) => p * 40))
      for (let i = 0; i < 9; i++) {
        const bh = (counts[i] / maxCount) * 70
        ctx.fillStyle = band(i, rows.length) === 'offer' ? 'rgba(14,140,106,0.85)' : band(i, rows.length) === 'borderline' ? 'rgba(245,176,27,0.85)' : 'rgba(190,18,60,0.8)'
        ctx.fillRect(i * binW + 3, h - 30 - bh, binW - 6, bh)
        // exact distribution as an outline
        const eh = (exact[i] * 40 / maxCount) * 70
        ctx.strokeStyle = 'rgba(18,21,26,0.45)'
        ctx.setLineDash([3, 3])
        ctx.strokeRect(i * binW + 3, h - 30 - eh, binW - 6, eh)
        ctx.setLineDash([])
        ctx.fillStyle = 'rgba(18,21,26,0.55)'
        ctx.font = '700 8px "JetBrains Mono", monospace'
        ctx.fillText(String(counts[i] || ''), i * binW + binW / 2 - 4, h - 34 - bh)
      }

      // pegs, one row per answer
      rows.forEach((row, r) => {
        const y = top + r * rowGap
        const count = r + 2
        for (let k = 0; k < count; k++) {
          const x = w / 2 + (k - (count - 1) / 2) * spacing
          ctx.beginPath()
          ctx.arc(x, y, 4.5, 0, Math.PI * 2)
          ctx.fillStyle = row.grade === 'strong' ? '#0e8c6a' : row.grade === 'ok' ? '#c9a227' : '#be123c'
          ctx.fill()
          ctx.strokeStyle = '#12151a'
          ctx.lineWidth = 1.4
          ctx.stroke()
        }
        ctx.fillStyle = 'rgba(18,21,26,0.5)'
        ctx.font = '700 8px "JetBrains Mono", monospace'
        ctx.fillText(`${row.label} · p=${row.p.toFixed(2)}`, 8, y + 3)
      })

      // balls: each one follows a path decided at drop time, so it cannot stall
      balls.current = balls.current.filter((b) => !b.done)
      for (const b of balls.current) {
        b.y += b.speed
        const progress = Math.max(0, Math.min(1, (b.y - top) / ((rows.length + 1) * rowGap)))
        const seg = progress * b.path.length
        const i = Math.min(b.path.length - 1, Math.floor(seg))
        const frac = seg - i
        const from = i === 0 ? w / 2 : b.path[i - 1]
        b.x = from + (b.path[i] - from) * frac

        if (b.y > h - 34) {
          b.done = true
          if (!b.hero) {
            // counts live in a ref: setting state inside the animation loop
            // restarts the effect and the board thrashes
            bins.current[b.bin] = (bins.current[b.bin] ?? 0) + 1
            if (bins.current.reduce((a, c) => a + c, 0) % 20 === 0) setDropped([...bins.current])
          }
        }
        ctx.beginPath()
        ctx.arc(b.x, Math.min(b.y, h - 36), b.hero ? 5 : 2.6, 0, Math.PI * 2)
        ctx.fillStyle = b.hero ? '#ff4b26' : 'rgba(18,21,26,0.55)'
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [rows, exact])

  const drop = (n: number) => {
    const w = ref.current?.getBoundingClientRect().width ?? 600
    const spacing = w / (rows.length + 3)

    // a batch is simulated at once — the falling balls are only the visible
    // few, so the pile is complete the moment you press the button
    if (n > 1) {
      for (let i = 0; i < n; i++) {
        const r = dropOne(rows)
        bins.current[r.score] = (bins.current[r.score] ?? 0) + 1
      }
      setDropped([...bins.current])
      n = Math.min(24, n)
    }

    for (let i = 0; i < n; i++) {
      const r = dropOne(rows)
      let score = 0
      const path = r.path.map((step, row) => {
        if (step.side === 'right') score++
        const count = row + 2
        return w / 2 + (step.side === 'right' ? 1 : -1) * spacing * (count / 2)
      })
      balls.current.push({ x: w / 2, y: 18 + Math.random() * 10, speed: 1.6 + Math.random() * 1.4, path, bin: score, done: false, hero: n === 1 })
      if (n === 1) setHero({ score: r.score, path: path.map((_, i2) => i2) })
    }
  }

  const reset = () => { balls.current = []; bins.current = new Array(9).fill(0); setDropped(new Array(9).fill(0)); setHero(null) }

  const cycle = (i: number) => {
    setGrades((g) => {
      const n = [...g]
      n[i] = GRADES[(GRADES.indexOf(n[i]) + 1) % 3]
      return n
    })
  }

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <canvas ref={ref} className="h-full w-full" aria-label="Galton board of hiring" />
      <div className="flex flex-wrap items-center justify-center gap-2 border-t-2 border-ink bg-paper px-3 py-2">
        <button type="button" onClick={() => drop(1)} className="rounded-lg border-2 border-ink bg-c1 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_var(--color-ink)]">
          drop one
        </button>
        <button type="button" onClick={() => drop(120)} className="rounded-lg border-2 border-ink bg-card px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]">
          drop 120
        </button>
        <button type="button" onClick={reset} className="rounded-lg border-2 border-ink bg-card px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]">
          reset
        </button>
        <div className="flex flex-wrap gap-1">
          {grades.map((g, i) => (
            <button key={i} type="button" onClick={() => cycle(i)}
              className={`rounded border-2 border-ink px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase ${g === 'strong' ? 'bg-c2' : g === 'ok' ? 'bg-c3' : 'bg-c1 text-white'}`}>
              {LABELS[i]}
            </button>
          ))}
        </div>
        <span className="chip bg-[#f4f2ea] border-line">
          {hero ? `your ball: ${hero.score} of 8 → ${band(hero.score, 8)}` : 'drop one ball to trace a single interview'}
        </span>
      </div>
    </div>
  )
}
