/**
 * Real speech, not the browser's toy voice.
 *
 * Sarvam Bulbul for text-to-speech (Indian voices, code-mixed English/Hindi),
 * Saaras for speech-to-text. Both need an `api-subscription-key`. That key
 * must never ship in a public bundle, so this module reads it from the user's
 * own device, or talks to a proxy they host that injects it server-side.
 */

export interface VoiceConfig {
  key: string
  proxy: string
  speaker: string
  language: string
  model: string
}

const STORE = 'round-one.voice.v1'

export const DEFAULT_VOICE: VoiceConfig = {
  key: '',
  proxy: '',
  speaker: 'simran_en_customer',
  language: 'en-IN',
  model: 'bulbul:v4-flash'
}

export function loadVoice(): VoiceConfig {
  try {
    const raw = localStorage.getItem(STORE)
    if (!raw) return { ...DEFAULT_VOICE }
    return { ...DEFAULT_VOICE, ...(JSON.parse(raw) as Partial<VoiceConfig>) }
  } catch {
    return { ...DEFAULT_VOICE }
  }
}

export function saveVoice(c: VoiceConfig) {
  try {
    localStorage.setItem(STORE, JSON.stringify(c))
  } catch {
    /* private mode — the session still works */
  }
}

export const voiceConfigured = (c: VoiceConfig) => Boolean(c.key.trim() || c.proxy.trim())

function endpoint(c: VoiceConfig, path: string) {
  const base = c.proxy.trim().replace(/\/+$/, '')
  return base ? `${base}/${path}` : `https://api.sarvam.ai/${path}`
}

function headers(c: VoiceConfig): HeadersInit {
  const h: Record<string, string> = {}
  // a proxy injects the key itself; only send one when we hold it directly
  if (!c.proxy.trim() && c.key.trim()) h['api-subscription-key'] = c.key.trim()
  return h
}

/** Returns a playable object URL, or throws with a message worth showing. */
export async function synthesise(text: string, c: VoiceConfig): Promise<string> {
  const res = await fetch(endpoint(c, 'text-to-speech'), {
    method: 'POST',
    headers: { ...headers(c), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: text.slice(0, 2400),
      language_code: c.language,
      speaker: c.speaker,
      model: c.model
    })
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(
      res.status === 401 || res.status === 403
        ? 'That key was refused. Check it is a Sarvam API subscription key with speech enabled.'
        : `Speech service said ${res.status}. ${detail.slice(0, 120)}`
    )
  }
  const data = (await res.json()) as { audios?: string[] }
  const b64 = data.audios?.[0]
  if (!b64) throw new Error('No audio came back.')
  const bytes = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0))
  return URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }))
}

/** Uploads a short recording and returns the transcript. */
export async function transcribe(blob: Blob, c: VoiceConfig): Promise<string> {
  const form = new FormData()
  form.append('file', blob, 'answer.webm')
  form.append('model', 'saaras:v4')
  form.append('mode', 'transcribe')

  const res = await fetch(endpoint(c, 'speech-to-text'), {
    method: 'POST',
    headers: headers(c),
    body: form
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Transcription failed (${res.status}). ${detail.slice(0, 120)}`)
  }
  const data = (await res.json()) as { transcript?: string }
  return data.transcript ?? ''
}

/** Records the microphone to a blob, with a stop() that resolves the audio. */
export async function recordAnswer(): Promise<{ stop: () => Promise<Blob>; mime: string; analyser: AnalyserNode }> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus') ? 'audio/webm;codecs=opus' : 'audio/webm'
  const rec = new MediaRecorder(stream, { mimeType: mime })
  const chunks: BlobPart[] = []
  rec.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data)
  }
  rec.start()

  const Ctx = window.AudioContext || (window as any).webkitAudioContext
  const ctx = new Ctx()
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 512
  analyser.smoothingTimeConstant = 0.8
  ctx.createMediaStreamSource(stream).connect(analyser)

  return {
    mime,
    analyser,
    stop: () =>
      new Promise<Blob>((resolve) => {
        rec.onstop = () => {
          stream.getTracks().forEach((t) => t.stop())
          resolve(new Blob(chunks, { type: mime }))
        }
        rec.stop()
      })
  }
}
