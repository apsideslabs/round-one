/** Speech in, speech out — every entry point degrades instead of throwing. */

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window
export const canHear = () => typeof window !== 'undefined' && !!(window.AudioContext || (window as any).webkitAudioContext)
export const canTranscribe = () =>
  typeof window !== 'undefined' && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

let currentUtterance: SpeechSynthesisUtterance | null = null

export function speak(text: string, opts: { rate?: number; onEnd?: () => void; onStart?: () => void } = {}) {
  if (!canSpeak()) {
    opts.onEnd?.()
    return () => {}
  }
  const synth = window.speechSynthesis
  synth.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.rate = opts.rate ?? 0.98
  u.pitch = 1
  const preferred = synth.getVoices().find((v) => /en-IN|en-GB|en-US/i.test(v.lang))
  if (preferred) u.voice = preferred
  u.onstart = () => opts.onStart?.()
  u.onend = () => opts.onEnd?.()
  currentUtterance = u
  synth.speak(u)
  return () => {
    if (currentUtterance === u) synth.cancel()
  }
}

export function stopSpeaking() {
  if (canSpeak()) window.speechSynthesis.cancel()
}

export interface Mic {
  stop: () => void
  analyser: AnalyserNode
}

/** Opens the microphone and hands back an analyser for the waveform. */
export async function openMic(): Promise<Mic> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const Ctx = window.AudioContext || (window as any).webkitAudioContext
  const ctx = new Ctx()
  const source = ctx.createMediaStreamSource(stream)
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 512
  analyser.smoothingTimeConstant = 0.8
  source.connect(analyser)
  return {
    analyser,
    stop: () => {
      stream.getTracks().forEach((t) => t.stop())
      void ctx.close()
    }
  }
}

export interface Transcript {
  text: string
  stop: () => void
}

/** Live speech-to-text where the browser supports it. */
export function transcribe(onText: (text: string) => void): Transcript | null {
  const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!Ctor) return null
  const rec = new Ctor()
  rec.continuous = true
  rec.interimResults = true
  rec.lang = 'en-IN'
  let final = ''
  rec.onresult = (e: any) => {
    let interim = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const chunk = e.results[i][0].transcript
      if (e.results[i].isFinal) final += chunk + ' '
      else interim += chunk
    }
    onText((final + interim).trim())
  }
  try {
    rec.start()
  } catch {
    return null
  }
  return { get text() { return final.trim() }, stop: () => { try { rec.stop() } catch {} } } as Transcript
}
