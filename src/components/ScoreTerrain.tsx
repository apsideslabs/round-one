import { useEffect, useRef } from 'react'
import { tracks, type TrackId } from '@/data/tracks'
import type { Scores } from '@/store/progress'
import { pct } from '@/lib/utils'

/**
 * A real 3D render, no library: six towers on a ground plane, projected by
 * hand (rotate → perspective divide), drag to orbit. Height is your score.
 */
export function ScoreTerrain({ scores, height = 340 }: { scores: Scores; height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const yaw = useRef(-0.6)
  const pitch = useRef(0.42)
  const dragging = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null)
  const raf = useRef(0)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let w = 0
    let h = 0

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const FOCAL = 900
    const SPACING = 96

    const project = (x: number, y: number, z: number) => {
      const cy = Math.cos(yaw.current)
      const sy = Math.sin(yaw.current)
      const rx = x * cy - z * sy
      const rz = x * sy + z * cy

      const cp = Math.cos(pitch.current)
      const sp = Math.sin(pitch.current)
      const ry = y * cp - rz * sp
      const rz2 = y * sp + rz * cp

      const depth = rz2 + 760
      const scale = FOCAL / Math.max(120, depth)
      return { x: w / 2 + rx * scale, y: h * 0.68 - ry * scale, scale, depth }
    }

    const values = tracks.map((t) => pct(scores[t.id as TrackId] ?? 0, t.max) / 100)

    const draw = () => {
      if (!reduced) yaw.current += 0.0016
      ctx.clearRect(0, 0, w, h)

      // ground grid
      ctx.strokeStyle = 'rgba(18,21,26,0.14)'
      ctx.lineWidth = 1
      for (let i = -3; i <= 3; i++) {
        const a = project(i * SPACING, 0, -3 * SPACING)
        const b = project(i * SPACING, 0, 3 * SPACING)
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()

        const c = project(-3 * SPACING, 0, i * SPACING)
        const d = project(3 * SPACING, 0, i * SPACING)
        ctx.beginPath()
        ctx.moveTo(c.x, c.y)
        ctx.lineTo(d.x, d.y)
        ctx.stroke()
      }

      // towers, painted back to front
      const towers = tracks.map((t, i) => {
        const x = (i - (tracks.length - 1) / 2) * SPACING
        const z = 0
        const value = Math.max(0.04, values[i])
        const hgt = 28 + value * 132
        return { t, x, z, hgt, value, depth: project(x, 0, z).depth }
      })
      towers.sort((a, b) => b.depth - a.depth)

      const half = 26
      for (const { t, x, z, hgt, value } of towers) {
        const base = project(x, 0, z)
        const top = project(x, hgt, z)
        const w1 = project(x - half, 0, z)
        const w2 = project(x + half, 0, z)
        const t1 = project(x - half, hgt, z)
        const t2 = project(x + half, hgt, z)
        const front = project(x, hgt, z + half)
        const frontBase = project(x, 0, z + half)
        const front1 = project(x - half, hgt, z + half)
        const front2 = project(x + half, hgt, z + half)

        // shadow
        ctx.fillStyle = 'rgba(18,21,26,0.10)'
        ctx.beginPath()
        ctx.ellipse(base.x, base.y, 34 * base.scale, 12 * base.scale, 0, 0, Math.PI * 2)
        ctx.fill()

        // left face
        ctx.fillStyle = t.colour
        ctx.globalAlpha = 0.55
        ctx.beginPath()
        ctx.moveTo(w1.x, w1.y)
        ctx.lineTo(base.x, base.y)
        ctx.lineTo(top.x, top.y)
        ctx.lineTo(t1.x, t1.y)
        ctx.closePath()
        ctx.fill()

        // right face
        ctx.globalAlpha = 0.78
        ctx.beginPath()
        ctx.moveTo(base.x, base.y)
        ctx.lineTo(w2.x, w2.y)
        ctx.lineTo(t2.x, t2.y)
        ctx.lineTo(top.x, top.y)
        ctx.closePath()
        ctx.fill()

        // front face (facing camera)
        ctx.globalAlpha = 1
        ctx.fillStyle = t.colour
        ctx.beginPath()
        ctx.moveTo(w1.x, w1.y)
        ctx.lineTo(w2.x, w2.y)
        ctx.lineTo(front2.x, front2.y)
        ctx.lineTo(front1.x, front1.y)
        ctx.closePath()
        ctx.fill()

        // cap
        ctx.globalAlpha = 0.95
        ctx.fillStyle = '#fffcf5'
        ctx.strokeStyle = t.colour
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(front1.x, front1.y)
        ctx.lineTo(front2.x, front2.y)
        ctx.lineTo(t2.x, t2.y)
        ctx.lineTo(t1.x, t1.y)
        ctx.closePath()
        ctx.fill()
        ctx.stroke()

        // fill level marker
        if (value > 0.02) {
          ctx.globalAlpha = 0.9
          ctx.fillStyle = 'rgba(255,252,245,0.9)'
          const marker = project(x, hgt * value, z + half + 1)
          ctx.beginPath()
          ctx.arc(marker.x, marker.y, 3.2 * marker.scale, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
        void front
        void frontBase
      }

      raf.current = requestAnimationFrame(draw)
    }

    raf.current = requestAnimationFrame(draw)

    const onDown = (e: PointerEvent) => {
      dragging.current = { x: e.clientX, y: e.clientY, yaw: yaw.current, pitch: pitch.current }
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      yaw.current = dragging.current.yaw + (e.clientX - dragging.current.x) * 0.008
      pitch.current = Math.max(0.12, Math.min(0.9, dragging.current.pitch + (e.clientY - dragging.current.y) * 0.004))
    }
    const onUp = () => {
      dragging.current = null
    }

    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointerleave', onUp)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf.current)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointerleave', onUp)
      window.removeEventListener('resize', resize)
    }
  }, [scores])

  return (
    <div className="relative w-full" style={{ height }}>
      <canvas ref={ref} className="h-full w-full cursor-grab touch-none active:cursor-grabbing" aria-label="Your scores as a 3D terrain" />
      <div className="pointer-events-none absolute bottom-2 left-3 flex flex-wrap gap-2">
        {tracks.map((t) => (
          <span key={t.id} className="inline-flex items-center gap-1.5 rounded-full border border-ink/20 bg-card/85 px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider">
            <span className="h-2 w-2 rounded-[2px]" style={{ background: t.colour }} />
            {t.short} {pct(scores[t.id] ?? 0, t.max)}%
          </span>
        ))}
      </div>
      <span className="pointer-events-none absolute right-3 top-2 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-ink-3">
        drag to orbit
      </span>
    </div>
  )
}
