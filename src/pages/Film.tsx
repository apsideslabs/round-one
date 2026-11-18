import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Pause, RotateCcw, Download, Image as ImageIcon, Plus, Trash2, SplitSquareVertical } from 'lucide-react'
import { buildFilm, sceneAt, ease, grainTile, PALETTES, KINDS, W, H, type Grade, type Kind, type Line } from '@/lib/film'

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
  useEffect(() => { const img = new Image(); img.src = grainTile(); grain.current = img }, [])

  // one loop for the life of the page
  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    const ctx = cv.getContext('2d')!
    let raf = 0
    let last = performance.now()

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (playing.current) {
        time.current += dt
        if (time.current > 18) time.current = 0
      }
      const t = time.current
      const p = pal.current
      const list = scenes.current

      const dpr = Math.min(2, window.devicePixelRatio || 1)
      if (cv.width !== W * dpr) { cv.width = W * dpr; cv.height = H * dpr }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // ground
      ctx.fillStyle = p.bg
      ctx.fillRect(0, 0, W, H)

      // moving dot grid — gives the frame depth without noise
      ctx.fillStyle = p.line
      const shift = (t * 12) % 40
      for (let x = -40; x < W + 40; x += 40) {
        for (let y = -40; y < H + 40; y += 40) {
          ctx.beginPath()
          ctx.arc(x + shift, y + shift * 0.5, 1.1, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      const scene = list.length ? sceneAt(list, t) : null
      if (!scene) { raf = requestAnimationFrame(draw); return }
      const local = t - scene.start

      // wipe transition at the start of every line
      if (local < 0.22) {
        const k = local / 0.22
        ctx.fillStyle = p.accent
        ctx.globalAlpha = 0.9 - k * 0.9
        ctx.fillRect(0, 0, W * (1 - k), 3)
        ctx.fillRect(0, H - 3, W * (1 - k), 3)
        ctx.globalAlpha = 1
      }

      // camera
      const zoom = 1 + (scene.zoom - 1) * Math.min(1, local / 0.6)
      ctx.save()
      ctx.translate(W / 2, H / 2)
      ctx.scale(zoom, zoom)
      ctx.translate(-W / 2, -H / 2)

      scene.words.forEach((word) => {
        const enter = Math.max(0, Math.min(1, (local - word.enter) / 0.42))
        if (enter <= 0) return
        const e = ease(scene.line.kind, enter)
        const isVague = scene.line.kind === 'vague'
        const drift = isVague ? Math.max(0, local - word.enter) * 22 : 0
        const fade = isVague ? Math.max(0, 1 - Math.max(0, local - 0.9) / 1.2) : 1
        ctx.save()
        ctx.globalAlpha = fade * (isVague ? 0.8 : 1)
        ctx.translate(word.x, word.y - (1 - e) * 26 - drift)
        ctx.rotate(word.rotate * (1 - e))
        ctx.fillStyle = scene.line.kind === 'number' ? p.number : isVague ? p.vague : scene.line.kind === 'specific' ? p.accent : p.ink
        ctx.font = `${word.weight} ${word.size}px ${scene.line.kind === 'number' ? '"Bricolage Grotesque", Manrope' : 'Manrope'}, sans-serif`
        ctx.fillText(word.text, 0, 0)
        ctx.restore()
      })

      const prog = Math.min(1, local / Math.max(0.4, scene.dur * 0.75))
      if (scene.motif === 'ring') {
        ctx.strokeStyle = p.accent
        ctx.lineWidth = 3
        ctx.setLineDash([460, 460])
        ctx.lineDashOffset = 460 * (1 - prog)
        ctx.beginPath(); ctx.arc(W / 2, H / 2, 210, -Math.PI * 0.78, Math.PI * 0.78); ctx.stroke()
        ctx.setLineDash([])
      }
      if (scene.motif === 'sweep' || scene.motif === 'rail') {
        ctx.strokeStyle = scene.motif === 'rail' ? p.accent : p.line
        ctx.lineWidth = scene.motif === 'rail' ? 3 : 2
        ctx.beginPath(); ctx.moveTo(96, H / 2 + 62); ctx.lineTo(96 + (W - 192) * ease('specific', prog), H / 2 + 62); ctx.stroke()
      }
      if (scene.motif === 'smoke') {
        for (let i = 0; i < 24; i++) {
          const seed = Math.sin(i * 12.9898) * 43758.5453
          const r = seed - Math.floor(seed)
          ctx.globalAlpha = Math.max(0, 0.2 - local * 0.1) * (0.4 + r)
          ctx.fillStyle = p.vague
          ctx.beginPath()
          ctx.arc(170 + r * (W - 340) + Math.sin(local * 1.3 + i) * 22, H / 2 - 30 - local * 34 * (0.4 + r), 1.2 + r * 3, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }
      ctx.restore()

      // title (first 1.4s) and end card (last 1.6s)
      if (t < 1.4) {
        ctx.globalAlpha = 1 - Math.max(0, (t - 0.9) / 0.5)
        ctx.fillStyle = p.muted
        ctx.font = '800 14px "JetBrains Mono", monospace'
        ctx.fillText(meta.current.title.toUpperCase(), 96, H - 104)
        ctx.fillStyle = p.ink
        ctx.font = '700 16px Manrope, sans-serif'
        ctx.fillText(`${Math.round(meta.current.ratio * 100)}% of these lines carry weight`, 96, H - 78)
        ctx.globalAlpha = 1
      }
      if (t > 16.4) {
        ctx.globalAlpha = Math.min(1, (t - 16.4) / 0.5)
        ctx.fillStyle = p.bg
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = p.muted
        ctx.font = '800 14px "JetBrains Mono", monospace'
        ctx.fillText('THE ANSWER, SCORED', 96, H / 2 - 92)
        ctx.fillStyle = p.ink
        ctx.font = '800 150px "Bricolage Grotesque", Manrope, sans-serif'
        ctx.fillText(`${Math.round(meta.current.ratio * 100)}%`, 96, H / 2 + 40)
        ctx.fillStyle = p.muted
        ctx.font = '600 20px Manrope, sans-serif'
        ctx.fillText('of your lines carry weight', 100, H / 2 + 78)
        ctx.fillStyle = p.accent
        ctx.fillRect(96, H / 2 + 96, 64, 4)
        ctx.globalAlpha = 1
      }

      // rail
      const railY = H - 40
      ctx.fillStyle = p.line
      ctx.fillRect(96, railY, W - 192, 3)
      list.forEach((s) => {
        const x = 96 + (s.start / 18) * (W - 192)
        const w = (s.dur / 18) * (W - 192)
        const active = t >= s.start && t < s.start + s.dur
        ctx.fillStyle = active ? p.accent : s.line.kind === 'number' ? p.number : p.line
        ctx.fillRect(x, railY - 2, Math.max(2, w - 4), active ? 8 : 3)
      })

      // grain + vignette
      if (grain.current?.complete) {
        ctx.globalAlpha = p.grain
        ctx.globalCompositeOperation = 'overlay'
        const pat = ctx.createPattern(grain.current, 'repeat')
        if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H) }
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
      }
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, H)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, grade === 'paper' ? 'rgba(18,21,26,0.05)' : 'rgba(0,0,0,0.45)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, W, H)

      // DOM updates without React
      if (scrub.current && document.activeElement !== scrub.current) scrub.current.value = String(t)
      if (clock.current) clock.current.textContent = `${t.toFixed(1)}s`

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
          <div className="flex gap-1">
            {(['paper', 'night', 'blueprint'] as Grade[]).map((g) => (
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

            <Link to="/interview" className="rounded-xl border-2 border-ink bg-card px-2.5 py-1.5 text-center font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]">
              practise the real thing →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
