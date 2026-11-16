import { tracks, type TrackId } from '@/data/tracks'
import { pct } from '@/lib/utils'
import type { Scores } from '@/store/progress'

/**
 * A four-axis score profile, drawn by hand so the bundle carries no charting
 * dependency. Each axis is one round; the polygon shows where you are thin.
 */
export function RadarProfile({ scores }: { scores: Scores }) {
  const size = 220
  const cx = size / 2
  const cy = size / 2 - 2
  const R = 74
  const n = tracks.length
  const values = tracks.map((t) => pct(scores[t.id as TrackId] ?? 0, t.max) / 100)

  const point = (i: number, scale: number) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n
    return [cx + Math.cos(angle) * R * scale, cy + Math.sin(angle) * R * scale] as const
  }

  const ring = (scale: number) =>
    tracks.map((_, i) => point(i, scale).map((n) => n.toFixed(1)).join(',')).join(' ')

  const dataPoints = tracks.map((_, i) => point(i, Math.max(values[i], 0.02)))

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-[220px] w-full max-w-[240px]" role="img" aria-label="Score profile across the four rounds">
      {[0.25, 0.5, 0.75, 1].map((s) => (
        <polygon key={s} points={ring(s)} fill="none" stroke="rgba(18,21,26,0.16)" strokeWidth={1.3} />
      ))}
      {tracks.map((_, i) => {
        const [x, y] = point(i, 1)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(18,21,26,0.16)" strokeWidth={1.3} />
      })}
      <polygon
        points={dataPoints.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')}
        fill="rgba(255,75,38,0.22)"
        stroke="#ff4b26"
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.2} fill="#ff4b26" stroke="#12151a" strokeWidth={1.4} />
      ))}
      {tracks.map((track, i) => {
        const [x, y] = point(i, 1.26)
        const angle = (i * 360) / n
        return (
          <text
            key={track.id}
            x={x}
            y={y}
            textAnchor={angle > 20 && angle < 160 ? 'start' : angle > 200 && angle < 340 ? 'end' : 'middle'}
            dominantBaseline="middle"
            fontFamily="JetBrains Mono, monospace"
            fontSize={8.5}
            fontWeight={700}
            letterSpacing="0.08em"
            fill="#6b727d"
          >
            {track.short.toUpperCase()}
          </text>
        )
      })}
    </svg>
  )
}
