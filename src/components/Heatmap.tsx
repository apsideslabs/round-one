const WEEKS = 13
const DAY = 86400000
const key = (d: Date) => d.toISOString().slice(0, 10)

/** A quiet consistency grid: one square per day, filled when you practised. */
export function Heatmap({ days }: { days: string[] }) {
  const set = new Set(days)
  const today = new Date()
  const start = new Date(today.getTime() - (WEEKS * 7 - 1) * DAY)
  // align to the Monday on or before the start
  const offset = (start.getDay() + 6) % 7
  start.setDate(start.getDate() - offset)

  const cells: Array<{ key: string; done: boolean; isToday: boolean }> = []
  for (let i = 0; i < WEEKS * 7; i++) {
    const d = new Date(start.getTime() + i * DAY)
    const k = key(d)
    cells.push({ key: k, done: set.has(k), isToday: k === key(today) })
  }
  const columns = Array.from({ length: WEEKS }, (_, w) => cells.slice(w * 7, w * 7 + 7))

  return (
    <div className="flex items-end gap-[3px]" role="img" aria-label={`${days.length} days practised`}>
      {columns.map((col, i) => (
        <div key={i} className="grid gap-[3px]">
          {col.map((cell) => (
            <span
              key={cell.key}
              title={cell.key}
              className={`h-[9px] w-[9px] rounded-[2px] border ${
                cell.done ? 'border-ink bg-c2' : cell.isToday ? 'border-ink bg-c3' : 'border-ink/15 bg-[#f2f0e8]'
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
