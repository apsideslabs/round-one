import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'

export interface CarouselItem {
  id: string
  title: string
  tagline: string
  meta: string
  path: string
  colour: string
  soft: string
  ink: string
  best?: number
}

interface Props {
  items: CarouselItem[]
  /** Distance from the centre of the ring, in px. */
  radius?: number
  cardWidth?: number
  cardHeight?: number
}

/**
 * A CSS-3D ring you can spin. No three.js, no canvas — just transforms, so it
 * costs nothing in bundle size and stays crisp at any zoom.
 */
export function Carousel3D({ items, radius = 320, cardWidth = 250, cardHeight = 300 }: Props) {
  const [angle, setAngle] = useState(0)
  const [dragging, setDragging] = useState(false)
  const drag = useRef<{ startX: number; startAngle: number } | null>(null)
  const step = 360 / items.length


  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true)
    drag.current = { startX: e.clientX, startAngle: angle }
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    setAngle(drag.current.startAngle + (e.clientX - drag.current.startX) * 0.4)
  }
  const endDrag = () => {
    if (!drag.current) return
    // settle onto the nearest card
    setAngle((a) => Math.round(a / step) * step)
    drag.current = null
    setDragging(false)
  }

  const nudge = (dir: 1 | -1) => {
    setAngle((a) => Math.round(a / step) * step + dir * -step)
  }

  /** Index of the card currently facing the viewer. */
  const front = ((Math.round(-angle / step) % items.length) + items.length) % items.length

  return (
    <div className="relative w-full select-none">
      <button
        type="button"
        onClick={() => nudge(1)}
        aria-label="Previous game"
        className="absolute left-0 top-[42%] z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg border-2 border-ink bg-card shadow-[3px_3px_0_var(--color-ink)] hover:-translate-y-[calc(50%+1px)]"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => nudge(-1)}
        aria-label="Next game"
        className="absolute right-0 top-[42%] z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg border-2 border-ink bg-card shadow-[3px_3px_0_var(--color-ink)] hover:-translate-y-[calc(50%+1px)]"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <div
        className="relative mx-auto origin-center scale-[0.6] touch-pan-y sm:scale-100 [--ring-h:250px] sm:[--ring-h:390px]"
        style={{ height: 'var(--ring-h)', perspective: 1200, perspectiveOrigin: '50% 45%' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translate(-50%, -50%) rotateX(-6deg) rotateY(${angle}deg)`,
            transition: dragging ? 'none' : 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)'
          }}
        >
          {items.map((item, i) => {
            const isFront = i === front
            return (
              <div
                key={item.id}
                className="absolute"
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  left: -cardWidth / 2,
                  top: -cardHeight / 2,
                  transform: `rotateY(${i * step}deg) translateZ(${radius}px)`,
                  backfaceVisibility: 'hidden'
                }}
              >
                <Link
                  to={item.path}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border-2 border-ink shadow-[6px_6px_0_var(--color-ink)]"
                  style={{
                    background: 'var(--color-card)',
                    opacity: isFront ? 1 : 0.4,
                    filter: isFront ? 'none' : 'grayscale(0.35)',
                    transform: isFront ? 'scale(1)' : 'scale(0.92)',
                    transition: 'opacity 0.3s ease, transform 0.3s ease, filter 0.3s ease',
                    pointerEvents: isFront ? 'auto' : 'none'
                  }}
                  tabIndex={isFront ? 0 : -1}
                >
                  <div className="flex items-center justify-between gap-2 border-b-2 border-ink px-3 py-2.5" style={{ background: item.colour, color: item.ink }}>
                    <span className="font-mono text-[8.5px] font-bold uppercase tracking-wider">{item.meta}</span>
                    <span className="font-mono text-[8.5px] font-bold uppercase tracking-wider opacity-90">
                      {item.best ? `best ${item.best}` : 'new'}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5 p-4">
                    <span className="font-display text-xl font-extrabold leading-tight tracking-tight">{item.title}</span>
                    <span className="text-[13px] font-medium leading-relaxed text-ink-2">{item.tagline}</span>
                    <span className="mt-auto inline-flex items-center gap-1.5 font-mono text-[9px] font-bold uppercase tracking-wider">
                      Open <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </div>
            )
          })}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center">
        <span className="chip bg-[#f4f2ea] border-line">
          {items[front]?.title ?? ''} · {front + 1}/{items.length}
        </span>
      </div>
    </div>
  )
}
