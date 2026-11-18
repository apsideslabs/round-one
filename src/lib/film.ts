/** Scenes built from editable lines — the film is data, not a fixed script. */
export type Kind = 'number' | 'specific' | 'connector' | 'vague' | 'plain'
export type Grade = 'paper' | 'night' | 'blueprint'

export interface Line { id: string; text: string; kind: Kind }

export interface Palette { bg: string; ink: string; muted: string; accent: string; number: string; vague: string; line: string; grain: number }

export const PALETTES: Record<Grade, Palette> = {
  paper: { bg: '#faf6ea', ink: '#12151a', muted: 'rgba(18,21,26,0.45)', accent: '#ff4b26', number: '#a86f00', vague: '#8a8f96', line: 'rgba(18,21,26,0.16)', grain: 0.05 },
  night: { bg: '#0e1116', ink: '#f4f1e6', muted: 'rgba(244,241,230,0.45)', accent: '#5eead4', number: '#fbbf24', vague: '#5b6470', line: 'rgba(244,241,230,0.16)', grain: 0.08 },
  blueprint: { bg: '#0b2545', ink: '#dbeafe', muted: 'rgba(219,234,254,0.5)', accent: '#7dd3fc', number: '#fde68a', vague: '#4a6fa5', line: 'rgba(219,234,254,0.22)', grain: 0.1 }
}

export const KINDS: Kind[] = ['plain', 'specific', 'number', 'connector', 'vague']

export interface Word { text: string; enter: number; x: number; y: number; size: number; weight: number; rotate: number }

export interface Scene {
  line: Line
  start: number
  dur: number
  words: Word[]
  motif: 'ring' | 'sweep' | 'smoke' | 'rail' | 'none'
  zoom: number
  align: 'left' | 'center'
}

export const W = 1280
export const H = 720
const SAFE = 96

const fontFor = (kind: Kind, size: number, weight: number) =>
  `${weight} ${size}px ${kind === 'number' ? '"Bricolage Grotesque", Manrope' : 'Manrope'}, sans-serif`

let measureCtx: CanvasRenderingContext2D | null = null
const measure = (txt: string, kind: Kind, size: number, weight: number) => {
  if (!measureCtx) measureCtx = document.createElement('canvas').getContext('2d')!
  measureCtx.font = fontFor(kind, size, weight)
  return measureCtx.measureText(txt).width
}

export function buildFilm(lines: Line[], total = 18): Scene[] {
  const live = lines.filter((l) => l.text.trim())
  if (!live.length) return []
  const weights = live.map((l) => 1.4 + l.text.split(/\s+/).length * 0.22)
  const sum = weights.reduce((a, b) => a + b, 0)
  let t = 0

  return live.map((line) => {
    const dur = (weights[live.indexOf(line)] / sum) * total
    const start = t
    t += dur

    const words = line.text.split(/\s+/).filter(Boolean)
    const isNumber = line.kind === 'number'
    const weight = isNumber ? 800 : line.kind === 'specific' ? 700 : 600
    let size = isNumber ? 128 : 74
    while (size > 26 && measure(line.text, line.kind, size, weight) > W - SAFE * 2) size -= 4

    const maxW = W - SAFE * 2
    const rows: string[][] = [[]]
    let rowW = 0
    for (const word of words) {
      const w = measure(word + ' ', line.kind, size, weight)
      if (rowW + w > maxW && rows[rows.length - 1].length) { rows.push([]); rowW = 0 }
      rows[rows.length - 1].push(word)
      rowW += w
    }

    const lineHeight = size * 1.16
    const blockH = rows.length * lineHeight
    const startY = H / 2 - blockH / 2 + size * 0.76
    const align: Scene['align'] = isNumber ? 'center' : 'left'

    const out: Word[] = []
    let k = 0
    rows.forEach((row, ri) => {
      const rowWidth = row.reduce((a, w) => a + measure(w + ' ', line.kind, size, weight), 0)
      let x = align === 'center' ? (W - rowWidth) / 2 : SAFE + 16
      row.forEach((word) => {
        out.push({
          text: word,
          enter: 0.02 + k * (line.kind === 'vague' ? 0.09 : 0.05),
          x,
          y: startY + ri * lineHeight,
          size,
          weight,
          rotate: isNumber ? (k % 2 ? 0.02 : -0.02) : 0
        })
        x += measure(word + ' ', line.kind, size, weight)
        k++
      })
    })

    const motif: Scene['motif'] =
      line.kind === 'number' ? 'ring' : line.kind === 'specific' ? 'sweep' : line.kind === 'vague' ? 'smoke' : line.kind === 'connector' ? 'rail' : 'none'

    return { line, start, dur, words: out, motif, zoom: isNumber ? 1.05 : line.kind === 'vague' ? 1.02 : 1, align }
  })
}

export const sceneAt = (scenes: Scene[], t: number) =>
  scenes.find((s) => t >= s.start && t < s.start + s.dur) ?? scenes[scenes.length - 1]

export const ease = (kind: Kind, x: number) => {
  const p = Math.max(0, Math.min(1, x))
  if (kind === 'number') return 1 - Math.pow(1 - p, 4)
  if (kind === 'vague') return p * p * (3 - 2 * p)
  return 1 - Math.pow(1 - p, 3)
}

export function grainTile(size = 128): string {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 128 + (Math.random() - 0.5) * 120
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 90 * Math.random()
  }
  ctx.putImageData(img, 0, 0)
  return c.toDataURL()
}
