import { useCallback, useEffect, useRef, useState } from 'react'

const COLS = 22
const ROWS = 12

/** Place walls, then watch a flood search find the shortest path. */
export function FloodMaze() {
  const [walls, setWalls] = useState<Set<string>>(new Set())
  const [visited, setVisited] = useState<Set<string>>(new Set())
  const [path, setPath] = useState<string[]>([])
  const timer = useRef(0)

  const key = (x: number, y: number) => `${x},${y}`
  const start = { x: 1, y: ROWS - 2 }
  const goal = { x: COLS - 2, y: 1 }

  const solve = useCallback(() => {
    window.clearInterval(timer.current)
    const seen = new Set<string>([key(start.x, start.y)])
    const prev = new Map<string, string>()
    let frontier = [start]
    const order: string[] = []

    const step = () => {
      if (!frontier.length) {
        window.clearInterval(timer.current)
        return
      }
      order.push(...frontier.map((f) => key(f.x, f.y)))
      setVisited(new Set(order))
      const next: Array<{ x: number; y: number }> = []
      for (const cell of frontier) {
        if (cell.x === goal.x && cell.y === goal.y) {
          const p: string[] = []
          let cur: string | undefined = key(cell.x, cell.y)
          while (cur) {
            p.unshift(cur)
            cur = prev.get(cur)
          }
          setPath(p)
          window.clearInterval(timer.current)
          return
        }
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
          const nx = cell.x + dx
          const ny = cell.y + dy
          if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue
          const k = key(nx, ny)
          if (seen.has(k) || walls.has(k)) continue
          seen.add(k)
          prev.set(k, key(cell.x, cell.y))
          next.push({ x: nx, y: ny })
        }
      }
      frontier = next
    }

    step()
    timer.current = window.setInterval(step, 90)
  }, [walls])

  useEffect(() => {
    solve()
    return () => window.clearInterval(timer.current)
  }, [solve])

  const toggle = (x: number, y: number) => {
    if ((x === start.x && y === start.y) || (x === goal.x && y === goal.y)) return
    setWalls((prev) => {
      const next = new Set(prev)
      const k = key(x, y)
      if (next.has(k)) next.delete(k)
      else next.add(k)
      return next
    })
  }

  return (
    <div className="grid h-full w-full place-items-center p-2">
      <div
        className="grid h-full w-full gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`, gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: ROWS * COLS }, (_, i) => {
          const x = i % COLS
          const y = Math.floor(i / COLS)
          const k = key(x, y)
          const isWall = walls.has(k)
          const isStart = x === start.x && y === start.y
          const isGoal = x === goal.x && y === goal.y
          const onPath = path.includes(k)
          const seen = visited.has(k)
          return (
            <button
              key={k}
              type="button"
              onClick={() => toggle(x, y)}
              aria-label={isWall ? 'wall' : 'open'}
              className={`rounded-[2px] transition-colors duration-150 ${
                isWall
                  ? 'bg-ink'
                  : isStart
                    ? 'bg-c1'
                    : isGoal
                      ? 'bg-c3'
                      : onPath
                        ? 'bg-c2'
                        : seen
                          ? 'bg-c2/35'
                          : 'bg-[#eeece4]'
              }`}
            />
          )
        })}
      </div>
    </div>
  )
}
