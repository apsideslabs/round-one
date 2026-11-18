import { useEffect, useRef, useState } from 'react'
import { project } from '@/lib/iso'

interface Block { x: number; z: number; w: number; d: number; y: number; colour: string }
const H = 22

export function Stack() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [dead, setDead] = useState(false)
  const blocks = useRef<Block[]>([])
  const moving = useRef<{ x: number; z: number; w: number; d: number; axis: 'x' | 'z'; t: number } | null>(null)
  const cam = useRef(0)
  const deadRef = useRef(false)
  const scoreRef = useRef(0)

  const reset = () => {
    blocks.current = [{ x: 0, z: 0, w: 130, d: 130, y: 0, colour: '#2f5bff' }]
    moving.current = { x: 0, z: 0, w: 130, d: 130, axis: 'x', t: 0 }
    cam.current = 0
    deadRef.current = false
    scoreRef.current = 0
    setScore(0); setDead(false)
  }
  useEffect(() => { reset() }, [])

  const drop = () => {
    const m = moving.current
    const top = blocks.current.at(-1)
    if (!m || !top || deadRef.current) return
    const size = m.axis === 'x' ? top.w : top.d
    const gap = m.axis === 'x' ? Math.abs(m.x - top.x) : Math.abs(m.z - top.z)
    const kept = size - gap
    if (kept <= 8) {
      deadRef.current = true
      setDead(true)
      setBest((b) => Math.max(b, scoreRef.current))
      moving.current = null
      return
    }
    const nx = m.axis === 'x' ? (m.x + top.x) / 2 : top.x
    const nz = m.axis === 'z' ? (m.z + top.z) / 2 : top.z
    blocks.current.push({
      x: nx, z: nz,
      w: m.axis === 'x' ? kept : top.w,
      d: m.axis === 'z' ? kept : top.d,
      y: top.y + H,
      colour: ['#2f5bff', '#ff4b26', '#0e8c6a', '#f5b01b', '#be123c'][blocks.current.length % 5]
    })
    scoreRef.current += 1
    setScore(scoreRef.current)
    cam.current += H * 0.5
    const last = blocks.current.at(-1)!
    moving.current = { x: last.x, z: last.z, w: last.w, d: last.d, axis: blocks.current.length % 2 ? 'x' : 'z', t: 0 }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.code === 'Space') { e.preventDefault(); drop() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0
    let last = performance.now()

    const draw = (now: number) => {
      const dt = Math.min(50, now - last)
      last = now
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      if (canvas.width !== Math.floor(rect.width * dpr)) {
        canvas.width = Math.floor(rect.width * dpr)
        canvas.height = Math.floor(rect.height * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const w = rect.width
      const h = rect.height
      ctx.clearRect(0, 0, w, h)

      // ground shadow
      ctx.fillStyle = 'rgba(18,21,26,0.06)'
      ctx.beginPath()
      ctx.ellipse(w / 2, h * 0.82 + cam.current, 150, 46, 0, 0, Math.PI * 2)
      ctx.fill()

      const m = moving.current
      if (m && !deadRef.current) {
        m.t += dt * 0.0016
        const off = Math.sin(m.t * 2.2) * 130
        if (m.axis === 'x') m.x = off
        else m.z = off
      }

      const cx = w / 2
      const cy = h * 0.78 + cam.current
      const list: Block[] = m && !deadRef.current
        ? [...blocks.current, { x: m.x, z: m.z, w: m.w, d: m.d, y: blocks.current.at(-1)!.y + H, colour: '#ff4b26' }]
        : blocks.current

      const yaw = Math.PI / 6
      list.forEach((b) => {
        const hw = b.w / 2
        const hd = b.d / 2
        const corners = [
          { x: b.x - hw, z: b.z - hd }, { x: b.x + hw, z: b.z - hd },
          { x: b.x + hw, z: b.z + hd }, { x: b.x - hw, z: b.z + hd }
        ]
        const bot = corners.map((c) => project({ x: c.x, y: b.y, z: c.z }, yaw, 1, cx, cy))
        const top = corners.map((c) => project({ x: c.x, y: b.y + H, z: c.z }, yaw, 1, cx, cy))

        // right + front faces
        ctx.fillStyle = 'rgba(18,21,26,0.26)'
        ctx.beginPath()
        ctx.moveTo(bot[1].x, bot[1].y); ctx.lineTo(bot[2].x, bot[2].y)
        ctx.lineTo(top[2].x, top[2].y); ctx.lineTo(top[1].x, top[1].y)
        ctx.closePath(); ctx.fill()
        ctx.fillStyle = 'rgba(18,21,26,0.14)'
        ctx.beginPath()
        ctx.moveTo(bot[2].x, bot[2].y); ctx.lineTo(bot[3].x, bot[3].y)
        ctx.lineTo(top[3].x, top[3].y); ctx.lineTo(top[2].x, top[2].y)
        ctx.closePath(); ctx.fill()

        ctx.fillStyle = b.colour
        ctx.strokeStyle = '#12151a'
        ctx.lineWidth = 2
        ctx.beginPath()
        top.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)))
        ctx.closePath(); ctx.fill(); ctx.stroke()
      })

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <div className="relative">
        <canvas ref={ref} className="h-full w-full" />
        <div className="pointer-events-none absolute left-3 top-3 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-3">
          {score} blocks · best {best}
        </div>
        {dead && (
          <div className="absolute inset-0 grid place-items-center bg-paper/75">
            <div className="rounded-xl border-2 border-ink bg-card px-4 py-3 text-center shadow-[3px_3px_0_var(--color-ink)]">
              <p className="font-display text-lg font-extrabold">Tower fell at {score}</p>
              <button type="button" onClick={reset} className="mt-1.5 rounded-lg border-2 border-ink bg-c1 px-3 py-1 font-mono text-[9px] font-bold uppercase text-white shadow-[2px_2px_0_var(--color-ink)]">stack again</button>
            </div>
          </div>
        )}
      </div>
      <div className="border-t-2 border-ink bg-paper px-3 py-2 text-center">
        <button type="button" onClick={drop} disabled={dead}
          className="rounded-lg border-2 border-ink bg-c2 px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider shadow-[3px_3px_0_var(--color-ink)] active:translate-y-0.5 active:shadow-none">
          drop · space
        </button>
        <span className="ml-3 font-mono text-[9px] uppercase tracking-wider text-ink-3">the overhang is sliced off — keep it narrow</span>
      </div>
    </div>
  )
}
