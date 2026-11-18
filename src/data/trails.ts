/** A month of practice, as the light it would have left on a long exposure. */
export interface Day { day: number; minutes: number; rounds: number; gap: boolean }

/** Deterministic sample so the picture is stable between visits. */
export function sampleMonth(seed = 7): Day[] {
  let s = seed
  const rand = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648)
  return Array.from({ length: 30 }, (_, i) => {
    const weekend = i % 7 === 5 || i % 7 === 6
    const roll = rand()
    const active = roll > (weekend ? 0.72 : 0.42)
    const minutes = active ? Math.round(8 + rand() * (weekend ? 40 : 70)) : 0
    return { day: i + 1, minutes, rounds: active ? Math.max(1, Math.round(minutes / 18)) : 0, gap: !active }
  })
}

/** Read real practice if the app has recorded any, otherwise the sample. */
export function monthFromStorage(): Day[] {
  try {
    const raw = localStorage.getItem('ro.trail')
    if (!raw) return sampleMonth()
    const parsed = JSON.parse(raw) as Day[]
    return parsed.length === 30 ? parsed : sampleMonth()
  } catch {
    return sampleMonth()
  }
}

export const totalMinutes = (days: Day[]) => days.reduce((a, d) => a + d.minutes, 0)
export const longestGap = (days: Day[]) => {
  let best = 0
  let run = 0
  for (const d of days) {
    run = d.gap ? run + 1 : 0
    best = Math.max(best, run)
  }
  return best
}
