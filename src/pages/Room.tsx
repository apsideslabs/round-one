import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mic as MicIcon, Square, Volume2, RotateCcw, ArrowRight } from 'lucide-react'
import { interview } from '@/data/interview'
import { canHear, canSpeak, canTranscribe, openMic, speak, stopSpeaking, transcribe, type Mic as MicHandle, type Transcript } from '@/lib/voice'
import { scoreDelivery, type Delivery } from '@/lib/voiceScore'
import { useProgress } from '@/store/progress'
import { shuffle } from '@/lib/utils'

type Phase = 'intro' | 'asking' | 'listening' | 'scored'

const ROUNDS = 3

export default function Room() {
  const addXp = useProgress((s) => s.addXp)
  const touch = useProgress((s) => s.touch)

  const [seed, setSeed] = useState(0)
  const questions = useMemo(() => shuffle(interview).slice(0, ROUNDS), [seed])
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('intro')
  const [seconds, setSeconds] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [delivery, setDelivery] = useState<Delivery | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [spoken, setSpoken] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const micRef = useRef<MicHandle | null>(null)
  const recRef = useRef<Transcript | null>(null)
  const rafRef = useRef(0)
  const timerRef = useRef(0)

  const question = questions[index]

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const mic = micRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    const cx = w / 2
    const cy = h / 2
    const bars = 64
    const data = new Uint8Array(mic ? mic.analyser.frequencyBinCount : bars)
    if (mic) mic.analyser.getByteFrequencyData(data)

    ctx.clearRect(0, 0, w, h)
    const t = performance.now() / 1000

    for (let i = 0; i < bars; i++) {
      const angle = (i / bars) * Math.PI * 2 - Math.PI / 2
      const level = mic ? data[Math.floor((i / bars) * (data.length * 0.6))] / 255 : 0.08 + 0.03 * Math.sin(t * 2 + i / 3)
      const len = 16 + level * 74
      const x1 = cx + Math.cos(angle) * 96
      const y1 = cy + Math.sin(angle) * 96
      const x2 = cx + Math.cos(angle) * (96 + len)
      const y2 = cy + Math.sin(angle) * (96 + len)
      ctx.strokeStyle = mic ? `rgba(255,75,38,${0.35 + level * 0.65})` : 'rgba(255,255,255,0.22)'
      ctx.lineWidth = 5
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
    rafRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [draw])

  const cleanup = useCallback(() => {
    window.clearInterval(timerRef.current)
    recRef.current?.stop()
    recRef.current = null
    micRef.current?.stop()
    micRef.current = null
    stopSpeaking()
  }, [])

  useEffect(() => cleanup, [cleanup])

  const ask = () => {
    setPhase('asking')
    setSpoken(false)
    setTranscript('')
    setDelivery(null)
    speak(`${question.question}. Take your time.`, { onEnd: () => setSpoken(true) })
    window.setTimeout(() => setSpoken(true), 9000)
  }

  const startListening = async () => {
    setError(null)
    setSeconds(0)
    setTranscript('')
    try {
      if (canHear()) micRef.current = await openMic()
    } catch {
      setError('Microphone blocked. You can still practise out loud — the timer will run, but pace cannot be measured.')
    }
    recRef.current = canTranscribe() ? transcribe(setTranscript) : null
    setPhase('listening')
    timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000)
  }

  const stopListening = () => {
    window.clearInterval(timerRef.current)
    const said = recRef.current?.text || transcript
    recRef.current?.stop()
    recRef.current = null
    micRef.current?.stop()
    micRef.current = null
    const result = scoreDelivery(seconds, said)
    setDelivery(result)
    setPhase('scored')
    touch()
    addXp(8)
  }

  const next = () => {
    if (index + 1 >= questions.length) {
      setPhase('intro')
      setSeed((s) => s + 1)
      setIndex(0)
      return
    }
    setIndex((i) => i + 1)
    setPhase('intro')
    setDelivery(null)
  }

  const stat = (label: string, value: string) => (
    <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2.5">
      <span className="block font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-white/45">{label}</span>
      <span className="mt-0.5 block font-display text-lg font-extrabold text-white">{value}</span>
    </div>
  )

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] w-full bg-ink px-4 pb-24 pt-6 text-white sm:px-6 md:pb-12 lg:px-10">
      <div className="mx-auto grid w-full max-w-[1100px] gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
              Room 01 · {index + 1} of {questions.length}
            </span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
              {phase === 'listening' ? 'listening' : phase === 'scored' ? 'debrief' : 'standby'}
            </span>
          </div>

          {phase === 'intro' ? (
            <p className="mt-4 max-w-[34ch] font-display text-2xl font-extrabold leading-tight tracking-tight text-white/35 sm:text-4xl">
              Question {index + 1} of {questions.length} — press play, and listen.
            </p>
          ) : (
            <h1
              className={`mt-4 max-w-[26ch] text-balance font-display text-3xl font-extrabold leading-[1.05] tracking-tighter transition-opacity duration-700 sm:text-5xl ${
                phase === 'listening' ? 'opacity-100' : spoken ? 'opacity-25' : 'opacity-100'
              }`}
            >
              {phase === 'listening' ? 'Answer it out loud.' : question.question}
            </h1>
          )}

          {phase === 'asking' && !spoken && (
            <p className="mt-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-c3">
              <Volume2 className="h-3.5 w-3.5 animate-pulse" /> speaking the question
            </p>
          )}

          {/* the visualiser */}
          <div className="relative mx-auto mt-8 grid place-items-center">
            <canvas ref={canvasRef} width={340} height={340} className="h-[300px] w-[300px] sm:h-[340px] sm:w-[340px]" />
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <span className="block font-display text-5xl font-extrabold tabular-nums">
                  {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
                </span>
                <span className="mt-1 block font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">
                  {phase === 'listening' ? 'recording' : 'ready'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {phase === 'intro' && (
              <>
                <button
                  type="button"
                  onClick={ask}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-white bg-white px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink"
                >
                  <Volume2 className="h-4 w-4" /> {canSpeak() ? 'Hear the question' : 'Show the question'}
                </button>
                <button
                  type="button"
                  onClick={startListening}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-c1 bg-c1 px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white"
                >
                  <MicIcon className="h-4 w-4" /> Start answering
                </button>
              </>
            )}

            {phase === 'asking' && (
              <button
                type="button"
                onClick={startListening}
                className="inline-flex items-center gap-2 rounded-full border-2 border-c1 bg-c1 px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white"
              >
                <MicIcon className="h-4 w-4" /> Answer now
              </button>
            )}

            {phase === 'listening' && (
              <button
                type="button"
                onClick={stopListening}
                className="inline-flex items-center gap-2 rounded-full border-2 border-white bg-white px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink"
              >
                <Square className="h-4 w-4" /> Finish answer
              </button>
            )}

            {phase === 'scored' && (
              <button
                type="button"
                onClick={next}
                className="inline-flex items-center gap-2 rounded-full border-2 border-c1 bg-c1 px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white"
              >
                {index + 1 >= questions.length ? 'Finish the room' : 'Next question'} <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {error && <p className="mt-4 text-center font-mono text-[10px] leading-relaxed text-c3">{error}</p>}
        </div>

        {/* debrief rail */}
        <aside className="lg:pt-10">
          {phase === 'scored' && delivery ? (
            <div className="grid gap-3">
              <div className="grid grid-cols-3 gap-2">
                {stat('spoken', `${delivery.seconds}s`)}
                {stat('pace', delivery.pace ? `${delivery.pace} wpm` : '—')}
                {stat('fillers', String(delivery.fillers))}
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                <p className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white/45">Debrief</p>
                <ul className="mt-2 grid gap-2">
                  {delivery.notes.map((n) => (
                    <li key={n} className="text-[12.5px] font-medium leading-relaxed text-white/75">— {n}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                <p className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white/45">Structure to aim for</p>
                <ol className="mt-2 grid gap-1.5">
                  {question.skeleton.map((s, i) => (
                    <li key={s} className="grid grid-cols-[14px_1fr] gap-2 text-[12px] font-medium leading-relaxed text-white/70">
                      <span className="font-mono text-[9px] text-white/40">{i + 1}</span>
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              {transcript && (
                <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                  <p className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white/45">What we heard</p>
                  <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-white/60">{transcript}</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => { setPhase('intro'); setSeconds(0); setDelivery(null) }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/70"
              >
                <RotateCcw className="h-3 w-3" /> Try this one again
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                <p className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white/45">How this works</p>
                <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-white/70">
                  The question is spoken, not shown, so you practise listening under pressure. Answer out loud — the ring
                  reads your voice. When you stop, you get length, pace and filler words, plus the structure a good answer
                  follows.
                </p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                <p className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white/45">Needs</p>
                <ul className="mt-2 grid gap-1 text-[12px] font-medium text-white/60">
                  <li>{canSpeak() ? '✓' : '×'} speech playback</li>
                  <li>{canHear() ? '✓' : '×'} microphone</li>
                  <li>{canTranscribe() ? '✓' : '×'} live transcript (pace needs this)</li>
                </ul>
                <p className="mt-2 text-[11.5px] font-medium leading-relaxed text-white/40">
                  Nothing is uploaded. Audio is analysed in this tab and never leaves it.
                </p>
              </div>
              <Link to="/panel" className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/50 underline underline-offset-4">
                prefer to write answers? the panel round →
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
