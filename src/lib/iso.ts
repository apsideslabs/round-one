/** Shared 3D helpers: an isometric projection and small physics kernels. */

export interface P3 { x: number; y: number; z: number }
export interface P2 { x: number; y: number; depth: number }

/** Isometric projection with a yaw, so boxes read as solid. */
export function project(p: P3, yaw = Math.PI / 6, scale = 1, cx = 0, cy = 0): P2 {
  const cos = Math.cos(yaw)
  const sin = Math.sin(yaw)
  const rx = p.x * cos - p.z * sin
  const rz = p.x * sin + p.z * cos
  return { x: cx + (rx - rz) * 0.866 * scale, y: cy + ((rx + rz) * 0.5 - p.y) * scale, depth: rx + rz }
}

/** Overlap of two intervals, negative when they miss. */
export const overlap = (aCentre: number, aWidth: number, bCentre: number, bWidth: number) => {
  const left = Math.max(aCentre - aWidth / 2, bCentre - bWidth / 2)
  const right = Math.min(aCentre + aWidth / 2, bCentre + bWidth / 2)
  return right - left
}

/** Semi-implicit Euler with a fixed step — stable enough for marbles and arcs. */
export function integrate(pos: P3, vel: P3, acc: P3, dt: number): { pos: P3; vel: P3 } {
  const v = { x: vel.x + acc.x * dt, y: vel.y + acc.y * dt, z: vel.z + acc.z * dt }
  return { pos: { x: pos.x + v.x * dt, y: pos.y + v.y * dt, z: pos.z + v.z * dt }, vel: v }
}

/** Launch velocity for a projectile to reach a target, given speed and angle. */
export const launch = (speed: number, angle: number, yaw = 0) => ({
  x: Math.cos(angle) * Math.cos(yaw) * speed,
  y: Math.sin(angle) * speed,
  z: Math.cos(angle) * Math.sin(yaw) * speed
})

/** A falling domino pushes the next one when it passes this angle. */
export const TIP_ANGLE = Math.PI / 3
