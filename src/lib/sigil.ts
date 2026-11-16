import { tracks, type TrackId } from '@/data/tracks'
import type { Scores } from '@/store/progress'
import { pct } from '@/lib/utils'

export interface SigilPoint {
  x: number
  y: number
  r: number
  colour: string
  value: number
}

/**
 * A six-lobed mark whose every lobe is one round and whose reach is that
 * round's score. Two layers, the second rotated and dimmed, so the shape
 * reads as a seal rather than a chart. Same scores in, same sigil out.
 */
export function sigilPoints(scores: Scores, size = 120, inset = 12): SigilPoint[] {
  const cx = size / 2
  const cy = size / 2
  const maxR = size / 2 - inset
  return tracks.map((t, i) => {
    const value = pct(scores[t.id as TrackId] ?? 0, t.max) / 100
    const angle = (i * 360) / tracks.length - 90
    const r = maxR * (0.34 + 0.66 * value)
    const rad = (angle * Math.PI) / 180
    return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r, r, colour: t.colour, value }
  })
}

/** Smooth closed path through the points, for the SVG and the canvas. */
export function sigilPath(points: SigilPoint[]): string {
  if (!points.length) return ''
  const mid = (a: SigilPoint, b: SigilPoint) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
  let d = `M ${mid(points[points.length - 1], points[0]).x} ${mid(points[points.length - 1], points[0]).y}`
  points.forEach((p, i) => {
    const next = points[(i + 1) % points.length]
    const m = mid(p, next)
    d += ` Q ${p.x} ${p.y} ${m.x} ${m.y}`
  })
  return d + ' Z'
}

export function sigilSeed(scores: Scores): number {
  return tracks.reduce((acc, t) => acc + (scores[t.id as TrackId] ?? 0) * (t.max % 7 + 1), 0)
}
