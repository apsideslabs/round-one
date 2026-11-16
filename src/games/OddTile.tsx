import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gameById } from '@/data/games'
import { makeRound, type TileStyle } from '@/lib/oddTile'
import { Button } from '@/components/ui/button'
import { useProgress } from '@/store/progress'
import { haptic, soundFinish, soundRight, soundWrong } from '@/lib/fx'

const game = gameById('oddtile')!
const SECONDS = 45

function Tile({ style, onClick, disabled }: { style: TileStyle; onClick: () => void; disabled: boolean }) {
  const shapeClass =
    style.shape === 'circle'
      ? 'rounded-full'
      : style.shape === 'diamond'
        ? 'rotate-45 rounded-[6px]'
        : style.shape === 'triangle'
          ? '[clip-path:polygon(50%_0,100%_100%,0_100%)]'
          : ''

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="tile"
      className={`grid place-items-center transition-transform duration-150 hover:scale-105 ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
    >
      <span
        className={`block ${shapeClass}`}
        style={{
          width: `${72 * style.size}%`,
          height: `${72 * style.size}%`,
          background: style.colour,
          borderRadius: style.shape === 'circle' || style.shape === 'triangle' ? undefined : style.radius,
          transform: style.shape === 'diamond' ? undefined : `rotate(${style.rotate}deg)`
        }}
      />
    </button>
  )
}

export default function OddTile() {
  const recordGame = useProgress((s) => s.recordGame)
  const addXp = useProgress((s) => s.addXp)

  const [phase, setPhase] = useState<'intro' | 'play' | 'over'>('intro')
  const [level, setLevel] = useState(0)
  const [round, setRound] = useState(() => makeRound(0))
  const [found, setFound] = useState(0)
  const [misses, setMisses] = useState(0)
  const [times, setTimes] = useState<number[]>([])
  const [startedAt, setStartedAt] = useState(0)
  const [left, setLeft] = useState(SECONDS)
  const [flash, setFlash] = useState<{ index: number; ok: boolean } | null>(null)

  useEffect(() => {
    if (phase !== 'play') return
    const id = window.setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000)
    return () => window.clearInterval(id)
  }, [phase])

  useEffect(() => {
    if (phase === 'play' && left === 0) {
      setPhase('over')
      soundFinish()
      recordGame('oddtile', found)
      if (found > 0) addXp(found * 4)
    }
  }, [left, phase, found, recordGame, addXp])

  const median = useMemo(() => {
    if (!times.length) return 0
    const sorted = [...times].sort((a, b) => a - b)
    return Math.round(sorted[Math.floor(sorted.length / 2)])
  }, [times])

  const start = () => {
    setPhase('play')
    setLeft(SECONDS)
    setLevel(0)
    setFound(0)
    setMisses(0)
    setTimes([])
    setRound(makeRound(0))
    setStartedAt(Date.now())
  }

  const tap = (index: number) => {
    if (phase !== 'play') return
    if (index === round.oddIndex) {
      soundRight()
      haptic(10)
      setFound((f) => f + 1)
      setTimes((t) => [...t, Date.now() - startedAt])
      setFlash({ index, ok: true })
      const next = level + 1
      setLevel(next)
      window.setTimeout(() => {
        setRound(makeRound(next))
        setStartedAt(Date.now())
        setFlash(null)
      }, 220)
    } else {
      soundWrong()
      haptic([12, 40, 12])
      setMisses((m) => m + 1)
      setLeft((l) => Math.max(0, l - 2))
      setFlash({ index, ok: false })
      window.setTimeout(() => setFlash(null), 260)
    }
  }

  return (
    <section className="w-full px-4 pb-28 pt-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[860px] gap-6 xl:max-w-none xl:grid-cols-[minmax(0,1fr)_minmax(240px,300px)]">
        <div className="min-w-0">
          <Link to="/arcade" className="mono-label hover:text-ink">← Arcade</Link>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-card px-3.5 py-2 shadow-[3px_3px_0_var(--color-ink)]">
            <span className="chip" style={{ background: game.soft }}>
              <span className="h-2 w-2 rounded-full border border-ink" style={{ background: game.colour }} />
              Odd tile
            </span>
            <div className="flex gap-2">
              <span className={`chip border-line ${left <= 10 ? 'bg-c1-soft' : 'bg-[#f4f2ea]'}`}><b>{left}s</b></span>
              <span className="chip border-line bg-[#f4f2ea]">Found <b>{found}</b></span>
              <span className="chip border-line bg-[#f4f2ea]">Missed <b>{misses}</b></span>
            </div>
          </div>

          <div className="card-pop mt-4 overflow-hidden">
            <div className="h-1.5" style={{ background: game.colour }} />
            <div className="p-5 sm:p-6">
              {phase === 'intro' && (
                <>
                  <h1 className="font-display text-2xl font-extrabold tracking-tight">Find the odd tile</h1>
                  <p className="mt-1.5 max-w-[52ch] text-[13.5px] font-medium leading-relaxed text-ink-2">
                    One tile in the grid differs from the rest — rotated slightly, a touch smaller, or a different corner
                    radius. Tap it. The grid grows and the difference shrinks as you go. Forty-five seconds.
                  </p>
                  <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-ink-3">
                    This is the visual-attention task hiring tests use under names like “attention to detail”, and the one
                    skill that genuinely improves with practice.
                  </p>
                  <Button className="mt-4" size="sm" onClick={start}>Start</Button>
                </>
              )}

              {phase === 'play' && (
                <>
                  <div
                    className="mx-auto grid w-full max-w-[520px] gap-1.5"
                    style={{ gridTemplateColumns: `repeat(${round.size}, minmax(0, 1fr))` }}
                  >
                    {round.tiles.map((tile, i) => (
                      <motion.div
                        key={`${level}-${i}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.15 }}
                        className={`aspect-square rounded-lg ${flash?.index === i ? (flash.ok ? 'ring-4 ring-ok' : 'ring-4 ring-bad') : ''}`}
                      >
                        <Tile style={tile} disabled={false} onClick={() => tap(i)} />
                      </motion.div>
                    ))}
                  </div>
                  <p className="mono-label mt-4 text-center">
                    level {level + 1} · grid {round.size}×{round.size}
                  </p>
                </>
              )}

              {phase === 'over' && (
                <>
                  <h1 className="font-display text-2xl font-extrabold tracking-tight">
                    {found >= 20 ? 'Very sharp.' : found >= 12 ? 'Solid.' : 'Keep at it.'}
                  </h1>
                  <p className="mt-1.5 text-[13.5px] font-medium text-ink-2">
                    {found} found, {misses} missed, median {median} ms per find.
                  </p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[['Found', String(found)], ['Missed', String(misses)], ['Median', `${median}ms`]].map(([k, v]) => (
                      <div key={k} className="rounded-xl border-2 border-ink bg-card px-3 py-2.5 shadow-[2px_2px_0_var(--color-ink)]">
                        <span className="mono-label">{k}</span>
                        <span className="mt-0.5 block font-display text-lg font-extrabold">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" onClick={start}>Again</Button>
                    <Button size="sm" variant="light" asChild><Link to="/arcade">Back to arcade</Link></Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-24 grid gap-3">
            <div className="card-pop p-4">
              <p className="mono-label mb-2">This run</p>
              <dl className="grid gap-2">
                {[['Level', String(level + 1)], ['Grid', `${round.size}×${round.size}`], ['Found', String(found)], ['Median', median ? `${median} ms` : '—']].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-2">
                    <dt className="text-[12px] font-medium text-ink-3">{k}</dt>
                    <dd className="font-mono text-[11px] font-bold">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-xl border-2 border-ink bg-card p-4">
              <p className="mono-label mb-1.5">Why this transfers</p>
              <p className="text-[12.5px] font-medium leading-relaxed text-ink-2">
                Visual search is one of the few skills where training shows up on untrained search tasks too — practice on
                a hard search improves easier ones. It is also a real assessment category, not a game dressed as one.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  )
}
