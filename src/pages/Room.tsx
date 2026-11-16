import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Mic as MicIcon, Square, Volume2, RotateCcw, ArrowRight, Loader2 } from 'lucide-react'
import { interview } from '@/data/interview'
import { loadVoice, recordAnswer, synthesise, transcribe, voiceConfigured, type VoiceConfig } from '@/lib/speech'
import { scoreDelivery, type Delivery } from '@/lib/voiceScore'
import { useProgress } from '@/store/progress'
import { shuffle } from '@/lib/utils'

type Phase = 'intro' | 'speaking' | 'listening' | 'scored'

const ROUNDS = 3

export default function Room() {
  const addXp = useProgress((s) => s.addXp)
  const touch = useProgress((s) => s.touch)

  const [voice] = useState<VoiceConfig>(() => loadVoice())
  const ready = voiceConfigured(voice)

  const [seed, setSeed] = useState(0)
  const questions = useMemo(() => shuffle(interview).slice(0, ROUNDS), [seed])
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('intro')
  const [seconds, setSeconds] = useState(0)
  const [delivery, setDelivery] = useState<Delivery | null>(null)
  const [transcript, setTranscript] = useState('')
  const [answerUrl, setAnswerUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState<null | 'speaking' | 'transcribing'>(null)
  const [error, setError] = useState<string | null>(null)
  const [heardIt, setHeardIt] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const recorderRef = useRef<Awaited<ReturnType<typeof recordAnswer>> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const rafRef = useRef(0)
  const timerRef = useRef(0)

  const question = questions[index]

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { width: w, height: h } = canvas
    const cx = w / 2
    const cy = h / 2
    const analyser = recorderRef.current?.analyser
    const bars = 64
    const data = new Uint8Array(analyser ? analyser.frequencyBinCount : bars)
    if (analyser) analyser.getByteFrequencyData(data)
    const t = performance.now() / 1000

    ctx.clearRect(0, 0, w, h)
    for (let i = 0; i < bars; i++) {
      const angle = (i / bars) * Math.PI * 2 - Math.PI / 2
      const level = analyser ? data[Math.floor((i / bars) * (data.length * 0.6))] / 255 : 0.08 + 0.03 * Math.sin(t * 2 + i / 3)
      const len = 16 + level * 74
      ctx.strokeStyle = analyser ? `rgba(255,75,38,${0.35 + level * 0.65})` : 'rgba(255,255,255,0.22)'
      ctx.lineWidth = 5
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(angle) * 96, cy + Math.sin(angle) * 96)
      ctx.lineTo(cx + Math.cos(angle) * (96 + len), cy + Math.sin(angle) * (96 + len))
      ctx.stroke()
    }
    rafRef.current = requestAnimationFrame(draw)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [draw])

  const ask = async () => {
    setError(null)
    if (!ready) {
      setHeardIt(true)
      return
    }
    setBusy('speaking')
    setPhase('speaking')
    try {
      const url = await synthesise(question.question, voice)
      const audio = new Audio(url)
      audioRef.current = audio
      audio.onended = () => {
        setBusy(null)
        setHeardIt(true)
        setPhase('intro')
      }
      await audio.play()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Speech failed.')
      setBusy(null)
      setPhase('intro')
      setHeardIt(true)
    }
  }

  const startListening = async () => {
    setError(null)
    setSeconds(0)
    setTranscript('')
    setAnswerUrl(null)
    try {
      recorderRef.current = await recordAnswer()
    } catch {
      setError('Microphone blocked. Allow it in the browser and try again — without it there is nothing to score.')
      return
    }
    setPhase('listening')
    timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000)
  }

  const stopListening = async () => {
    window.clearInterval(timerRef.current)
    const recorder = recorderRef.current
    if (!recorder) return
    const blob = await recorder.stop()
    recorderRef.current = null
    setAnswerUrl(URL.createObjectURL(blob))

    let said = ''
    if (ready && blob.size > 0) {
      setBusy('transcribing')
      try {
        said = await transcribe(blob, voice)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Transcription failed.')
      }
      setBusy(null)
    }
    setTranscript(said)
    setDelivery(scoreDelivery(seconds, said))
    setPhase('scored')
    touch()
    addXp(8)
  }

  const next = () => {
    if (index + 1 >= questions.length) {
      setSeed((s) => s + 1)
      setIndex(0)
    } else {
      setIndex((i) => i + 1)
    }
    setPhase('intro')
    setDelivery(null)
    setTranscript('')
    setAnswerUrl(null)
    setHeardIt(false)
    setSeconds(0)
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
              {phase === 'listening' ? 'recording' : phase === 'scored' ? 'debrief' : busy === 'speaking' ? 'speaking' : 'standby'}
            </span>
          </div>

          {!heardIt ? (
            <p className="mt-4 max-w-[34ch] font-display text-2xl font-extrabold leading-tight tracking-tight text-white/35 sm:text-4xl">
              Question {index + 1} of {questions.length} — {ready ? 'press play, and listen.' : 'read it, then answer.'}
            </p>
          ) : (
            <h1 className="mt-4 max-w-[26ch] text-balance font-display text-3xl font-extrabold leading-[1.05] tracking-tighter sm:text-5xl">
              {phase === 'listening' ? 'Answer it out loud.' : question.question}
            </h1>
          )}

          <div className="relative mx-auto mt-8 grid place-items-center">
            <canvas ref={canvasRef} width={340} height={340} className="h-[300px] w-[300px] sm:h-[340px] sm:w-[340px]" />
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <span className="block font-display text-5xl font-extrabold tabular-nums">
                  {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}
                </span>
                <span className="mt-1 block font-mono text-[8px] font-bold uppercase tracking-[0.2em] text-white/40">
                  {phase === 'listening' ? 'live' : 'ready'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            {phase !== 'listening' && phase !== 'scored' && (
              <>
                {ready ? (
                  <button
                    type="button"
                    onClick={ask}
                    disabled={busy === 'speaking'}
                    className="inline-flex items-center gap-2 rounded-full border-2 border-white bg-white px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink disabled:opacity-60"
                  >
                    {busy === 'speaking' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                    {busy === 'speaking' ? 'speaking' : heardIt ? 'play again' : 'hear the question'}
                  </button>
                ) : (
                  <Link
                    to="/menu"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white/70"
                  >
                    <Volume2 className="h-4 w-4" /> connect a voice
                  </Link>
                )}
                <button
                  type="button"
                  onClick={startListening}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-c1 bg-c1 px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-white"
                >
                  <MicIcon className="h-4 w-4" /> answer
                </button>
              </>
            )}

            {phase === 'listening' && (
              <button
                type="button"
                onClick={stopListening}
                className="inline-flex items-center gap-2 rounded-full border-2 border-white bg-white px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink"
              >
                <Square className="h-4 w-4" /> finish
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

          {busy === 'transcribing' && (
            <p className="mt-3 inline-flex w-full items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-c3">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> transcribing with Saaras
            </p>
          )}
          {error && <p className="mt-3 text-center font-mono text-[10px] leading-relaxed text-c3">{error}</p>}

          {answerUrl && (
            <div className="mx-auto mt-5 max-w-[420px] rounded-xl border border-white/15 bg-white/5 p-3">
              <p className="mb-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white/45">hear yourself back</p>
              <audio src={answerUrl} controls className="w-full" />
            </div>
          )}
        </div>

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
                  <p className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white/45">Saaras heard</p>
                  <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-white/60">{transcript}</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => { setPhase('intro'); setSeconds(0); setDelivery(null); setAnswerUrl(null) }}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-white/70"
              >
                <RotateCcw className="h-3 w-3" /> again
              </button>
            </div>
          ) : (
            <div className="grid gap-3">
              <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                <p className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white/45">Voice</p>
                <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-white/70">
                  {ready
                    ? `Bulbul speaks the question in ${voice.language} with the “${voice.speaker}” voice. Saaras transcribes your answer.`
                    : 'No voice connected. Questions show as text and answers are scored on length alone. Connect a Sarvam key to hear questions and get a transcript.'}
                </p>
                <Link to="/menu" className="mt-2 inline-block font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-c3 underline underline-offset-4">
                  {ready ? 'change voice' : 'connect a voice'} →
                </Link>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 p-4">
                <p className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-white/45">What it scores</p>
                <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-white/70">
                  Length, words per minute and filler words — the delivery, not the content. Your recording is analysed in
                  this tab; only the audio clip is sent for transcription, and only when you have connected a key.
                </p>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
