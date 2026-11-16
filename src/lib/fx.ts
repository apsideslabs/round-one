import confetti from 'canvas-confetti'

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

let ctx: AudioContext | null = null
let muted = false

export const setMuted = (value: boolean) => {
  muted = value
}

type Wave = 'sine' | 'triangle' | 'square' | 'sawtooth'

function beep(freq: number, dur: number, type: Wave = 'triangle', vol = 0.05, delay = 0) {
  if (muted) return
  try {
    ctx ??= new AudioContext()
    const t = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t)
    gain.gain.setValueAtTime(vol, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + dur + 0.02)
  } catch {
    /* audio is a nicety, never a requirement */
  }
}

export function soundRight() {
  beep(680, 0.1, 'triangle', 0.055)
  beep(1020, 0.14, 'triangle', 0.045, 0.075)
}

export function soundWrong() {
  beep(190, 0.2, 'sawtooth', 0.04)
  beep(140, 0.22, 'sawtooth', 0.035, 0.06)
}

export function soundFinish() {
  ;[523, 659, 784, 1046].forEach((f, i) => beep(f, 0.18, 'triangle', 0.05, i * 0.11))
}

export function haptic(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* unsupported */
  }
}

export function celebrate() {
  if (reduced()) return
  confetti({
    particleCount: 90,
    spread: 70,
    startVelocity: 38,
    origin: { y: 0.65 },
    colors: ['#ff4b26', '#0e8c6a', '#f5b01b', '#2f5bff', '#12151a'],
    disableForReducedMotion: true
  })
}

export function celebrateCorrect() {
  if (reduced()) return
  confetti({
    particleCount: 26,
    spread: 55,
    startVelocity: 26,
    ticks: 90,
    origin: { y: 0.6 },
    colors: ['#ff4b26', '#0e8c6a', '#f5b01b', '#2f5bff'],
    disableForReducedMotion: true
  })
}
