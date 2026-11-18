/** Turns beats into a scene list a renderer can draw: words, timings, motifs. */
import type { Beat } from '@/data/kinetic'

export type Grade = 'paper' | 'night' | 'blueprint'

export interface Palette {
  bg: string
  ink: string
  muted: string
  accent: string
  number: string
  vague: string
  line: string
  grain: number
}

export const PALETTES: Record<Grade, Palette> = {
  paper: { bg: '#faf6ea', ink: '#12151a', muted: 'rgba(18,21,26,0.45)', accent: '#ff4b26', number: '#b8860b', vague: '#8a8f96', line: 'rgba(18,21,26,0.18)', grain: 0.05 },
  night: { bg: '#0e1116', ink: '#f4f1e6', muted: 'rgba(244,241,230,0.45)', accent: '#5eead4', number: '#fbbf24', vague: '#5b6470', line: 'rgba(244,241,230,0.16)', grain: 0.08 },
  blueprint: { bg: '#0b2545', ink: '#dbeafe', muted: 'rgba(219,234,254,0.5)', accent: '#7dd3fc', number: '#fde68a', vague: '#4a6fa5', line: 'rgba(219,234,254,0.22)', grain: 0.1 }
}

export interface Word {
  text: string
  enter: number // seconds from beat start
  x: number
  y: number
  size: number
  weight: number
  rotate: number
}

export interface Scene {
  beat: Beat
  index: number
  words: Word[]
  lines: number
  motif: 'ring' | 'sweep' | 'smoke' | 'rail' | 'none'
  zoom: number
  align: 'left' | 'center'
}

const W = 1280
const H = 720
const SAFE = 96

/** Lay a phrase out word by word inside the frame, sized to fit. */
export function layoutBeat(beat: Beat, index: number): Scene {
  const words = beat.text.split(' ').filter(Boolean)
  const isNumber = beat.kind === 'number'
  const isVague = beat.kind === 'vague'

  let size = isNumber ? 132 : 76
  const weight = isNumber ? 800 : beat.kind === 'specific' ? 700 : 600
  const font = (s: number) => `${weight} ${s}px ${isNumber ? '"Bricolage Grotesque", Manrope' : 'Manrope'}, sans-serif`

  // shrink until the longest line fits
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const measure = (txt: string, s: number) => { ctx.font = font(s); return ctx.measureText(txt).width }
  while (size > 28 && measure(beat.text, size) > W - SAFE * 2) size -= 4

  // wrap into lines
  const maxW = W - SAFE * 2
  const lines: string[][] = [[]]
  let lineW = 0
  for (const word of words) {
    const w = measure(word + ' ', size)
    if (lineW + w > maxW && lines[lines.length - 1].length) { lines.push([]); lineW = 0 }
    lines[lines.length - 1].push(word)
    lineW += w
  }

  const lineHeight = size * 1.18
  const blockH = lines.length * lineHeight
  const startY = H / 2 - blockH / 2 + size * 0.78
  const align: Scene['align'] = isNumber ? 'center' : 'left'

  const out: Word[] = []
  let wordIndex = 0
  lines.forEach((line, li) => {
    const lineWidth = line.reduce((a, w) => a + measure(w + ' ', size), 0)
    let x = align === 'center' ? (W - lineWidth) / 2 + SAFE * 0.2 : SAFE + 20
    line.forEach((word) => {
      out.push({
        text: word,
        enter: 0.06 + wordIndex * (isVague ? 0.11 : 0.075),
        x,
        y: startY + li * lineHeight,
        size,
        weight,
        rotate: isNumber ? -0.02 + (wordIndex % 2) * 0.04 : 0
      })
      x += measure(word + ' ', size)
      wordIndex++
    })
  })

  const motif: Scene['motif'] = isNumber ? 'ring' : beat.kind === 'specific' ? 'sweep' : isVague ? 'smoke' : beat.kind === 'connector' ? 'rail' : 'none'
  const zoom = isNumber ? 1.05 : isVague ? 1.02 : 1
  return { beat, index, words: out, lines: lines.length, motif, zoom, align }
}

export function layoutFilm(beats: Beat[]): Scene[] {
  return beats.map(layoutBeat)
}

/** Ease used per kind: numbers snap, everything else settles. */
export function ease(kind: Beat['kind'], t: number): number {
  const x = Math.max(0, Math.min(1, t))
  if (kind === 'number') return 1 - Math.pow(1 - x, 4)
  if (kind === 'vague') return x * x * (3 - 2 * x)
  return 1 - Math.pow(1 - x, 3)
}

/** A deterministic noise tile, so the grain does not crawl. */
export function grainTile(size = 128, alpha = 0.5): string {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (Math.random() - 0.5) * 120
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255 * alpha * Math.random()
  }
  ctx.putImageData(img, 0, 0)
  return c.toDataURL()
}
