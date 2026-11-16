/** Streak helpers. Kept separate from progress: a broken streak must never erase work. */
const dayKey = (d: Date) => d.toISOString().slice(0, 10)

export function today(): string {
  return dayKey(new Date())
}

export function currentStreak(days: string[]): number {
  const set = new Set(days)
  let streak = 0
  const cursor = new Date()
  for (let i = 0; i < 400; i++) {
    const key = dayKey(cursor)
    if (set.has(key)) {
      streak++
    } else if (i > 0) {
      break
    } else {
      // today not yet used: look back one day before giving up
      cursor.setDate(cursor.getDate() - 1)
      if (!set.has(dayKey(cursor))) break
      continue
    }
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function lastSeven(days: string[]): Array<{ key: string; label: string; done: boolean; isToday: boolean }> {
  const set = new Set(days)
  const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const out = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = dayKey(d)
    out.push({ key, label: labels[d.getDay()], done: set.has(key), isToday: i === 0 })
  }
  return out
}
