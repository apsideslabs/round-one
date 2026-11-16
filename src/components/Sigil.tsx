import { sigilPath, sigilPoints, sigilSeed } from '@/lib/sigil'
import type { Scores } from '@/store/progress'

/**
 * Your readiness as a mark, not a number. Each lobe is a round; the reach of
 * the lobe is how far you have got in it.
 */
export function Sigil({ scores, size = 120, showRings = true }: { scores: Scores; size?: number; showRings?: boolean }) {
  const points = sigilPoints(scores, size)
  const seed = sigilSeed(scores)
  const rotation = seed % 60

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="overflow-visible">
      {showRings && (
        <g opacity="0.18">
          {[0.4, 0.7, 1].map((k) => (
            <circle key={k} cx={size / 2} cy={size / 2} r={(size / 2 - 12) * k} fill="none" stroke="currentColor" strokeWidth="1" />
          ))}
        </g>
      )}

      {/* dim, rotated echo of the same shape */}
      <path
        d={sigilPath(points)}
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.25"
        transform={`rotate(${rotation} ${size / 2} ${size / 2})`}
      />

      <path d={sigilPath(points)} fill="none" stroke="currentColor" strokeWidth={size > 80 ? 2.5 : 1.8} strokeLinejoin="round" />

      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={size > 80 ? 4 : 2.6} fill={p.colour} stroke="#12151a" strokeWidth={size > 80 ? 1.6 : 1} />
      ))}

      <circle cx={size / 2} cy={size / 2} r={size > 80 ? 3 : 2} fill="#12151a" />
    </svg>
  )
}
