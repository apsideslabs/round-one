import { useEffect, useMemo, useRef, useState } from 'react'
import { Play, Pause, Download, RotateCcw } from 'lucide-react'
import { parseAnswer, substance, type Beat } from '@/data/kinetic'

const SAMPLE = `I am a final year student. Basically I did a project with my team. It was a billing app in Flask, and I found a GST rounding bug that cost one paisa. We reduced manual checks from four hours to twenty minutes.`

const COLOUR: Record<Beat['kind'], string> = {
  number: '#f5b01b',
  specific: '#0e8c6a',
  connector: '#2f5bff',
  vague: '#be123c',
  plain: '#12151a'
}

/** Your answer, as twenty seconds of motion graphics. Records to a .webm. */
export function Kinetic() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [text, setText] = useState(SAMPLE)
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [recording, setRecording] = useState(false)
  const beats = useMemo(() => parseAnswer(text, 18), [text])
  const stats = useMemo(() => substance(beats), [beats])
  const recorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])

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
    const ctx = cv.getContext('2d')
    if (!ctx) return
    let raf = 0

    const draw = () => {
      const rect = cv.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      if (cv.width !== Math.floor(rect.width * dpr)) {
        cv.width = Math.floor(rect.width * dpr)
        cv.height = Math.floor(rect.height * dpr)
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const w = rect.width
      const h = rect.height
      ctx.fillStyle = '#f7f5ee'
      ctx.fillRect(0, 0, w, h)

      const current = beats.find((b) => t >= b.start && t < b.start + b.dur)
      const index = current ? beats.indexOf(current) : beats.length - 1
      const p = current ? (t - current.start) / current.dur : 1

      // the whole answer as a rail along the bottom
      let x = 24
      beats.forEach((b, i) => {
        const bw = (b.dur / 18) * (w - 48)
        const active = i === index
        const done = i < index
        ctx.fillStyle = active ? COLOUR[b.kind] : done ? 'rgba(18,21,26,0.22)' : 'rgba(18,21,26,0.1)'
        ctx.fillRect(x, h - 26, Math.max(2, bw - 3), active ? 8 : 5)
        x += bw
      })

      if (!current) { raf = requestAnimationFrame(draw); return }

      const kind = current.kind
      const words = current.text.split(' ')
      const enter = Math.min(1, p * 5)
      const exit = Math.max(0, (p - 0.75) / 0.25)

      // each kind of phrase behaves differently
      if (kind === 'vague') {
        // vague phrases float up and dissolve
        words.forEach((word, i) => {
          const size = Math.max(16, Math.min(44, (w / Math.max(6, current.text.length)) * 2.1))
          ctx.globalAlpha = Math.max(0, 1 - exit) * 0.85
          ctx.fillStyle = COLOUR.vague
          ctx.font = `700 ${size}px Manrope, sans-serif`
          ctx.textAlign = 'center'
          const spread = (i - (words.length - 1) / 2) * (w / (words.length + 2))
          ctx.fillText(word, w / 2 + spread, h / 2 - p * 60 + i * 4)
        })
        ctx.globalAlpha = 1
      } else if (kind === 'number') {
        // numbers punch in and stay
        const scale = 1 + (1 - enter) * 0.6
        let base = Math.min(96, Math.max(34, (w / Math.max(8, current.text.length)) * 2.6))
        ctx.font = `800 ${base}px "Bricolage Grotesque", sans-serif`
        while (ctx.measureText(current.text).width > w - 80 && base > 20) {
          base -= 3
          ctx.font = `800 ${base}px "Bricolage Grotesque", sans-serif`
        }
        const size = base * scale
        ctx.save()
        ctx.translate(w / 2, h / 2)
        ctx.fillStyle = COLOUR.number
        ctx.font = `800 ${size}px "Bricolage Grotesque", sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(current.text, 0, 0)
        ctx.strokeStyle = '#12151a'
        ctx.lineWidth = 2
        ctx.strokeText(current.text, 0, 0)
        ctx.restore()
      } else {
        // plain and specific phrases slide in from the left
        let size = Math.min(52, Math.max(22, (w / Math.max(10, current.text.length)) * 2.2))
        ctx.font = `700 ${size}px Manrope, sans-serif`
        while (ctx.measureText(current.text).width > w - 60 && size > 14) {
          size -= 2
          ctx.font = `700 ${size}px Manrope, sans-serif`
        }
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        let cursor = 30 + (1 - enter) * 80
        ctx.fillStyle = COLOUR[kind]
        words.forEach((word) => {
          const wordW = ctx.measureText(word + ' ').width
          if (cursor + wordW > w - 30) return
          ctx.fillText(word, cursor, h / 2)
          cursor += wordW
        })
        if (kind === 'connector') {
          ctx.strokeStyle = COLOUR.connector
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.moveTo(30, h / 2 + size * 0.8)
          ctx.lineTo(Math.min(w - 30, cursor), h / 2 + size * 0.8)
          ctx.stroke()
        }
      }

      // timecode
      ctx.fillStyle = 'rgba(18,21,26,0.45)'
      ctx.font = '700 10px "JetBrains Mono", monospace'
      ctx.textAlign = 'left'
      ctx.fillText(`${t.toFixed(1)}s / 18.0s · ${kind}`, 24, 26)

      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [beats, t])

  const record = () => {
    const cv = canvas.current
    if (!cv || recording) return
    const stream = cv.captureStream(30)
    const rec = new MediaRecorder(stream, { mimeType: 'video/webm' })
    chunks.current = []
    rec.ondataavailable = (e) => { if (e.data.size) chunks.current.push(e.data) }
    rec.onstop = () => {
      const blob = new Blob(chunks.current, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'answer-film.webm'
      a.click()
      URL.revokeObjectURL(url)
      setRecording(false)
    }
    recorder.current = rec
    setRecording(true)
    setT(0)
    setPlaying(true)
    rec.start()
    window.setTimeout(() => rec.stop(), 18500)
  }

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <div className="grid min-h-0 gap-2 p-2.5 lg:grid-cols-[1fr_300px]">
        <div className="relative overflow-hidden rounded-xl border-[3px] border-ink bg-[#f7f5ee] shadow-[5px_5px_0_var(--color-ink)]">
          <canvas ref={canvas} className="h-full w-full" />
        </div>

        <div className="grid content-start gap-2">
          <div className="rounded-xl border-2 border-ink bg-card p-2 shadow-[3px_3px_0_var(--color-ink)]">
            <p className="mono-label mb-1">your answer</p>
            <textarea value={text} onChange={(e) => setText(e.target.value)}
              className="h-28 w-full resize-none rounded-lg border-2 border-ink bg-paper px-2 py-1.5 text-[11.5px] font-medium leading-snug outline-none" />
            <p className="mt-1 font-mono text-[8.5px] uppercase tracking-wider text-ink-3">
              {stats.scored} weighted · {stats.vague} vague · {Math.round(stats.ratio * 100)}% substance
            </p>
          </div>

          <div className="rounded-xl border-2 border-ink bg-card p-2 shadow-[3px_3px_0_var(--color-ink)]">
            <p className="mono-label mb-1">legend</p>
            <ul className="grid gap-0.5 text-[10.5px] font-medium">
              {(['number', 'specific', 'connector', 'vague', 'plain'] as const).map((k) => (
                <li key={k} className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm border border-ink" style={{ background: COLOUR[k] }} />
                  <span className="capitalize">{k}</span>
                  <span className="text-ink-3">
                    {k === 'number' && '— punches in'}
                    {k === 'specific' && '— slides, lands'}
                    {k === 'connector' && '— draws a line'}
                    {k === 'vague' && '— floats and dissolves'}
                    {k === 'plain' && '— moves through'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t-2 border-ink bg-paper px-3 py-2">
        <button type="button" onClick={() => setPlaying((p) => !p)} className="grid h-7 w-7 place-items-center rounded-md border-2 border-ink bg-c1 text-white shadow-[2px_2px_0_var(--color-ink)]">
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button type="button" onClick={() => { setT(0); setPlaying(false) }} className="grid h-7 w-7 place-items-center rounded-md border-2 border-ink bg-card shadow-[2px_2px_0_var(--color-ink)]">
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
        <input type="range" min={0} max={18} step={0.05} value={t} onChange={(e) => { setPlaying(false); setT(Number(e.target.value)) }} className="w-40 accent-[#ff4b26]" />
        <button type="button" onClick={record} disabled={recording}
          className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink bg-c2 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)] disabled:opacity-60">
          <Download className="h-3 w-3" /> {recording ? 'recording…' : 'record .webm'}
        </button>
        <span className="font-mono text-[9px] uppercase tracking-wider text-ink-3">records in the browser — nothing uploaded</span>
      </div>
    </div>
  )
}
