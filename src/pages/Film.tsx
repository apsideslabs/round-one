import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Pause, RotateCcw, Download, Image as ImageIcon, Plus, Trash2, SplitSquareVertical } from 'lucide-react'
import { buildFilm, sceneAt, ease, spring, rand, ghostWord, grainTile, PALETTES, KINDS, W, H, type Grade, type Kind, type Line } from '@/lib/film'

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

    // offscreen buffer for bloom: accents are drawn here, blurred, then laid back
    const bloom = document.createElement('canvas')
    bloom.width = Math.floor(W / 3)
    bloom.height = Math.floor(H / 3)
    const bctx = bloom.getContext('2d')!

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
      bctx.setTransform(1, 0, 0, 1, 0, 0)
      bctx.clearRect(0, 0, bloom.width, bloom.height)

      // ---------- backdrop: gradient, parallax grid, drifting ghost letter
      const bg = ctx.createLinearGradient(0, 0, W, H)
      bg.addColorStop(0, p.bg)
      bg.addColorStop(1, grade === 'paper' ? '#f2ecdd' : grade === 'night' ? '#141922' : '#08203c')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      const drift = Math.sin(t * 0.35) * 18
      ctx.fillStyle = p.line
      for (let x = -60; x < W + 60; x += 44) {
        for (let y = -60; y < H + 60; y += 44) {
          const px = x + ((t * 9) % 44) + drift * 0.3
          const py = y + ((t * 5) % 44)
          const near = Math.hypot(px - W / 2, py - H / 2)
          const r = near < 300 ? 1.6 : 1
          ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2); ctx.fill()
        }
      }

      const scene = list.length ? sceneAt(list, t) : null
      if (!scene) { raf = requestAnimationFrame(draw); return }
      const local = t - scene.start
      const prev = list[list.indexOf(scene) - 1]

      // ghost letter behind the type
      const ghost = ghostWord(scene.line.text)
      if (ghost) {
        ctx.save()
        ctx.globalAlpha = grade === 'paper' ? 0.05 : 0.07
        ctx.fillStyle = p.ink
        ctx.font = '800 420px "Bricolage Grotesque", Manrope, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(ghost, W / 2 + drift * 2, H * 0.72)
        ctx.restore()
      }

      // ---------- transition: mask wipe between shots
      const wipe = Math.min(1, local / 0.3)
      ctx.save()
      if (wipe < 1) {
        const edge = W * (0.5 + 0.5 * ease('plain', wipe))
        ctx.beginPath()
        ctx.rect(W / 2 - edge / 2, 0, edge, H)
        ctx.clip()
      }

      // camera: slow drift plus a per-kind push
      const camX = Math.sin(t * 0.6) * 6
      const camY = Math.cos(t * 0.45) * 4
      const zoom = 1 + (scene.zoom - 1) * Math.min(1, local / 0.7) + (1 - ease('plain', wipe)) * 0.04
      ctx.translate(W / 2 + camX, H / 2 + camY)
      ctx.scale(zoom, zoom)
      ctx.translate(-W / 2, -H / 2)

      // ---------- type: per-word mask reveal with spring
      scene.words.forEach((word, wi) => {
        const enter = Math.max(0, Math.min(1, (local - word.enter) / 0.5))
        if (enter <= 0) return
        const isVague = scene.line.kind === 'vague'
        const e = scene.line.kind === 'number' ? spring(enter) : ease(scene.line.kind, enter)
        const rise = (1 - e) * word.size * 0.9
        const fade = isVague ? Math.max(0, 1 - Math.max(0, local - 0.9) / 1.2) : 1

        ctx.save()
        ctx.globalAlpha = fade
        // mask reveal: clip to the word's own box so it appears to rise out of the baseline
        ctx.beginPath()
        ctx.rect(word.x - 6, word.y - word.size * 1.1, W, word.size * 1.35)
        ctx.clip()
        ctx.translate(word.x, word.y + rise)
        ctx.rotate(word.rotate * (1 - e))

        const colour = scene.line.kind === 'number' ? p.number : isVague ? p.vague : scene.line.kind === 'specific' ? p.accent : p.ink
        if (isVague) ctx.filter = `blur(${(1 - fade) * 3}px)`
        ctx.fillStyle = colour
        ctx.font = `${word.weight} ${word.size}px ${scene.line.kind === 'number' ? '"Bricolage Grotesque", Manrope' : 'Manrope'}, sans-serif`
        ctx.fillText(word.text, 0, 0)
        ctx.filter = 'none'

        // bloom pass: same word into the small buffer
        if (scene.line.kind === 'number' || scene.line.kind === 'specific') {
          bctx.fillStyle = colour
          bctx.font = `${word.weight} ${word.size / 3}px ${scene.line.kind === 'number' ? '"Bricolage Grotesque", Manrope' : 'Manrope'}, sans-serif`
          bctx.globalAlpha = 0.9 * fade
          bctx.fillText(word.text, (word.x + (wi % 2 ? 0 : 0)) / 3, (word.y + rise) / 3)
          bctx.globalAlpha = 1
        }
        ctx.restore()
      })

      // ---------- motif per kind
      const prog = Math.min(1, local / Math.max(0.5, scene.dur * 0.8))
      if (scene.motif === 'ring') {
        ctx.strokeStyle = p.accent
        ctx.lineWidth = 3
        ctx.setLineDash([520, 520])
        ctx.lineDashOffset = 520 * (1 - prog)
        ctx.beginPath(); ctx.arc(W / 2, H / 2, 232, -Math.PI * 0.8, Math.PI * 0.8); ctx.stroke()
        ctx.setLineDash([])
        // growth bar under the number
        ctx.fillStyle = p.accent
        ctx.fillRect(96, H / 2 + 120, (W - 192) * 0.55 * ease('number', prog), 6)
      }
      if (scene.motif === 'sweep') {
        const w = (W - 192) * ease('specific', prog)
        ctx.strokeStyle = p.accent
        ctx.lineWidth = 3
        ctx.beginPath(); ctx.moveTo(96, H / 2 + 66); ctx.lineTo(96 + w, H / 2 + 66); ctx.stroke()
        ctx.fillStyle = p.accent
        ctx.beginPath(); ctx.arc(96 + w, H / 2 + 66, 4, 0, Math.PI * 2); ctx.fill()
      }
      if (scene.motif === 'rail') {
        ctx.strokeStyle = p.accent
        ctx.lineWidth = 2.5
        ctx.beginPath(); ctx.moveTo(96, H / 2 + 70); ctx.lineTo(96 + (W - 192) * ease('plain', prog), H / 2 + 70); ctx.stroke()
      }
      if (scene.motif === 'smoke') {
        for (let i = 0; i < 30; i++) {
          const r = rand(i, 3)
          const r2 = rand(i, 9)
          ctx.globalAlpha = Math.max(0, 0.24 - local * 0.1) * (0.35 + r)
          ctx.fillStyle = p.vague
          ctx.beginPath()
          ctx.arc(150 + r * (W - 300) + Math.sin(local * 1.4 + i) * 26, H / 2 - 20 - local * 38 * (0.3 + r2), 1 + r2 * 3.4, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }
      ctx.restore()

      // ---------- shot furniture
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

      // ---------- bloom composite
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = grade === 'paper' ? 0.35 : 0.5
      ctx.filter = 'blur(14px)'
      ctx.drawImage(bloom, 0, 0, W, H)
      ctx.filter = 'none'
      ctx.restore()

      // ---------- end card
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

      // ---------- rail
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

      // ---------- grain + vignette
      if (grain.current?.complete) {
        ctx.globalAlpha = p.grain
        ctx.globalCompositeOperation = 'overlay'
        const pat = ctx.createPattern(grain.current, 'repeat')
        if (pat) { ctx.fillStyle = pat; ctx.fillRect(0, 0, W, H) }
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
      }
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, grade === 'paper' ? 'rgba(18,21,26,0.07)' : 'rgba(0,0,0,0.5)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, W, H)

      // DOM updates without React
      if (scrub.current && document.activeElement !== scrub.current) scrub.current.value = String(t)
      if (clock.current) clock.current.textContent = `${t.toFixed(1)}s`
      void prev

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
