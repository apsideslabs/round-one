import { useState } from 'react'
import { Check, KeyRound, Loader2, Volume2 } from 'lucide-react'
import { DEFAULT_VOICE, loadVoice, saveVoice, synthesise, voiceConfigured, type VoiceConfig } from '@/lib/speech'

const SPEAKERS = ['simran_en_customer', 'shubh_enhi_ads', 'priya', 'shubh', 'ritu', 'aditya', 'kavya', 'rahul']
const LANGUAGES = ['en-IN', 'hi-IN', 'ta-IN', 'te-IN', 'bn-IN', 'mr-IN', 'kn-IN', 'ml-IN', 'gu-IN', 'pa-IN', 'od-IN']

export function VoicePanel() {
  const [cfg, setCfg] = useState<VoiceConfig>(() => loadVoice())
  const [status, setStatus] = useState<'idle' | 'saving' | 'testing' | 'ok' | 'fail'>('idle')
  const [message, setMessage] = useState('')

  const update = (patch: Partial<VoiceConfig>) => {
    const next = { ...cfg, ...patch }
    setCfg(next)
    saveVoice(next)
    setStatus('idle')
  }

  const test = async () => {
    setStatus('testing')
    setMessage('')
    try {
      const url = await synthesise('This is the voice your interview questions will use.', cfg)
      const audio = new Audio(url)
      await audio.play()
      setStatus('ok')
      setMessage('Playing a sample — if you can hear it, the room will speak.')
    } catch (e) {
      setStatus('fail')
      setMessage(e instanceof Error ? e.message : 'That did not work.')
    }
  }

  return (
    <div className="rounded-xl border-2 border-ink bg-card p-3.5 shadow-[3px_3px_0_var(--color-ink)]">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <KeyRound className="h-4 w-4" />
          <span className="text-[13.5px] font-extrabold">Voice · Sarvam speech</span>
        </span>
        <span className={`chip ${voiceConfigured(cfg) ? 'bg-c2-soft' : 'bg-[#f4f2ea] border-line'}`}>
          {voiceConfigured(cfg) ? 'connected' : 'not connected'}
        </span>
      </div>

      <p className="mt-1.5 text-[12px] font-medium leading-relaxed text-ink-3">
        The room uses Bulbul to speak questions and Saaras to transcribe answers. The key is stored in this browser only —
        for anything public, point the proxy field at a small server that adds the key for you.
      </p>

      <div className="mt-3 grid gap-2">
        <label className="grid gap-1">
          <span className="mono-label">API subscription key</span>
          <input
            type="password"
            value={cfg.key}
            onChange={(e) => update({ key: e.target.value })}
            placeholder="sk_…"
            autoComplete="off"
            className="rounded-lg border-2 border-ink bg-card px-3 py-2 font-mono text-[12px] outline-none focus:border-c4"
          />
        </label>

        <label className="grid gap-1">
          <span className="mono-label">or proxy base URL (recommended for anything shared)</span>
          <input
            value={cfg.proxy}
            onChange={(e) => update({ proxy: e.target.value })}
            placeholder="https://your-worker.example.com"
            className="rounded-lg border-2 border-ink bg-card px-3 py-2 font-mono text-[12px] outline-none focus:border-c4"
          />
        </label>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="mono-label">voice</span>
            <select
              value={cfg.speaker}
              onChange={(e) => update({ speaker: e.target.value })}
              className="rounded-lg border-2 border-ink bg-card px-2.5 py-2 font-mono text-[11.5px] outline-none focus:border-c4"
            >
              {SPEAKERS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="mono-label">language</span>
            <select
              value={cfg.language}
              onChange={(e) => update({ language: e.target.value })}
              className="rounded-lg border-2 border-ink bg-card px-2.5 py-2 font-mono text-[11.5px] outline-none focus:border-c4"
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={test}
          disabled={!voiceConfigured(cfg) || status === 'testing'}
          className="inline-flex items-center gap-1.5 rounded-lg border-2 border-ink bg-ink px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-paper disabled:opacity-40"
        >
          {status === 'testing' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : status === 'ok' ? <Check className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          {status === 'testing' ? 'testing' : status === 'ok' ? 'working' : 'test the voice'}
        </button>
        <button
          type="button"
          onClick={() => { setCfg({ ...DEFAULT_VOICE }); saveVoice({ ...DEFAULT_VOICE }); setStatus('idle'); setMessage('') }}
          className="rounded-lg border-2 border-ink bg-card px-3 py-1.5 font-mono text-[9px] font-bold uppercase tracking-wider"
        >
          clear
        </button>
      </div>

      {message && (
        <p className={`mt-2 text-[11.5px] font-medium leading-relaxed ${status === 'fail' ? 'text-bad' : 'text-ink-3'}`}>{message}</p>
      )}
    </div>
  )
}
