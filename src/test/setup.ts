import '@testing-library/jest-dom/vitest'

class NoopAudioContext {
  currentTime = 0
  createOscillator() {
    return { type: '', frequency: { setValueAtTime() {} }, connect() {}, start() {}, stop() {} }
  }
  createGain() {
    return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }
  }
  destination = {}
}

// jsdom has no Web Audio; the app guards for it, but tests shouldn't log noise.
Object.defineProperty(window, 'AudioContext', { writable: true, value: NoopAudioContext })
