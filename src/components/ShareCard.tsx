import { useState } from 'react'
import { Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { tracks, type TrackId } from '@/data/tracks'
import { sigilPath, sigilPoints, sigilSeed } from '@/lib/sigil'
import type { Scores } from '@/store/progress'
import { pct } from '@/lib/utils'

interface Props {
  scores: Scores
  readiness: number
  trackName: string
  correct: number
  total: number
}

const PAPER = '#fdfbf3'
const INK = '#12151a'
const MUTED = '#8a8577'
const W = 720
const H = 940

/**
 * The share output is a till receipt: itemised rounds, leader dots, a torn
 * edge, a barcode, and your sigil pressed into the corner like a stamp.
 */
export function buildReceipt({ scores, readiness, trackName, correct, total }: Props): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const mono = (weight: number, size: number) => `${weight} ${size}px "JetBrains Mono", ui-monospace, monospace`
  const display = (weight: number, size: number) => `${weight} ${size}px "Bricolage Grotesque", "JetBrains Mono", sans-serif`

  ctx.fillStyle = PAPER
  ctx.fillRect(0, 0, W, H)

  // torn edges, top and bottom
  const tooth = 16
  const tear = (yTop: number) => {
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.moveTo(0, yTop)
    for (let x = 0; x < W; x += tooth * 2) {
      ctx.lineTo(x + tooth, yTop + tooth)
      ctx.lineTo(x + tooth * 2, yTop)
    }
    ctx.lineTo(W, yTop)
    ctx.closePath()
    ctx.fill()
  }
  tear(0)

  // header
  ctx.textAlign = 'center'
  ctx.fillStyle = INK
  ctx.font = display(800, 46)
  ctx.fillText('ROUND ONE', W / 2, 104)
  ctx.fillStyle = MUTED
  ctx.font = mono(600, 17)
  ctx.fillText('I N T E R V I E W   R E C E I P T', W / 2, 134)

  const now = new Date()
  ctx.font = mono(500, 15)
  ctx.fillText(
    `${now.toLocaleDateString('en-GB')}  ·  ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}  ·  TERMINAL 01`,
    W / 2,
    162
  )

  const rule = (y: number) => {
    ctx.save()
    ctx.setLineDash([5, 6])
    ctx.strokeStyle = 'rgba(138,133,119,0.8)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(56, y)
    ctx.lineTo(W - 56, y)
    ctx.stroke()
    ctx.restore()
  }
  rule(190)

  // itemised rounds
  let y = 236
  ctx.textAlign = 'left'
  for (const t of tracks) {
    const value = pct(scores[t.id as TrackId] ?? 0, t.max)
    const label = t.name.toUpperCase()
    ctx.fillStyle = INK
    ctx.font = mono(600, 20)
    ctx.fillText(label, 56, y)
    ctx.textAlign = 'right'
    ctx.font = mono(700, 20)
    ctx.fillText(`${value}%`, W - 56, y)
    ctx.textAlign = 'left'

    ctx.fillStyle = 'rgba(138,133,119,0.55)'
    const startX = 56 + ctx.measureText(label).width + 12
    for (let x = startX; x < W - 56 - 56; x += 9) ctx.fillRect(x, y - 6, 1.6, 1.6)
    y += 40
  }

  rule(y - 4)

  // the round just played
  y += 36
  ctx.fillStyle = INK
  ctx.font = mono(700, 21)
  ctx.fillText(trackName.toUpperCase(), 56, y)
  ctx.fillStyle = MUTED
  ctx.font = mono(500, 15)
  ctx.fillText(`just played · ${correct} of ${total} correct`, 56, y + 22)

  // readiness, big
  y += 158
  ctx.fillStyle = INK
  ctx.font = display(800, 118)
  ctx.fillText(`${readiness}%`, 52, y)
  ctx.fillStyle = MUTED
  ctx.font = mono(600, 16)
  ctx.fillText('R E A D I N E S S', 58, y + 30)

  // the stamp
  const size = 168
  const sx = W - 56 - size
  const sy = y - 136
  const seed = sigilSeed(scores)
  const rot = (((seed % 40) - 20) * Math.PI) / 180
  ctx.save()
  ctx.translate(sx + size / 2, sy + size / 2)
  ctx.rotate(rot)

  // stamp ring
  ctx.strokeStyle = INK
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(0, 0, size / 2 - 4, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([4, 5])
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.arc(0, 0, size / 2 - 14, 0, Math.PI * 2)
  ctx.stroke()
  ctx.setLineDash([])

  // sigil inside the stamp
  const pts = sigilPoints(scores, size - 34, 6)
  const local = pts.map((p) => ({ ...p, x: p.x - (size - 34) / 2, y: p.y - (size - 34) / 2 }))
  ctx.strokeStyle = INK
  ctx.lineWidth = 2.4
  ctx.stroke(new Path2D(sigilPath(local)))
  local.forEach((p) => {
    ctx.beginPath()
    ctx.arc(p.x, p.y, 4.2, 0, Math.PI * 2)
    ctx.fillStyle = p.colour
    ctx.fill()
    ctx.strokeStyle = INK
    ctx.lineWidth = 1.4
    ctx.stroke()
  })
  ctx.restore()

  // barcode
  const by = y + 66
  let bx = 56
  let s = seed + readiness * 31
  ctx.fillStyle = INK
  while (bx < W - 56) {
    s = (s * 1103515245 + 12345) % 2147483648
    const w = 2 + (s % 4)
    ctx.fillRect(bx, by, w, 58)
    bx += w + 3 + (s % 5)
  }

  ctx.textAlign = 'center'
  ctx.fillStyle = MUTED
  ctx.font = mono(600, 14)
  ctx.fillText(`R1-${seed.toString(36).toUpperCase().padStart(6, '0')}-${readiness}`, W / 2, by + 84)
  ctx.fillStyle = INK
  ctx.font = mono(700, 15)
  ctx.fillText('KEEP THIS. IT IS YOUR EVIDENCE.', W / 2, by + 118)

  // bottom tear
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(0, H)
  for (let x = 0; x < W; x += tooth * 2) {
    ctx.lineTo(x + tooth, H - tooth)
    ctx.lineTo(x + tooth * 2, H)
  }
  ctx.lineTo(W, H)
  ctx.closePath()
  ctx.fill()

  return canvas
}

export function ShareCard(props: Props) {
  const [saved, setSaved] = useState(false)

  const draw = () => {
    const canvas = buildReceipt(props)
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `round-one-receipt-${props.readiness}.png`
    a.click()
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Button variant="light" className="flex-1" onClick={draw}>
      <Receipt className="h-4 w-4" /> {saved ? 'Saved' : 'Receipt'}
    </Button>
  )
}
