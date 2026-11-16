import { useEffect, useRef } from 'react'

/**
 * A drifting field of dots behind the hero. Drawn on a canvas, generated at
 * runtime — no images, no video, no network. Pauses when the tab is hidden or
 * the user asked for reduced motion.
 */
export function HeroCanvas({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const raf = useRef(0)
  const pointer = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const COLOURS = ['#ff4b26', '#0e8c6a', '#f5b01b', '#2f5bff', '#be123c', '#0e7490']

    let w = 0
    let h = 0
    const dpr = Math.min(2, window.devicePixelRatio || 1)

    type Dot = { x: number; y: number; r: number; phase: number; speed: number; amp: number; colour: string }
    let dots: Dot[] = []

    const build = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.max(40, Math.min(150, Math.round((w * h) / 9000)))
      dots = Array.from({ length: count }, (_, i) => ({
        x: (i / count) * w + ((i * 37) % 24),
        y: (i * 53) % h,
        r: 1.6 + ((i * 7) % 12) / 6,
        phase: (i * 0.7) % (Math.PI * 2),
        speed: 0.5 + ((i * 13) % 9) / 10,
        amp: 10 + ((i * 5) % 22),
        colour: COLOURS[i % COLOURS.length]
      }))
    }

    build()

    const draw = (time: number) => {
      const t = time / 1000
      ctx.clearRect(0, 0, w, h)

      for (const d of dots) {
        const wobble = Math.sin(t * d.speed + d.phase) * d.amp
        let x = d.x + wobble * 0.35
        let y = d.y + wobble * 0.5

        const p = pointer.current
        if (p) {
          const dx = x - p.x
          const dy = y - p.y
          const dist = Math.hypot(dx, dy)
          if (dist < 120 && dist > 0.01) {
            const push = (120 - dist) / 120
            x += (dx / dist) * push * 16
            y += (dy / dist) * push * 16
          }
        }

        ctx.globalAlpha = 0.45 + Math.abs(Math.sin(t * d.speed * 0.7 + d.phase)) * 0.55
        ctx.fillStyle = d.colour
        ctx.beginPath()
        ctx.arc(x, y, d.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
      raf.current = requestAnimationFrame(draw)
    }

    if (reduced) {
      // one static frame, still a graphic, just not a moving one
      draw(0)
      cancelAnimationFrame(raf.current)
    } else {
      raf.current = requestAnimationFrame(draw)
    }

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      pointer.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onLeave = () => {
      pointer.current = null
    }
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf.current)
      } else if (!reduced) {
        raf.current = requestAnimationFrame(draw)
      }
    }

    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('resize', build)

    return () => {
      cancelAnimationFrame(raf.current)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', build)
    }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
