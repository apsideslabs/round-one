import { useEffect, useRef, useState } from 'react'

/** Bubble vs merge on the same data, counting comparisons. */
function bubble(arr: number[]) {
  const a = [...arr]
  let comparisons = 0
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < a.length - i - 1; j++) {
      comparisons++
      if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]]
    }
  return comparisons
}

function merge(arr: number[]) {
  let comparisons = 0
  const sort = (a: number[]): number[] => {
    if (a.length <= 1) return a
    const mid = a.length >> 1
    const l = sort(a.slice(0, mid))
    const r = sort(a.slice(mid))
    const out: number[] = []
    let i = 0
    let j = 0
    while (i < l.length && j < r.length) {
      comparisons++
      out.push(l[i] <= r[j] ? l[i++] : r[j++])
    }
    return [...out, ...l.slice(i), ...r.slice(j)]
  }
  sort(arr)
  return comparisons
}

export function SortingRace() {
  const [n, setN] = useState(24)
  const [seed, setSeed] = useState(7)
  const ref = useRef<HTMLCanvasElement>(null)

  const data = Array.from({ length: n }, (_, i) => ((i * 37 + seed * 53) % 100) + 5)
  const bubbleCount = bubble(data)
  const mergeCount = merge(data)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, rect.width, rect.height)

    const draw = (values: number[], offsetX: number, width: number, colour: string, label: string) => {
      const max = Math.max(...values)
      const bw = width / values.length
      values.forEach((v, i) => {
        const h = (v / max) * (rect.height - 70)
        ctx.fillStyle = colour
        ctx.fillRect(offsetX + i * bw + 1, rect.height - 40 - h, bw - 2, h)
        ctx.strokeStyle = '#12151a'
        ctx.lineWidth = 1
        ctx.strokeRect(offsetX + i * bw + 1, rect.height - 40 - h, bw - 2, h)
      })
      ctx.fillStyle = '#12151a'
      ctx.font = '700 11px "JetBrains Mono", monospace'
      ctx.fillText(label, offsetX, rect.height - 18)
    }

    const half = rect.width / 2
    draw(data, 10, half - 20, '#ff4b26', `bubble · ${bubbleCount} comparisons`)
    draw([...data].sort((a, b) => a - b), half + 10, half - 20, '#0e8c6a', `merge · ${mergeCount} comparisons`)
  }, [n, seed, bubbleCount, mergeCount, data])

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <canvas ref={ref} className="h-full w-full" aria-label="Sorting comparison counts" />
      <div className="flex flex-wrap items-center justify-center gap-3 border-t-2 border-ink bg-paper px-3 py-2">
        <label className="flex items-center gap-1.5">
          <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-ink-3">n</span>
          <input type="range" min={8} max={64} step={4} value={n} onChange={(e) => setN(Number(e.target.value))} className="w-32 accent-[#ff4b26]" />
          <span className="font-mono text-[10px] font-bold tabular-nums">{n}</span>
        </label>
        <button type="button" onClick={() => setSeed((s) => s + 1)} className="rounded-lg border-2 border-ink bg-card px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]">
          reshuffle
        </button>
        <span className="chip bg-[#f4f2ea] border-line">
          bubble O(n²) ≈ {(n * (n - 1)) / 2} worst · merge O(n log n) ≈ {Math.round(n * Math.log2(n))}
        </span>
      </div>
    </div>
  )
}
