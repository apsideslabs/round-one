import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Pause, RotateCcw, Download, Image as ImageIcon } from 'lucide-react'
import { parseAnswer, substance } from '@/data/kinetic'
import { PALETTES, layoutFilm, ease, grainTile, type Grade } from '@/lib/film'

const W = 1280
const H = 720
const SAMPLE = `I am a final year computer science student. Basically I did a project with my team. It was a billing app in Flask, and I found a GST rounding bug that cost one paisa. We reduced manual checks from four hours to twenty minutes.`

export default function Film() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [text, setText] = useState(SAMPLE)
  const [grade, setGrade] = useState<Grade>('paper')
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [recording, setRecording] = useState(false)
  const beats = useMemo(() => parseAnswer(text, 18), [text])
  const scenes = useMemo(() => layoutFilm(beats), [beats])
  const stats = useMemo(() => substance(beats), [beats])
  const pal = PALETTES[grade]
  const grain = useRef<string>('')
  const rec = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

  useEffect(() => { grain.current = grainTile() }, [])
  useEffect(() => { setT(0); setPlaying(true) }, [text])

  useEffect(() => {
    if (!playing) return
    let raf = 0
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setT((v) => (v + dt > 18 ? 0 : v + dt))
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  useEffect(() => {
    const cv = canvas.current
    if (!cv) return
    const ctx = cv.getContext('2d')!
    let raf = 0
    const img = new Image()

    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      if (cv.width !== W * dpr) { cv.width = W * dpr; cv.height = H * dpr }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // ---- ground
      ctx.fillStyle = pal.bg
      ctx.fillRect(0, 0, W, H)
      const glow = ctx.createRadialGradient(W * 0.5, H * 0.42, 60, W * 0.5, H * 0.5, W * 0.8)
      glow.addColorStop(0, grade === 'paper' ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.05)')
      glow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, W, H)

      const scene = scenes.find((s) => t >= s.beat.start && t < s.beat.start + s.beat.dur)
        ?? (scenes.length && t < scenes[0].beat.start ? scenes[0] : scenes[scenes.length - 1])
      const local = scene ? t - scene.beat.start : 0

      // ---- camera
      const zoom = scene ? 1 + (scene.zoom - 1) * Math.min(1, local / 0.6) : 1
      ctx.save()
      ctx.translate(W / 2, H / 2)
      ctx.scale(zoom, zoom)
      ctx.translate(-W / 2, -H / 2)

      // ---- words
      if (scene) {
        scene.words.forEach((word) => {
          const p = Math.max(0, Math.min(1, (local - word.enter) / 0.45))
          if (p <= 0) return
          const e = ease(scene.beat.kind, p)
          const isVague = scene.beat.kind === 'vague'
          const drift = isVague ? (local - word.enter) * 26 : 0
          const alpha = isVague ? Math.max(0, 1 - Math.max(0, local - 0.9) / 1.1) : 1
          ctx.save()
          ctx.globalAlpha = alpha * (isVague ? 0.85 : 1)
          ctx.translate(word.x, word.y - (1 - e) * 30 - drift)
          ctx.rotate(word.rotate * (1 - e))
          ctx.fillStyle = scene.beat.kind === 'number' ? pal.number : isVague ? pal.vague : scene.beat.kind === 'specific' ? pal.accent : pal.ink
          ctx.font = `${word.weight} ${word.size}px ${scene.beat.kind === 'number' ? '"Bricolage Grotesque", Manrope' : 'Manrope'}, sans-serif`
          ctx.textBaseline = 'alphabetic'
          ctx.fillText(word.text, 0, 0)
          ctx.restore()
        })

        // ---- motifs
        const p = Math.min(1, local / Math.max(0.4, scene.beat.dur * 0.8))
        if (scene.motif === 'ring') {
          const cx = W / 2
          const cy = H / 2
          const r = 190 + (1 - p) * 40
          ctx.strokeStyle = pal.accent
          ctx.globalAlpha = 0.9
          ctx.lineWidth = 3
          ctx.setLineDash([420, 420])
          ctx.lineDashOffset = 420 * (1 - p)
          ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI * 0.75, Math.PI * 0.75); ctx.stroke()
          ctx.setLineDash([])
          ctx.globalAlpha = 1
        }
        if (scene.motif === 'sweep' || scene.motif === 'rail') {
          const y = H / 2 + 56
          ctx.strokeStyle = scene.motif === 'rail' ? pal.accent : pal.line
          ctx.lineWidth = scene.motif === 'rail' ? 3 : 2
          ctx.beginPath()
          ctx.moveTo(96, y)
          ctx.lineTo(96 + (W - 192) * ease('specific', p), y)
          ctx.stroke()
        }
        if (scene.motif === 'smoke') {
          for (let i = 0; i < 26; i++) {
            const seed = Math.sin(i * 12.9898) * 43758.5453
            const r = seed - Math.floor(seed)
            const x = 160 + r * (W - 320) + Math.sin(local * 1.2 + i) * 24
            const y = H / 2 - 40 - local * 40 * (0.4 + r)
            ctx.globalAlpha = Math.max(0, 0.22 - local * 0.12) * (0.5 + r)
            ctx.fillStyle = pal.vague
            ctx.beginPath(); ctx.arc(x, y, 1.4 + r * 3.2, 0, Math.PI * 2); ctx.fill()
          }
          ctx.globalAlpha = 1
        }
      }
      ctx.restore()

      // ---- chrome: title card, progress, footer
      const showTitle = t < 1.6
      if (showTitle) {
        const a = 1 - Math.max(0, (t - 1.1) / 0.5)
        ctx.globalAlpha = a
        ctx.fillStyle = pal.ink
        ctx.font = '800 20px Manrope, sans-serif'
        ctx.fillText('YOUR ANSWER', 96, H - 108)
        ctx.fillStyle = pal.muted
        ctx.font = '600 15px Manrope, sans-serif'
        ctx.fillText(`${stats.scored} weighted phrases · ${stats.vague} vague · ${Math.round(stats.ratio * 100)}% substance`, 96, H - 82)
        ctx.globalAlpha = 1
      }

      // end card
      if (t > 16.4) {
        const a = Math.min(1, (t - 16.4) / 0.5)
        ctx.globalAlpha = a
        ctx.fillStyle = pal.bg // fully opaque: the end card must not ghost the last phrase
        ctx.fillRect(0, 0, W, H)
        ctx.fillStyle = pal.muted
        ctx.font = '800 15px "JetBrains Mono", monospace'
        ctx.fillText('THE ANSWER, SCORED', 96, H / 2 - 96)
        ctx.fillStyle = pal.ink
        ctx.font = '800 148px "Bricolage Grotesque", Manrope, sans-serif'
        ctx.fillText(`${Math.round(stats.ratio * 100)}%`, 96, H / 2 + 34)
        ctx.fillStyle = pal.muted
        ctx.font = '600 20px Manrope, sans-serif'
        ctx.fillText('substance', 100, H / 2 + 72)
        ctx.fillStyle = pal.accent
        ctx.fillRect(96, H / 2 + 92, 64, 4)
        ctx.fillStyle = pal.ink
        ctx.font = '600 18px Manrope, sans-serif'
        ctx.fillText(`${stats.scored} phrases carried weight · ${stats.vague} dissolved`, 96, H / 2 + 132)
        ctx.globalAlpha = 1
      }

      // progress rail
      const railY = H - 44
      ctx.fillStyle = pal.line
      ctx.fillRect(96, railY, W - 192, 4)
      beats.forEach((b) => {
        const x = 96 + (b.start / 18) * (W - 192)
        const w = (b.dur / 18) * (W - 192)
        const active = t >= b.start && t < b.start + b.dur
        ctx.fillStyle = active ? pal.accent : b.kind === 'number' ? pal.number : pal.line
        ctx.globalAlpha = active ? 1 : 0.55
        ctx.fillRect(x, railY - 3, Math.max(2, w - 4), active ? 10 : 4)
      })
      ctx.globalAlpha = 1
      ctx.fillStyle = pal.muted
      ctx.font = '700 12px "JetBrains Mono", monospace'
      ctx.fillText(`${t.toFixed(1)}s / 18.0s`, 96, railY - 18)

      // grain + vignette
      if (grain.current) {
        if (!img.src) img.src = grain.current
        if (img.complete) {
          ctx.globalAlpha = pal.grain
          ctx.globalCompositeOperation = 'overlay'
          ctx.fillStyle = ctx.createPattern(img, 'repeat')!
          ctx.fillRect(0, 0, W, H)
          ctx.globalCompositeOperation = 'source-over'
          ctx.globalAlpha = 1
        }
      }
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95)
      vig.addColorStop(0, 'rgba(0,0,0,0)')
      vig.addColorStop(1, grade === 'paper' ? 'rgba(18,21,26,0.06)' : 'rgba(0,0,0,0.45)')
      ctx.fillStyle = vig
      ctx.fillRect(0, 0, W, H)

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [scenes, beats, t, pal, grade, stats])

  const record = () => {
    const cv = canvas.current
    if (!cv || recording) return
    const stream = cv.captureStream(30)
    const r = new MediaRecorder(stream, { mimeType: 'video/webm' })
    chunks.current = []
    r.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data) }
    r.onstop = () => {
      const url = URL.createObjectURL(new Blob(chunks.current, { type: 'video/webm' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'answer-film.webm'
      a.click()
      URL.revokeObjectURL(url)
      setRecording(false)
    }
    rec.current = r
    setRecording(true)
    setT(0)
    setPlaying(true)
    r.start()
    window.setTimeout(() => r.stop(), 18500)
  }

  const poster = () => {
    const cv = canvas.current
    if (!cv) return
    const a = document.createElement('a')
    a.href = cv.toDataURL('image/png')
    a.download = 'answer-poster.png'
    a.click()
  }

  return (
    <div className="w-full px-3 pb-20 pt-3 sm:px-5 md:pb-6 lg:px-6">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="chip bg-ink text-paper">Film</span>
            <h1 className="mt-1 font-display text-xl font-extrabold tracking-tight">Your answer, as a film</h1>
            <p className="text-[11.5px] font-medium text-ink-3">eighteen seconds · word by word · rendered in the browser</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {(['paper', 'night', 'blueprint'] as Grade[]).map((g) => (
              <button key={g} type="button" onClick={() => setGrade(g)}
                className={`rounded-md border-2 border-ink px-2 py-0.5 font-mono text-[8.5px] font-bold uppercase tracking-wider ${grade === g ? 'bg-ink text-paper' : 'bg-card'}`}>
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-2.5 lg:grid-cols-[1fr_300px]">
          <div className="overflow-hidden rounded-2xl border-[3px] border-ink bg-black shadow-[6px_6px_0_var(--color-ink)]">
            <canvas ref={canvas} className="block w-full" style={{ aspectRatio: '16 / 9' }} />
          </div>

          <div className="grid content-start gap-2">
            <div className="rounded-xl border-2 border-ink bg-card p-2 shadow-[3px_3px_0_var(--color-ink)]">
              <p className="mono-label mb-1">the answer</p>
              <textarea value={text} onChange={(e) => setText(e.target.value)}
                className="h-32 w-full resize-none rounded-lg border-2 border-ink bg-paper px-2 py-1.5 text-[11.5px] font-medium leading-snug outline-none" />
              <div className="mt-1 flex gap-1">
                <button type="button" onClick={() => setText(SAMPLE)} className="rounded border-2 border-ink bg-[#f4f2ea] px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider">sample</button>
                <button type="button" onClick={() => setText('')} className="rounded border-2 border-ink bg-card px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-wider">clear</button>
              </div>
            </div>

            <div className="rounded-xl border-2 border-ink bg-card p-2 shadow-[3px_3px_0_var(--color-ink)]">
              <p className="mono-label mb-1">the read</p>
              <div className="grid grid-cols-3 gap-1 text-center">
                {[['weighted', stats.scored], ['vague', stats.vague], ['substance', `${Math.round(stats.ratio * 100)}%`]].map(([k, v]) => (
                  <div key={String(k)}>
                    <p className="font-display text-base font-extrabold tabular-nums">{String(v)}</p>
                    <p className="font-mono text-[7px] uppercase tracking-wider text-ink-3">{k}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border-2 border-ink bg-card p-2 shadow-[3px_3px_0_var(--color-ink)]">
              <p className="mono-label mb-1">how each phrase moves</p>
              <ul className="grid gap-0.5 text-[10.5px] font-medium">
                <li><span className="font-bold">number</span> — snaps in, ring draws around it</li>
                <li><span className="font-bold">specific</span> — settles, underline sweeps</li>
                <li><span className="font-bold">connector</span> — a rail draws beneath</li>
                <li><span className="font-bold">vague</span> — floats up and dissolves</li>
              </ul>
            </div>

            <Link to="/interview" className="rounded-xl border-2 border-ink bg-card px-2.5 py-1.5 text-center font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]">
              practise the real thing →
            </Link>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-xl border-2 border-ink bg-card px-3 py-2 shadow-[3px_3px_0_var(--color-ink)]">
          <button type="button" onClick={() => setPlaying((p) => !p)} className="grid h-8 w-8 place-items-center rounded-md border-2 border-ink bg-c1 text-white shadow-[2px_2px_0_var(--color-ink)]">
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button type="button" onClick={() => { setT(0); setPlaying(false) }} className="grid h-8 w-8 place-items-center rounded-md border-2 border-ink bg-card shadow-[2px_2px_0_var(--color-ink)]">
            <RotateCcw className="h-4 w-4" />
          </button>
          <input type="range" min={0} max={18} step={0.05} value={t} onChange={(e) => { setPlaying(false); setT(Number(e.target.value)) }} className="min-w-[160px] flex-1 accent-[#ff4b26]" />
          <button type="button" onClick={record} disabled={recording}
            className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink bg-c2 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)] disabled:opacity-60">
            <Download className="h-3 w-3" /> {recording ? 'recording…' : '.webm'}
          </button>
          <button type="button" onClick={poster}
            className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink bg-card px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]">
            <ImageIcon className="h-3 w-3" /> poster
          </button>
        </div>
      </div>
    </div>
  )
}
