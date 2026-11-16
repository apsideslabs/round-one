import { useMemo, useState } from 'react'

const COLS = 16
const ROWS = 10
type Cell = { x: number; y: number }

/** Dijkstra over weighted terrain, with the visited order and total cost shown. */
export function Pathfind() {
  const [walls, setWalls] = useState<Set<string>>(new Set(['4,3', '4,4', '4,5', '9,5', '9,6', '9,4', '12,2', '12,3']))
  const start: Cell = { x: 1, y: 8 }
  const goal: Cell = { x: COLS - 2, y: 1 }

  const [mud] = useState<Set<string>>(new Set(['6,2', '6,3', '7,2', '10,7', '10,8', '11,7']))

  const { dist, path, order } = useMemo(() => {
    const key = (x: number, y: number) => `${x},${y}`
    const dist = new Map<string, number>()
    const prev = new Map<string, string>()
    const order: string[] = []
    const visited = new Set<string>()
    dist.set(key(start.x, start.y), 0)
    const queue: Array<{ c: Cell; d: number }> = [{ c: start, d: 0 }]

    while (queue.length) {
      queue.sort((a, b) => a.d - b.d)
      const { c, d } = queue.shift()!
      const k = key(c.x, c.y)
      if (visited.has(k)) continue
      visited.add(k)
      order.push(k)
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
        const nx = c.x + dx
        const ny = c.y + dy
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue
        const nk = key(nx, ny)
        if (walls.has(nk) || visited.has(nk)) continue
        const step = mud.has(nk) ? 5 : 1
        const nd = d + step
        if (nd < (dist.get(nk) ?? Infinity)) {
          dist.set(nk, nd)
          prev.set(nk, k)
          queue.push({ c: { x: nx, y: ny }, d: nd })
        }
      }
    }
    const path: string[] = []
    let cur: string | undefined = key(goal.x, goal.y)
    while (cur) {
      path.unshift(cur)
      cur = prev.get(cur)
    }
    return { dist, path, order }
  }, [walls, mud])

  const toggle = (x: number, y: number) => {
    const k = `${x},${y}`
    if ((x === start.x && y === start.y) || (x === goal.x && y === goal.y)) return
    setWalls((prev) => {
      const next = new Set(prev)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  const total = dist.get(`${goal.x},${goal.y}`)

  return (
    <div className="grid h-full w-full grid-rows-[1fr_auto]">
      <div className="grid h-full w-full place-items-center p-3">
        <div className="grid h-full w-full gap-[2px]" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0,1fr))` }}>
          {Array.from({ length: COLS * ROWS }, (_, i) => {
            const x = i % COLS
            const y = Math.floor(i / COLS)
            const k = `${x},${y}`
            const isStart = x === start.x && y === start.y
            const isGoal = x === goal.x && y === goal.y
            const isWall = walls.has(k)
            const isMud = mud.has(k)
            const onPath = path.includes(k)
            const seen = order.includes(k)
            return (
              <button
                key={k}
                type="button"
                onClick={() => toggle(x, y)}
                aria-label={`cell ${x},${y}`}
                className={`relative rounded-[2px] border border-ink/10 text-[7px] font-bold ${
                  isWall ? 'bg-ink' : isStart ? 'bg-c1' : isGoal ? 'bg-c3' : onPath ? 'bg-c2' : seen ? 'bg-c2/25' : isMud ? 'bg-[#d9c9a3]' : 'bg-[#eeece4]'
                }`}
              >
                {isMud && !isWall && !onPath ? <span className="text-ink/50">5</span> : null}
              </button>
            )
          })}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 border-t-2 border-ink bg-paper px-3 py-2">
        <span className="chip bg-[#f4f2ea] border-line">dijkstra · visited {order.length}</span>
        <span className="chip bg-c2-soft">path cost {total ?? '—'}</span>
        <span className="chip bg-[#f4f2ea] border-line">mud cells cost 5, not 1 — BFS would take the wrong route</span>
      </div>
    </div>
  )
}
