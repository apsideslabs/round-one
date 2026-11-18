/** Twelve frames of one round, drawn as line art on a drum. */
export interface Frame {
  lean: number // -1..1, how far the figure leans forward
  arm: number // 0..1, hand raised
  mouth: number // 0..1, how open
  head: number // -1..1, head tilt
  note: string // what is happening in this frame
}

export const FRAMES: Frame[] = [
  { lean: 0.1, arm: 0, mouth: 0.1, head: 0, note: 'he sits down' },
  { lean: 0.2, arm: 0.1, mouth: 0.4, head: 0.1, note: 'the question lands' },
  { lean: 0.3, arm: 0.15, mouth: 0.6, head: 0.2, note: 'he starts talking' },
  { lean: 0.2, arm: 0.2, mouth: 0.7, head: 0.3, note: 'listing his subjects' },
  { lean: 0.05, arm: 0.1, mouth: 0.5, head: 0.1, note: 'the panel waits' },
  { lean: -0.1, arm: 0, mouth: 0.3, head: -0.1, note: 'he pauses' },
  { lean: 0.4, arm: 0.45, mouth: 0.8, head: 0.2, note: 'a number, finally' },
  { lean: 0.5, arm: 0.6, mouth: 0.5, head: 0.1, note: 'he draws in the air' },
  { lean: 0.3, arm: 0.3, mouth: 0.3, head: 0, note: 'they lean in' },
  { lean: 0.1, arm: 0.1, mouth: 0.2, head: -0.2, note: 'he loses the thread' },
  { lean: -0.2, arm: 0, mouth: 0.1, head: -0.3, note: 'the room cools' },
  { lean: 0, arm: 0, mouth: 0, head: 0, note: 'thank you, we will call' }
]

export const frameAt = (t: number, speed: number) => {
  const index = Math.floor((t * speed) / 90) % FRAMES.length
  return { index, frame: FRAMES[index] }
}
