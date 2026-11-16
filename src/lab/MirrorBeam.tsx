import { useEffect, useRef, useState } from 'react'

/** Drag the mirror until the beam hits the target. Angles update live. */
export function MirrorBeam() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [angle, setAngle] = useState(0.9)
  const [hit, setHit] = useState(false)
  const dragging = useRef(false)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf = 0

    const draw = (t: number) => {
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

      // grid
      ctx.strokeStyle = 'rgba(18,21,26,0.08)'
      ctx.lineWidth = 1
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
      }
      for (let y = 0; y < h; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      }

      const src = { x: 60, y: h * 0.5 }
      const mirror = { x: w * 0.52, y: h * 0.5 }
      const target = { x: w - 80, y: h * 0.32 }

      // incoming beam
      ctx.strokeStyle = '#ff4b26'
      ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(src.x, src.y); ctx.lineTo(mirror.x, mirror.y); ctx.stroke()

      // mirror
      const len = 62
      const dx = Math.cos(angle) * len
      const dy = Math.sin(angle) * len
      ctx.strokeStyle = '#12151a'
      ctx.lineWidth = 7
      ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(mirror.x - dx, mirror.y - dy); ctx.lineTo(mirror.x + dx, mirror.y + dy); ctx.stroke()

      // reflection: reflect the incoming direction about the mirror normal
      const inDir = { x: mirror.x - src.x, y: mirror.y - src.y }
      const n = { x: -Math.sin(angle), y: Math.cos(angle) }
      const dot = inDir.x * n.x + inDir.y * n.y
      const refl = { x: inDir.x - 2 * dot * n.x, y: inDir.y - 2 * dot * n.y }
      const mag = Math.hypot(refl.x, refl.y) || 1
      const dir = { x: refl.x / mag, y: refl.y / mag }

      // does the ray pass near the target?
      const toT = { x: target.x - mirror.x, y: target.y - mirror.y }
      const cross = Math.abs(toT.x * dir.y - toT.y * dir.x)
      const along = toT.x * dir.x + toT.y * dir.y
      const onTarget = along > 0 && cross < 22
      if (onTarget !== hit) setHit(onTarget)

      // draw reflected ray
      ctx.strokeStyle = onTarget ? '#0e8c6a' : '#ff4b26'
      ctx.lineWidth = onTarget ? 4 : 3
      ctx.beginPath()
      ctx.moveTo(mirror.x, mirror.y)
      ctx.lineTo(mirror.x + dir.x * w, mirror.y + dir.y * w)
      ctx.stroke()

      // angle arc
      ctx.strokeStyle = 'rgba(18,21,26,0.35)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.arc(mirror.x, mirror.y, 40, Math.atan2(inDir.y, inDir.x), Math.atan2(dir.y, dir.x), false)
      ctx.stroke()

      // target
      ctx.beginPath()
      ctx.arc(target.x, target.y, onTarget ? 15 : 12, 0, Math.PI * 2)
      ctx.fillStyle = onTarget ? '#0e8c6a' : '#f5b01b'
      ctx.fill()
      ctx.strokeStyle = '#12151a'
      ctx.lineWidth = 2
      ctx.stroke()

      // source
      ctx.beginPath(); ctx.arc(src.x, src.y, 8, 0, Math.PI * 2)
      ctx.fillStyle = '#12151a'; ctx.fill()

      // glow particles on a hit
      if (onTarget) {
        for (let i = 0; i < 8; i++) {
          const p = (t / 600 + i / 8) % 1
          ctx.globalAlpha = 1 - p
          ctx.beginPath()
          ctx.arc(target.x + Math.cos(i) * 22 * p, target.y + Math.sin(i) * 22 * p, 3 * (1 - p), 0, Math.PI * 2)
          ctx.fillStyle = '#0e8c6a'
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)

    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      const rect = canvas.getBoundingClientRect()
      const mx = rect.width * 0.52
      const my = rect.height * 0.5
      setAngle(Math.atan2(e.clientY - rect.top - my, e.clientX - rect.left - mx))
    }
    const down = () => { dragging.current = true }
    const up = () => { dragging.current = false }

    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointerleave', up)
    return () => {
      cancelAnimationFrame(raf)
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointerleave', up)
    }
  }, [angle, hit])

  return (
    <canvas
      ref={ref}
      className="h-full w-full cursor-grab touch-none active:cursor-grabbing"
      aria-label="Drag the mirror to steer the beam into the target"
    />
  )
}
