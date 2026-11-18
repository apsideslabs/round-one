import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Pause, RotateCcw, Download, Image as ImageIcon, Plus, Trash2, SplitSquareVertical } from 'lucide-react'
import { buildFilm, sceneAt, ease, spring, rand, grainTile, PALETTES, GRADE_LIST, KINDS, W, H, type Grade, type Kind, type Line } from '@/lib/film'

const uid = () => Math.random().toString(36).slice(2, 8)
const SEED: Line[] = [
  { id: uid(), text: 'I am a final year computer science student', kind: 'plain' },
  { id: uid(), text: 'Basically I did a project with my team', kind: 'vague' },
  { id: uid(), text: 'a billing app in Flask', kind: 'specific' },
  { id: uid(), text: 'I found a GST rounding bug that cost one paisa', kind: 'number' },
  { id: uid(), text: 'we reduced manual checks from four hours to twenty minutes', kind: 'number' }
]

const KIND_COLOUR: Record<Kind, string> = {
  number: 'bg-c3', specific: 'bg-c2', connector: 'bg-[#dbeafe]', vague: 'bg-c1', plain: 'bg-[#eeece4]'
}

export default function Film() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [lines, setLines] = useState<Line[]>(SEED)
  const [grade, setGrade] = useState<Grade>('paper')
  const [title, setTitle] = useState('Your answer')
  const [recording, setRecording] = useState(false)
  const [paste, setPaste] = useState('')

  // ---- the clock lives in refs, never in state: no re-render per frame
  const time = useRef(0)
  const playing = useRef(true)
  const scenes = useRef(buildFilm(SEED))
  const pal = useRef(PALETTES.paper)
  const meta = useRef({ title: 'Your answer', ratio: 0 })
  const scrub = useRef<HTMLInputElement>(null)
  const clock = useRef<HTMLSpanElement>(null)
  const [uiPlaying, setUiPlaying] = useState(true)

  const built = useMemo(() => buildFilm(lines), [lines])
  useEffect(() => {
    scenes.current = built
    const weighted = lines.filter((l) => l.kind === 'number' || l.kind === 'specific').length
    const vague = lines.filter((l) => l.kind === 'vague').length
    meta.current = { title, ratio: lines.length ? weighted / lines.length : 0 }
    void vague
  }, [built, lines, title])
  useEffect(() => { pal.current = PALETTES[grade] }, [grade])

  const grain = useRef<HTMLImageElement | null>(null)
  const photoRef = useRef<HTMLImageElement | null>(null)
  const [photoName, setPhotoName] = useState('')
  useEffect(() => { const img = new Image(); img.src = grainTile(); grain.current = img }, [])

  // one loop for the life of the page; every expensive thing is pre-rendered
  const fpsRef = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    const ctx = cv.getContext('2d', { alpha: false })!
    // draw at 3/4 resolution and let CSS upscale: 44% of the pixels, same layout
    const RW = 960
    const RH = 540
    const sx = RW / W
    const sy = RH / H
    cv.width = RW
    cv.height = RH

    // ---- one baked layer: gradient + dots + grain + vignette, drawn once
    const bake = document.createElement('canvas')
    bake.width = W
    bake.height = H
    const bc = bake.getContext('2d')!
    const p0 = PALETTES[grade]
    const END: Record<Grade, string> = {
      paper: '#f2ecdd', night: '#141922', blueprint: '#08203c',
      riso: '#efe2d0', cinema: '#141110', newsprint: '#e6e0d4'
    }
    const LIGHT: Grade[] = ['paper', 'riso', 'newsprint']
    const grad = bc.createLinearGradient(0, 0, W, H)
    grad.addColorStop(0, p0.bg)
    grad.addColorStop(1, END[grade])
    bc.fillStyle = grad
    bc.fillRect(0, 0, W, H)

    // dot field baked in: no per-frame pattern fill
    bc.fillStyle = p0.line
    for (let x = 22; x < W; x += 44) {
      for (let y = 22; y < H; y += 44) {
        bc.beginPath(); bc.arc(x, y, 1.2, 0, Math.PI * 2); bc.fill()
      }
    }

    // grain baked in: overlay blending happens once, not sixty times a second
    const grainImg = grain.current
    if (grainImg?.complete) {
      bc.globalAlpha = p0.grain * 3.2
      bc.globalCompositeOperation = 'overlay'
      const pat = bc.createPattern(grainImg, 'repeat')
      if (pat) { bc.fillStyle = pat; bc.fillRect(0, 0, W, H) }
      bc.globalCompositeOperation = 'source-over'
      bc.globalAlpha = 1
    }

    // perspective floor: horizon lines converging to a vanishing point
    const horizon = H * 0.62
    bc.strokeStyle = LIGHT.includes(grade) ? 'rgba(18,21,26,0.10)' : 'rgba(255,255,255,0.08)'
    bc.lineWidth = 1
    for (let i = -8; i <= 8; i++) {
      bc.beginPath()
      bc.moveTo(W / 2 + i * 40, horizon)
      bc.lineTo(W / 2 + i * 320, H)
      bc.stroke()
    }
    for (let i = 1; i <= 6; i++) {
      const y = horizon + Math.pow(i / 6, 2.2) * (H - horizon)
      bc.beginPath(); bc.moveTo(0, y); bc.lineTo(W, y); bc.stroke()
    }

    // vignette baked in
    const vig = bc.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H)
    vig.addColorStop(0, 'rgba(0,0,0,0)')
    vig.addColorStop(1, LIGHT.includes(grade) ? 'rgba(18,21,26,0.07)' : 'rgba(0,0,0,0.5)')
    bc.fillStyle = vig
    bc.fillRect(0, 0, W, H)

    let raf = 0
    let last = performance.now()
    let frames = 0
    let fpsAt = performance.now()

    const draw = (now: number) => {
      // 30fps is enough for type motion and halves the work
      if (now - last < 32) { raf = requestAnimationFrame(draw); return }
      const dt = Math.min(0.06, (now - last) / 1000)
      last = now
      if (playing.current) {
        time.current += dt
        if (time.current > 18) time.current = 0
      }
      const t = time.current
      const p = pal.current
      const list = scenes.current

      ctx.setTransform(sx, 0, 0, sy, 0, 0)

      // the whole backdrop in one blit, nudged a pixel or two so it still breathes
      ctx.drawImage(bake, Math.sin(t * 0.5) * 3, Math.cos(t * 0.4) * 2)

      // an uploaded photograph, duotoned into the grade so it belongs
      const photo = photoRef.current
      if (photo?.complete && photo.naturalWidth) {
        const scale = Math.max(W / photo.naturalWidth, H / photo.naturalHeight)
        const dw = photo.naturalWidth * scale
        const dh = photo.naturalHeight * scale
        ctx.save()
        ctx.globalAlpha = grade === 'paper' || grade === 'riso' || grade === 'newsprint' ? 0.3 : 0.42
        ctx.drawImage(photo, (W - dw) / 2 + Math.sin(t * 0.2) * 8, (H - dh) / 2, dw, dh)
        ctx.globalCompositeOperation = 'multiply'
        ctx.fillStyle = p.bg
        ctx.globalAlpha = 0.55
        ctx.fillRect(0, 0, W, H)
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 0.18
        ctx.fillStyle = p.accent
        ctx.fillRect(0, 0, W, H)
        ctx.restore()
      }

      const scene = list.length ? sceneAt(list, t) : null
      if (!scene) { raf = requestAnimationFrame(draw); return }
      const local = t - scene.start
      const drift = Math.sin(t * 0.35) * 16

      // ---- backdrop graphic: a different one per shot, never repeated text
      const motifIndex = list.indexOf(scene) % 6
      ctx.save()
      ctx.strokeStyle = p.line
      ctx.fillStyle = p.line
      ctx.lineWidth = 1.6
      const cx0 = W / 2 + drift
      const cy0 = H / 2

      if (motifIndex === 0) {
        // concentric arcs turning slowly
        for (let i = 0; i < 5; i++) {
          const r = 140 + i * 78
          const a = t * 0.25 + i * 0.4
          ctx.globalAlpha = 0.5 - i * 0.07
          ctx.beginPath(); ctx.arc(cx0, cy0, r, a, a + Math.PI * 1.25); ctx.stroke()
        }
      } else if (motifIndex === 1) {
        // stacked waves
        for (let i = 0; i < 4; i++) {
          ctx.globalAlpha = 0.4 - i * 0.06
          ctx.beginPath()
          for (let x = 0; x <= W; x += 12) {
            const y = H * 0.28 + i * 62 + Math.sin(x * 0.011 + t * 1.1 + i) * 16
            x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
          }
          ctx.stroke()
        }
      } else if (motifIndex === 2) {
        // radial rays
        for (let i = 0; i < 28; i++) {
          const a = (i / 28) * Math.PI * 2 + t * 0.15
          ctx.globalAlpha = 0.22
          ctx.beginPath()
          ctx.moveTo(cx0 + Math.cos(a) * 190, cy0 + Math.sin(a) * 190)
          ctx.lineTo(cx0 + Math.cos(a) * 760, cy0 + Math.sin(a) * 760)
          ctx.stroke()
        }
      } else if (motifIndex === 3) {
        // isometric grid
        ctx.globalAlpha = 0.3
        for (let i = -8; i <= 8; i++) {
          ctx.beginPath(); ctx.moveTo(cx0 + i * 90, 0); ctx.lineTo(cx0 + i * 90 + 420, H); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(cx0 + i * 90, 0); ctx.lineTo(cx0 + i * 90 - 420, H); ctx.stroke()
        }
      } else if (motifIndex === 4) {
        // drifting particles
        for (let i = 0; i < 70; i++) {
          const r1 = rand(i, 1), r2 = rand(i, 2)
          const x = r1 * W + Math.sin(t * 0.6 + i) * 18
          const y = (r2 * H + t * 22 * (0.4 + r1)) % H
          ctx.globalAlpha = 0.16 + r1 * 0.2
          ctx.beginPath(); ctx.arc(x, y, 1 + r2 * 2.2, 0, Math.PI * 2); ctx.fill()
        }
      } else {
        // bracket frames closing in
        const inset = 60 + Math.sin(t * 0.8) * 10
        ctx.globalAlpha = 0.35
        ctx.lineWidth = 3
        const L = 90
        ;[[inset, inset, 1, 1], [W - inset, inset, -1, 1], [inset, H - inset, 1, -1], [W - inset, H - inset, -1, -1]].forEach(([x, y, dx, dy]) => {
          ctx.beginPath()
          ctx.moveTo(x + dx * L, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * L)
          ctx.stroke()
        })
      }
      ctx.globalAlpha = 1
      ctx.restore()

      const wipe = Math.min(1, local / 0.3)
      ctx.save()
      if (wipe < 1) {
        const edge = W * (0.5 + 0.5 * ease('plain', wipe))
        ctx.beginPath(); ctx.rect(W / 2 - edge / 2, 0, edge, H); ctx.clip()
      }

      const zoom = 1 + (scene.zoom - 1) * Math.min(1, local / 0.7) + (1 - ease('plain', wipe)) * 0.04
      ctx.translate(W / 2 + Math.sin(t * 0.6) * 6, H / 2 + Math.cos(t * 0.45) * 4)
      ctx.scale(zoom, zoom)
      ctx.translate(-W / 2, -H / 2)

      // a wireframe cube turning behind the type: cheap (12 lines) and gives depth
      {
        const spin = t * 0.55 + scene.start * 0.3
        const cx = W / 2 + Math.sin(t * 0.4) * 40
        const cy = H / 2 + Math.cos(t * 0.33) * 24
        const r = 190 + Math.sin(t * 0.7) * 8
        const rot = (x: number, y: number, z: number) => {
          const cy1 = Math.cos(spin), sy1 = Math.sin(spin)
          const x1 = x * cy1 - z * sy1
          const z1 = x * sy1 + z * cy1
          const cy2 = Math.cos(spin * 0.7), sy2 = Math.sin(spin * 0.7)
          const y1 = y * cy2 - z1 * sy2
          const z2 = y * sy2 + z1 * cy2
          const p2 = 320 / (320 + z2)
          return { x: cx + x1 * p2, y: cy + y1 * p2 }
        }
        const v = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]
          .map(([x, y, z]) => rot(x * r * 0.55, y * r * 0.55, z * r * 0.55))
        const edges = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]
        ctx.save()
        ctx.globalAlpha = grade === 'paper' ? 0.13 : 0.2
        ctx.strokeStyle = p.accent
        ctx.lineWidth = 1.4
        edges.forEach(([a, b]) => {
          ctx.beginPath(); ctx.moveTo(v[a].x, v[a].y); ctx.lineTo(v[b].x, v[b].y); ctx.stroke()
        })
        ctx.restore()
      }

      const prog = Math.min(1, local / Math.max(0.5, scene.dur * 0.8))
      if (scene.motif === 'ring') {
        // a gauge: track, filled arc and a needle that settles
        const gx = W / 2
        const gy = H * 0.86
        const gr = 150
        ctx.strokeStyle = p.line
        ctx.lineWidth = 8
        ctx.beginPath(); ctx.arc(gx, gy, gr, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke()
        ctx.strokeStyle = p.accent
        ctx.lineWidth = 8
        ctx.beginPath(); ctx.arc(gx, gy, gr, Math.PI * 1.12, Math.PI * (1.12 + 0.76 * ease('number', prog))); ctx.stroke()
        const ang = Math.PI * (1.12 + 0.76 * ease('number', prog))
        ctx.strokeStyle = p.ink
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.moveTo(gx + Math.cos(ang) * (gr - 26), gy + Math.sin(ang) * (gr - 26))
        ctx.lineTo(gx + Math.cos(ang) * (gr + 14), gy + Math.sin(ang) * (gr + 14))
        ctx.stroke()
      }
      if (scene.motif === 'sweep') {
        // three bars growing under the line, like a small chart
        const baseY = H - 120
        const barW = 34
        ;[0.55, 0.85, 0.7].forEach((h, i) => {
          const grow = ease('specific', Math.min(1, prog * 1.4 - i * 0.15))
          const bh = 110 * h * Math.max(0, grow)
          ctx.fillStyle = i === 2 ? p.accent : p.line
          ctx.fillRect(96 + i * (barW + 12), baseY - bh, barW, bh)
        })
      }
      if (scene.motif === 'rail') {
        ctx.strokeStyle = p.accent
        ctx.lineWidth = 2.5
        ctx.beginPath(); ctx.moveTo(96, H / 2 + 70); ctx.lineTo(96 + (W - 192) * ease('plain', prog), H / 2 + 70); ctx.stroke()
      }
      if (scene.motif === 'smoke') {
        for (let i = 0; i < 24; i++) {
          const r = rand(i, 3)
          ctx.globalAlpha = Math.max(0, 0.22 - local * 0.1) * (0.35 + r)
          ctx.fillStyle = p.vague
          ctx.beginPath()
          ctx.arc(150 + r * (W - 300) + Math.sin(local * 1.4 + i) * 24, H / 2 - 20 - local * 36 * (0.3 + r), 1 + r * 3, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }
      // ---- a prop that says what kind of line this is
      {
        const first = scene.words[0]
        if (first) {
          const px = scene.align === 'center' ? 96 : first.x - 44
          const py = first.y - first.size * 0.28
          ctx.save()
          ctx.strokeStyle = p.accent
          ctx.fillStyle = p.accent
          ctx.lineWidth = 3
          ctx.globalAlpha = Math.min(1, local / 0.5)
          if (scene.line.kind === 'connector') {
            ctx.beginPath(); ctx.moveTo(px - 20, py); ctx.lineTo(px + 10, py); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(px + 2, py - 7); ctx.lineTo(px + 12, py); ctx.lineTo(px + 2, py + 7); ctx.stroke()
          } else if (scene.line.kind === 'vague') {
            for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(px - 14 + i * 14, py, 3.2, 0, Math.PI * 2); ctx.fill() }
          } else if (scene.line.kind === 'specific') {
            ;[0.5, 0.9, 0.7].forEach((h, i) => { ctx.fillRect(px - 18 + i * 12, py + 10 - 26 * h, 8, 26 * h) })
          } else if (scene.line.kind === 'number') {
            ctx.beginPath(); ctx.arc(px - 4, py, 13, 0, Math.PI * 2); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(px - 4, py - 6); ctx.lineTo(px - 4, py + 6); ctx.stroke()
          } else {
            ctx.font = '700 44px Georgia, serif'
            ctx.fillText('“', px - 18, py + 16)
          }
          ctx.restore()
        }
      }

      scene.words.forEach((word) => {
        const enter = Math.max(0, Math.min(1, (local - word.enter) / 0.5))
        if (enter <= 0) return
        const isVague = scene.line.kind === 'vague'
        const e = scene.line.kind === 'number' ? spring(enter) : ease(scene.line.kind, enter)
        const rise = (1 - e) * word.size * 0.9
        const fade = isVague ? Math.max(0, 1 - Math.max(0, local - 0.9) / 1.2) : 1

        ctx.save()
        ctx.globalAlpha = fade
        ctx.translate(word.x, word.y + rise)
        ctx.rotate(word.rotate * (1 - e))

        const colour = scene.line.kind === 'number' ? p.number : isVague ? p.vague : scene.line.kind === 'specific' ? p.accent : p.ink
        const font = `${word.weight} ${word.size}px ${scene.line.kind === 'number' ? '"Bricolage Grotesque", Manrope' : 'Manrope'}, sans-serif`
        ctx.font = font
        // extruded depth: two offset copies read as a solid letterform
        const depth = scene.line.kind === 'number' || scene.line.kind === 'specific' ? 4 : 2
        ctx.globalAlpha = fade * 0.22
        ctx.fillStyle = p.ink
        ctx.fillText(word.text, depth, depth)
        ctx.fillText(word.text, depth * 0.5, depth * 0.5)
        ctx.globalAlpha = fade
        ctx.fillStyle = colour
        ctx.fillText(word.text, 0, 0)

        ctx.restore()
      })

      ctx.restore()

      // a light sweep crossing the frame once per shot
      {
        const k = Math.min(1, local / Math.max(0.8, scene.dur))
        const x = -300 + k * (W + 600)
        const sweep = ctx.createLinearGradient(x - 220, 0, x + 220, H)
        sweep.addColorStop(0, 'rgba(255,255,255,0)')
        sweep.addColorStop(0.5, grade === 'paper' ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.10)')
        sweep.addColorStop(1, 'rgba(255,255,255,0)')
        ctx.save()
        ctx.globalCompositeOperation = 'overlay'
        ctx.fillStyle = sweep
        ctx.fillRect(0, 0, W, H)
        ctx.restore()
      }

      // furniture
      ctx.save()
      ctx.globalAlpha = Math.min(1, local / 0.4)
      ctx.fillStyle = p.muted
      ctx.font = '800 12px "JetBrains Mono", monospace'
      const shotNo = String(list.indexOf(scene) + 1).padStart(2, '0')
      ctx.fillText(`${shotNo} / ${String(list.length).padStart(2, '0')}`, 96, 84)
      ctx.fillRect(96, 96, 34, 2)
      ctx.fillText(scene.line.kind.toUpperCase(), 96, 122)
      ctx.textAlign = 'right'
      ctx.fillText(t.toFixed(1) + 's', W - 96, 84)
      ctx.restore()

      if (t > 16.4) {
        ctx.globalAlpha = Math.min(1, (t - 16.4) / 0.5)
        ctx.fillStyle = p.bg
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = p.muted
        ctx.font = '800 13px "JetBrains Mono", monospace'
        ctx.fillText('THE ANSWER, SCORED', 96, H / 2 - 104)
        ctx.fillStyle = p.ink
        ctx.font = '800 168px "Bricolage Grotesque", Manrope, sans-serif'
        ctx.fillText(`${Math.round(meta.current.ratio * 100)}%`, 96, H / 2 + 44)
        ctx.fillStyle = p.muted
        ctx.font = '600 20px Manrope, sans-serif'
        ctx.fillText('of your lines carry weight', 100, H / 2 + 84)
        ctx.fillStyle = p.accent
        ctx.fillRect(96, H / 2 + 104, 72, 4)
        ctx.globalAlpha = 1
      }

      const railY = H - 40
      ctx.fillStyle = p.line
      ctx.fillRect(96, railY, W - 192, 2)
      list.forEach((s) => {
        const x = 96 + (s.start / 18) * (W - 192)
        const w = (s.dur / 18) * (W - 192)
        const active = t >= s.start && t < s.start + s.dur
        ctx.fillStyle = active ? p.accent : s.line.kind === 'number' ? p.number : p.line
        ctx.fillRect(x, railY - 2, Math.max(2, w - 4), active ? 7 : 2)
      })

      if (scrub.current && document.activeElement !== scrub.current) scrub.current.value = String(t)
      if (clock.current) clock.current.textContent = `${t.toFixed(1)}s`

      frames++
      if (now - fpsAt > 500) {
        if (fpsRef.current) fpsRef.current.textContent = `${Math.round((frames * 1000) / (now - fpsAt))}fps`
        frames = 0
        fpsAt = now
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [grade])

  const edit = (id: string, patch: Partial<Line>) =>
    setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)))

  const split = () => {
    const parts = paste.split(/(?<=[.!?])\s+|\n+/).map((s) => s.trim()).filter(Boolean)
    if (!parts.length) return
    setLines(parts.map((text) => ({ id: uid(), text, kind: /\d|four|five|twenty|ten|three/i.test(text) ? 'number' : 'plain' })))
    setPaste('')
  }

  const record = () => {
    const cv = canvas.current
    if (!cv || recording) return
    const r = new MediaRecorder(cv.captureStream(30), { mimeType: 'video/webm' })
    const chunks: Blob[] = []
    r.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data) }
    r.onstop = () => {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }))
      a.download = 'answer-film.webm'
      a.click()
      setRecording(false)
    }
    time.current = 0
    playing.current = true
    setUiPlaying(true)
    setRecording(true)
    r.start()
    window.setTimeout(() => r.stop(), 18400)
  }

  return (
    <div className="w-full px-3 pb-20 pt-3 sm:px-5 md:pb-6 lg:px-6">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="chip bg-ink text-paper">Film</span>
            <h1 className="mt-1 font-display text-xl font-extrabold tracking-tight">{title}</h1>
            <p className="text-[11.5px] font-medium text-ink-3">write it line by line · each line is a shot</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {GRADE_LIST.map((g) => (
              <button key={g} type="button" onClick={() => setGrade(g)}
                className={`rounded-md border-2 border-ink px-2 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-wider ${grade === g ? 'bg-ink text-paper' : 'bg-card'}`}>{g}</button>
            ))}
          </div>
        </div>

        <div className="grid gap-2.5 lg:grid-cols-[1fr_380px]">
          {/* stage */}
          <div className="grid content-start gap-2">
            <div className="overflow-hidden rounded-2xl border-[3px] border-ink bg-black shadow-[6px_6px_0_var(--color-ink)]">
              <canvas ref={canvas} className="block w-full" style={{ aspectRatio: '16 / 9' }} />
            </div>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-ink bg-card px-2.5 py-1.5 shadow-[3px_3px_0_var(--color-ink)]">
              <button type="button" onClick={() => { playing.current = !playing.current; setUiPlaying(playing.current) }}
                className="grid h-8 w-8 place-items-center rounded-md border-2 border-ink bg-c1 text-white shadow-[2px_2px_0_var(--color-ink)]">
                {uiPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </button>
              <button type="button" onClick={() => { time.current = 0; playing.current = false; setUiPlaying(false) }}
                className="grid h-8 w-8 place-items-center rounded-md border-2 border-ink bg-card shadow-[2px_2px_0_var(--color-ink)]">
                <RotateCcw className="h-4 w-4" />
              </button>
              <input ref={scrub} type="range" min={0} max={18} step={0.05} defaultValue={0}
                onChange={(e) => { time.current = Number(e.target.value); playing.current = false; setUiPlaying(false) }}
                className="min-w-[140px] flex-1 accent-[#ff4b26]" />
              <span ref={clock} className="w-10 font-mono text-[10px] font-bold tabular-nums">0.0s</span>
              <span ref={fpsRef} className="w-9 font-mono text-[9px] font-bold text-ink-3">–</span>
              <button type="button" onClick={record} disabled={recording}
                className="inline-flex items-center gap-1 rounded-md border-2 border-ink bg-c2 px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)] disabled:opacity-60">
                <Download className="h-3 w-3" /> {recording ? 'rec' : '.webm'}
              </button>
              <button type="button" onClick={() => { const cv = canvas.current; if (!cv) return; const a = document.createElement('a'); a.href = cv.toDataURL('image/png'); a.download = 'frame.png'; a.click() }}
                className="inline-flex items-center gap-1 rounded-md border-2 border-ink bg-card px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]">
                <ImageIcon className="h-3 w-3" /> png
              </button>
            </div>
          </div>

          {/* editor */}
          <div className="grid content-start gap-2">
            <div className="rounded-xl border-2 border-ink bg-card p-2 shadow-[3px_3px_0_var(--color-ink)]">
              <label className="mono-label mb-1 block">title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border-2 border-ink bg-paper px-2 py-1 text-[12px] font-bold outline-none" />
            </div>

            <div className="rounded-xl border-2 border-ink bg-card p-2 shadow-[3px_3px_0_var(--color-ink)]">
              <div className="mb-1 flex items-center justify-between">
                <p className="mono-label">lines · each is a shot</p>
                <button type="button" onClick={() => setLines((ls) => [...ls, { id: uid(), text: 'new line', kind: 'plain' }])}
                  className="inline-flex items-center gap-1 rounded border-2 border-ink bg-c2 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase">
                  <Plus className="h-2.5 w-2.5" /> add
                </button>
              </div>
              <ul className="grid max-h-[300px] gap-1 overflow-auto pr-1">
                {lines.map((l, i) => (
                  <li key={l.id} className="grid gap-1 rounded-lg border-2 border-ink/25 bg-paper p-1.5">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[8px] font-bold text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                      <input value={l.text} onChange={(e) => edit(l.id, { text: e.target.value })}
                        className="min-w-0 flex-1 bg-transparent text-[11.5px] font-semibold outline-none" />
                      <button type="button" onClick={() => setLines((ls) => ls.filter((x) => x.id !== l.id))}
                        className="text-ink-3 hover:text-bad"><Trash2 className="h-3 w-3" /></button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {KINDS.map((k) => (
                        <button key={k} type="button" onClick={() => edit(l.id, { kind: k })}
                          className={`rounded border border-ink px-1 py-[1px] font-mono text-[7.5px] font-bold uppercase ${l.kind === k ? KIND_COLOUR[k] : 'bg-card'}`}>
                          {k}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border-2 border-ink bg-card p-2 shadow-[3px_3px_0_var(--color-ink)]">
              <p className="mono-label mb-1">or paste your answer</p>
              <textarea value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Paste a paragraph — it splits into shots."
                className="h-16 w-full resize-none rounded-lg border-2 border-ink bg-paper px-2 py-1 text-[11px] font-medium outline-none" />
              <button type="button" onClick={split}
                className="mt-1 inline-flex items-center gap-1 rounded border-2 border-ink bg-c3 px-2 py-0.5 font-mono text-[8px] font-bold uppercase">
                <SplitSquareVertical className="h-2.5 w-2.5" /> split into shots
              </button>
            </div>

            <div className="rounded-xl border-2 border-ink bg-card p-2 shadow-[3px_3px_0_var(--color-ink)]">
              <p className="mono-label mb-1">backdrop image</p>
              <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border-2 border-dashed border-ink/40 px-2 py-1.5">
                <span className="truncate font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3">
                  {photoName || 'drop a photo — duotoned to the grade'}
                </span>
                <span className="rounded border-2 border-ink bg-c3 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase">choose</span>
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    const img = new Image()
                    img.onload = () => { photoRef.current = img; setPhotoName(f.name.slice(0, 22)) }
                    img.src = URL.createObjectURL(f)
                  }} />
              </label>
              {photoName && (
                <button type="button" onClick={() => { photoRef.current = null; setPhotoName('') }}
                  className="mt-1 w-full rounded border-2 border-ink bg-[#f4f2ea] px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase">
                  remove photo
                </button>
              )}
            </div>

            <Link to="/interview" className="rounded-xl border-2 border-ink bg-card px-2.5 py-1.5 text-center font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]">
              practise the real thing →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
