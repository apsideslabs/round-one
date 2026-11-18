import { useCallback, useEffect, useRef, useState } from 'react'
import { Shuffle, RotateCcw } from 'lucide-react'
import { makeCube, turn, isSolved, invert, scramble, notation, matrix3d, AXIS, LAYER, SIGN, type Cubie, type Face, type Move } from '@/lib/cube'

const SIZE = 64 // px per cubie
const GAP = 3
const COLOURS: Record<string, string> = {
  '1,0,0': '#e5484d', '-1,0,0': '#f5b01b',
  '0,1,0': '#f7f5ee', '0,-1,0': '#ffe066',
  '0,0,1': '#0e8c6a', '0,0,-1': '#2f5bff'
}

const FACES: Array<{ face: Face; key: string }> = [
  { face: 'U', key: 'u' }, { face: 'D', key: 'd' },
  { face: 'L', key: 'l' }, { face: 'R', key: 'r' },
  { face: 'F', key: 'f' }, { face: 'B', key: 'b' }
]

/** A cubie: a cube of six faces, coloured only where it faces outward. */
function CubieBox({ cubie, dim }: { cubie: Cubie; dim?: boolean }) {
  const faces: Array<{ normal: string; transform: string }> = [
    { normal: '1,0,0', transform: `rotateY(90deg) translateZ(${SIZE / 2}px)` },
    { normal: '-1,0,0', transform: `rotateY(-90deg) translateZ(${SIZE / 2}px)` },
    // CSS Y points down, so the +Y face is the one rotated by +90 about X
    { normal: '0,1,0', transform: `rotateX(90deg) translateZ(${SIZE / 2}px)` },
    { normal: '0,-1,0', transform: `rotateX(-90deg) translateZ(${SIZE / 2}px)` },
    { normal: '0,0,1', transform: `translateZ(${SIZE / 2}px)` },
    { normal: '0,0,-1', transform: `rotateY(180deg) translateZ(${SIZE / 2}px)` }
  ]
  const [x, y, z] = cubie.pos
  const home = cubie.home
  return (
    <div
      className="absolute left-1/2 top-1/2"
      style={{
        width: SIZE,
        height: SIZE,
        marginLeft: -SIZE / 2,
        marginTop: -SIZE / 2,
        transformStyle: 'preserve-3d',
        transform: `translate3d(${x * (SIZE + GAP)}px, ${-y * (SIZE + GAP)}px, ${z * (SIZE + GAP)}px) ${matrix3d(cubie.rot)}`,
        opacity: dim ? 0.55 : 1
      }}
    >
      {faces.map((f) => {
        const outward =
          (f.normal === '1,0,0' && home[0] === 1) || (f.normal === '-1,0,0' && home[0] === -1) ||
          (f.normal === '0,1,0' && home[1] === 1) || (f.normal === '0,-1,0' && home[1] === -1) ||
          (f.normal === '0,0,1' && home[2] === 1) || (f.normal === '0,0,-1' && home[2] === -1)
        return (
          <div
            key={f.normal}
            className="absolute inset-0 rounded-[7px] border-[1.5px] border-[#12151a]"
            style={{
              transform: f.transform,
              background: outward ? COLOURS[f.normal] : '#33383f',
              boxShadow: outward ? 'inset 0 0 12px rgba(0,0,0,0.25)' : 'inset 0 0 8px rgba(0,0,0,0.35)',
              backfaceVisibility: 'visible'
            }}
          />
        )
      })}
    </div>
  )
}

