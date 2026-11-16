import { useMemo, useRef, useState } from 'react'

/**
 * Syllogisms as geometry, not prose. Each premise is an exact set relation, and
 * a circle arrangement either satisfies it or does not:
 *   all  A ⊆ B   — every point of A inside B
 *   some A ∩ B   — they overlap, neither swallows the other
 *   no   A ∩ B = ∅
 * Drag the rings. If an arrangement satisfies both premises while breaking the
 * conclusion, you have found a counterexample and the argument is invalid.
 */
type Relation = 'all' | 'some' | 'no'

interface Ring { id: 'A' | 'B' | 'C'; x: number; y: number; r: number; colour: string }

interface Puzzle { subject: 'A' | 'B' | 'C'; middle: 'A' | 'B' | 'C'; predicate: 'A' | 'B' | 'C'; p1: Relation; p2: Relation; conclusion: Relation; valid: boolean; label: string }

const PUZZLES: Puzzle[] = [
  { subject: 'A', middle: 'B', predicate: 'C', p1: 'all', p2: 'all', conclusion: 'all', valid: true, label: 'A ⊆ B, B ⊆ C ⊢ A ⊆ C' },
  { subject: 'A', middle: 'B', predicate: 'C', p1: 'all', p2: 'some', conclusion: 'some', valid: false, label: 'A ⊆ B, some B are C ⊢ some A are C' },
  { subject: 'A', middle: 'B', predicate: 'C', p1: 'no', p2: 'all', conclusion: 'no', valid: true, label: 'no A is B, C ⊆ B ⊢ no A is C' }
]

const dist = (p: Ring, q: Ring) => Math.hypot(p.x - q.x, p.y - q.y)

function holds(rel: Relation, p: Ring, q: Ring): boolean {
  const d = dist(p, q)
  const inside = (a: Ring, b: Ring) => d + a.r <= b.r + 0.5
  const disjoint = d >= p.r + q.r - 0.5
  const overlapNotContained = !disjoint && !inside(p, q) && !inside(q, p)
  if (rel === 'all') return inside(p, q)
  if (rel === 'no') return disjoint
  return overlapNotContained
}

export function SetLogic() {
  const [puzzle, setPuzzle] = useState(0)
  const [rings, setRings] = useState<Ring[]>([
    { id: 'A', x: 210, y: 210, r: 52, colour: '#ff4b26' },
    { id: 'B', x: 260, y: 260, r: 84, colour: '#2f5bff' },
    { id: 'C', x: 340, y: 250, r: 96, colour: '#f5b01b' }
  ])
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const p = PUZZLES[puzzle]
  const byId = (id: 'A' | 'B' | 'C') => rings.find((r) => r.id === id)!

  const premisesOk = holds(p.p1, byId(p.subject), byId(p.middle)) && holds(p.p2, byId(p.middle), byId(p.predicate))
  const conclusionOk = holds(p.conclusion, byId(p.subject), byId(p.predicate))
  const counterexample = premisesOk && !conclusionOk

  const status = useMemo(() => {
    if (!premisesOk) return { tone: 'idle', text: 'arrangement does not satisfy the premises yet' }
    if (counterexample) return { tone: 'bad', text: 'counterexample — premises true, conclusion false, so the argument is invalid' }
    return { tone: 'good', text: 'consistent — conclusion holds here (this does not prove validity)' }
  }, [premisesOk, counterexample])

  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || !svgRef.current) return
    const box = svgRef.current.getBoundingClientRect()
    const x = ((e.clientX - box.left) / box.width) * 480
    const y = ((e.clientY - box.top) / box.height) * 480
    setRings((prev) => prev.map((r) => (r.id === drag.current!.id ? { ...r, x: x - drag.current!.dx, y: y - drag.current!.dy } : r)))
  }

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <svg
        ref={svgRef}
        viewBox="0 0 480 480"
        className="h-full w-full touch-none"
        onPointerMove={onMove}
        onPointerUp={() => (drag.current = null)}
        onPointerLeave={() => (drag.current = null)}
      >
        {rings.map((ring) => (
          <g key={ring.id}>
            <circle
              cx={ring.x}
              cy={ring.y}
              r={ring.r}
              fill={ring.colour}
              fillOpacity={0.16}
              stroke={ring.colour}
              strokeWidth={4}
              className="cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => {
                const box = svgRef.current!.getBoundingClientRect()
                const x = ((e.clientX - box.left) / box.width) * 480
                const y = ((e.clientY - box.top) / box.height) * 480
                drag.current = { id: ring.id, dx: x - ring.x, dy: y - ring.y }
              }}
            />
            <text x={ring.x} y={ring.y + 6} textAnchor="middle" fontSize="22" fontWeight="800" fill="#12151a" pointerEvents="none">
              {ring.id}
            </text>
          </g>
        ))}

        {/* the claim being tested, drawn as a dashed link */}
        <line
          x1={byId(p.subject).x}
          y1={byId(p.subject).y}
          x2={byId(p.predicate).x}
          y2={byId(p.predicate).y}
          stroke={counterexample ? '#be123c' : 'rgba(18,21,26,0.25)'}
          strokeWidth={2}
          strokeDasharray="6 6"
        />
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-2 border-t-2 border-ink bg-paper px-3 py-2">
        <div className="flex gap-1.5">
          {PUZZLES.map((item, i) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setPuzzle(i)}
              className={`rounded-lg border-2 border-ink px-2 py-1 font-mono text-[8.5px] font-bold uppercase tracking-wider ${puzzle === i ? 'bg-c1 text-white' : 'bg-card'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <span className="chip bg-[#f4f2ea] border-line">
          {p.label}
        </span>

        <span
          className={`chip ${
            status.tone === 'bad' ? 'bg-c1-soft text-bad' : status.tone === 'good' ? 'bg-c2-soft text-ok' : 'bg-[#f4f2ea] border-line'
          }`}
        >
          {status.text}
        </span>

        <span className={`chip ${premisesOk ? 'bg-c2-soft' : 'bg-[#f4f2ea] border-line'}`}>
          premises {premisesOk ? 'true' : 'false'} · conclusion {conclusionOk ? 'true' : 'false'}
        </span>
      </div>
    </div>
  )
}
