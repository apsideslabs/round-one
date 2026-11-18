import { describe, expect, it } from 'vitest'
import { project, overlap, integrate, launch } from './iso'

describe('iso helpers', () => {
  it('projects the origin to the camera centre', () => {
    const p = project({ x: 0, y: 0, z: 0 }, Math.PI / 6, 1, 100, 200)
    expect(p.x).toBeCloseTo(100)
    expect(p.y).toBeCloseTo(200)
  })

  it('higher points draw higher on screen', () => {
    const low = project({ x: 0, y: 0, z: 0 })
    const high = project({ x: 0, y: 50, z: 0 })
    expect(high.y).toBeLessThan(low.y)
  })

  it('overlap is negative when two blocks miss each other', () => {
    expect(overlap(0, 10, 4, 10)).toBeCloseTo(6)
    expect(overlap(0, 10, 20, 10)).toBeLessThan(0)
  })

  it('integration is stable and lands a projectile near its analytic range', () => {
    const v = launch(50, Math.PI / 4)
    let pos = { x: 0, y: 0, z: 0 }
    let vel = v
    const dt = 1 / 240
    let t = 0
    while (pos.y >= 0 && t < 10) {
      const next = integrate(pos, vel, { x: 0, y: -9.81, z: 0 }, dt)
      pos = next.pos
      vel = next.vel
      t += dt
    }
    const range = (v.x * 2 * v.y) / 9.81
    expect(pos.x).toBeGreaterThan(range * 0.98)
    expect(pos.x).toBeLessThan(range * 1.02)
  })
})