export function Rubik() {
  const [cube, setCube] = useState<Cubie[]>(() => makeCube())
  const [turning, setTurning] = useState<{ move: Move; angle: number } | null>(null)
  const [orbit, setOrbit] = useState({ x: -22, y: -34 })
  const [spin, setSpin] = useState({ vx: 0, vy: 0 })
  const [moves, setMoves] = useState(0)
  const [solved, setSolved] = useState(true)
  const [history, setHistory] = useState<Move[]>([])
  const drag = useRef<{ x: number; y: number; lx: number; ly: number; t: number } | null>(null)
  const queue = useRef<Move[]>([])
  const busy = useRef(false)

  /** One turn: animate the layer, then commit the model. */
  const doMove = useCallback((move: Move) => {
    if (busy.current) { queue.current.push(move); return }
    busy.current = true
    const sign = SIGN[move.face] * (move.prime ? -1 : 1)
    setTurning({ move, angle: 0 })
    requestAnimationFrame(() => requestAnimationFrame(() => setTurning({ move, angle: 90 * sign })))
    window.setTimeout(() => {
      setCube((c) => {
        const next = turn(c, move)
        setSolved(isSolved(next))
        return next
      })
      setHistory((h) => [...h, move])
      setMoves((m) => m + 1)
      setTurning(null)
      busy.current = false
      const q = queue.current.shift()
      if (q) doMove(q)
    }, 260)
  }, [])

  // keyboard: u/d/l/r/f/b, shift for prime
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      const found = FACES.find((f) => f.key === k)
      if (found) { e.preventDefault(); doMove({ face: found.face, prime: e.shiftKey }) }
      if (k === ' ') { e.preventDefault(); shuffle() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // inertial orbit: keep spinning after release, decaying to rest
  useEffect(() => {
    if (!spin.vx && !spin.vy) return
    let raf = 0
    const step = () => {
      setSpin((s) => {
        const vx = s.vx * 0.94
        const vy = s.vy * 0.94
        if (Math.abs(vx) < 0.02 && Math.abs(vy) < 0.02) return { vx: 0, vy: 0 }
        setOrbit((o) => ({ x: o.x - vy, y: o.y + vx }))
        return { vx, vy }
      })
      raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [spin.vx, spin.vy])

  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, t: performance.now() }
    setSpin({ vx: 0, vy: 0 })
  }
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.lx
    const dy = e.clientY - drag.current.ly
    drag.current.lx = e.clientX
    drag.current.ly = e.clientY
    setOrbit((o) => ({ x: o.x + dy * 0.5, y: o.y - dx * 0.5 }))
  }
  const onUp = () => {
    if (!drag.current) return
    const dx = drag.current.lx - drag.current.x
    const dy = drag.current.ly - drag.current.y
    setSpin({ vx: dx * 0.08, vy: dy * 0.08 })
    drag.current = null
  }

  const shuffle = () => {
    const s = scramble(22)
    s.forEach((m) => doMove(m))
  }
  const reset = () => {
    queue.current = []
    setCube(makeCube()); setSolved(true); setMoves(0); setHistory([]); setTurning(null)
  }
  const undo = () => {
    const last = history.at(-1)
    if (!last) return
    setHistory((h) => h.slice(0, -1))
    doMove(invert(last))
  }

  const turningCubies = turning ? cube.filter((c) => c.pos[AXIS[turning.move.face]] === LAYER[turning.move.face]) : []
  const axisVec: Record<0 | 1 | 2, string> = { 0: '1,0,0', 1: '0,1,0', 2: '0,0,1' }

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <div
        className="relative grid place-items-center overflow-hidden touch-none select-none"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        style={{ cursor: drag.current ? 'grabbing' : 'grab' }}
      >
        <div
          className="relative"
          style={{ width: 380, height: 380, perspective: 1500, perspectiveOrigin: '50% 50%' }}
        >
          <div
            className="absolute inset-0"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(${orbit.x}deg) rotateY(${orbit.y}deg)`,
              transition: drag.current ? 'none' : 'transform 120ms linear'
            }}
          >
            {/* the turning layer rides in its own rotating wrapper */}
            {turning && (
              <div
                className="absolute left-1/2 top-1/2"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotate3d(${axisVec[AXIS[turning.move.face]]}, ${turning.angle}deg)`,
                  transition: 'transform 240ms cubic-bezier(0.34, 1.35, 0.64, 1)'
                }}
              >
                {turningCubies.map((c) => (
                  <div key={c.id} style={{ transformStyle: 'preserve-3d' }}>
                    <CubieBox cubie={c} />
                  </div>
                ))}
              </div>
            )}
            {cube
              .filter((c) => !turningCubies.some((t) => t.id === c.id))
              .map((c) => (
                <CubieBox key={c.id} cubie={c} />
              ))}
          </div>
        </div>

        <div className="pointer-events-none absolute left-3 top-3 grid gap-0.5">
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3">drag to orbit · u d l r f b · shift for prime</span>
          <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3">space to scramble</span>
        </div>

        {solved && (
          <div className="pointer-events-none absolute right-4 top-4 rounded-sm border-4 border-[#0e8c6a] px-2.5 py-0.5 font-display text-sm font-extrabold uppercase tracking-[0.16em] text-[#0e8c6a]"
            style={{ background: 'rgba(255,252,245,0.9)', transform: 'rotate(-9deg)' }}>
            solved
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5 border-t-2 border-ink bg-paper px-3 py-2">
        {FACES.map((f) => (
          <div key={f.face} className="flex gap-1">
            <button type="button" onClick={() => doMove({ face: f.face, prime: false })}
              className="rounded-md border-2 border-ink bg-card px-2 py-0.5 font-mono text-[10px] font-bold uppercase shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 active:shadow-none">
              {f.face}
            </button>
            <button type="button" onClick={() => doMove({ face: f.face, prime: true })}
              className="rounded-md border-2 border-ink bg-[#f4f2ea] px-2 py-0.5 font-mono text-[10px] font-bold uppercase shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 active:shadow-none">
              {f.face}′
            </button>
          </div>
        ))}
        <span className="mx-1 h-4 w-px bg-ink/20" />
        <button type="button" onClick={shuffle} className="inline-flex items-center gap-1 rounded-md border-2 border-ink bg-c3 px-2 py-0.5 font-mono text-[10px] font-bold uppercase shadow-[2px_2px_0_var(--color-ink)]">
          <Shuffle className="h-3 w-3" /> scramble
        </button>
        <button type="button" onClick={undo} className="rounded-md border-2 border-ink bg-card px-2 py-0.5 font-mono text-[10px] font-bold uppercase shadow-[2px_2px_0_var(--color-ink)]">
          undo
        </button>
        <button type="button" onClick={reset} className="inline-flex items-center gap-1 rounded-md border-2 border-ink bg-card px-2 py-0.5 font-mono text-[10px] font-bold uppercase shadow-[2px_2px_0_var(--color-ink)]">
          <RotateCcw className="h-3 w-3" /> reset
        </button>
        <span className="chip bg-[#f4f2ea] border-line">{moves} moves</span>
        <span className="chip bg-[#f4f2ea] border-line">{history.length ? notation(history.at(-1)!) : '—'}</span>
      </div>
    </div>
  )
}
