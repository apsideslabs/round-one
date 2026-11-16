import { Link, NavLink } from 'react-router-dom'
import { BarChart3, BookOpen, Clock, FlaskConical, Home, Languages, Layers, Scale, Sparkles, Users, Volume2, VolumeX, RotateCcw } from 'lucide-react'
import { tracks } from '@/data/tracks'
import { games } from '@/data/games'
import { guides } from '@/data/guides'
import { useProgress, level, levelProgress } from '@/store/progress'
import { Sigil } from '@/components/Sigil'
import { setMuted } from '@/lib/fx'
import { cn } from '@/lib/utils'

const roundIcons: Record<string, typeof Home> = {
  logic: BarChart3,
  verbal: Languages,
  memory: Layers,
  riddles: Sparkles,
  panel: Users,
  morality: Scale
}

export function Sidebar() {
  const { muted, toggleMute, reset, scores, gameBests, xp } = useProgress()

  const onSound = () => {
    toggleMute()
    setMuted(!muted)
  }

  const item = 'group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-bold text-ink-2 transition-colors hover:bg-[#f4f1e7] hover:text-ink'
  const active = 'bg-c1-soft text-ink [&_svg]:text-c1'

  return (
    <aside className="sticky top-0 hidden h-dvh w-[268px] shrink-0 flex-col border-r-2 border-ink bg-paper lg:flex">
      <Link to="/" className="flex items-center gap-2.5 border-b-2 border-ink px-4 py-3.5">
        <span className="grid h-8 w-8 place-items-center rounded-[9px] border-2 border-ink bg-c1 shadow-[2px_2px_0_var(--color-ink)]">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round">
            <path d="M4 19V11M10 19V5M16 19v-5M22 19H2" />
          </svg>
        </span>
        <span className="font-display text-lg font-extrabold tracking-tight">
          Round<span className="text-c1">One</span>
        </span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3">
        <NavLink to="/" end className={({ isActive }) => cn(item, isActive && active)}>
          <Home className="h-4 w-4 shrink-0" />
          Home
        </NavLink>

        <p className="mono-label px-2.5 pb-1 pt-4">Rounds</p>
        <ul className="grid gap-0.5">
          {tracks.map((t) => {
            const Icon = roundIcons[t.id] ?? BarChart3
            return (
              <li key={t.id}>
                <NavLink to={t.path} className={({ isActive }) => cn(item, isActive && active)}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{t.name}</span>
                  <span className="font-mono text-[9px] font-bold text-ink-3">
                    {scores[t.id] ? `${scores[t.id]}/${t.max}` : '—'}
                  </span>
                </NavLink>
              </li>
            )
          })}
        </ul>


        <NavLink to="/lab" className={({ isActive }) => cn(item, 'mt-1 border-2 border-dashed border-ink/40', isActive && active)}>
          <FlaskConical className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">Workspace</span>
          <span className="font-mono text-[9px] font-bold text-ink-3">lab</span>
        </NavLink>

        <NavLink to="/mock" className={({ isActive }) => cn(item, 'mt-1 border-2 border-dashed border-ink/40', isActive && active)}>
          <Clock className="h-4 w-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">Full mock test</span>
          <span className="font-mono text-[9px] font-bold text-ink-3">20m</span>
        </NavLink>

        <p className="mono-label px-2.5 pb-1 pt-4">Arcade</p>
        <ul className="grid gap-0.5">
          {games.map((g) => (
            <li key={g.id}>
              <NavLink to={g.path} className={({ isActive }) => cn(item, isActive && active)}>
                <span className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-ink" style={{ background: g.colour }} />
                <span className="min-w-0 flex-1 truncate">{g.name}</span>
                <span className="font-mono text-[9px] font-bold text-ink-3">{gameBests[g.id] ? gameBests[g.id] : ''}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <p className="mono-label px-2.5 pb-1 pt-4">Learn</p>
        <ul className="grid gap-0.5">
          {guides.map((g) => (
            <li key={g.slug}>
              <NavLink to={`/guides/${g.slug}`} className={({ isActive }) => cn(item, isActive && active)}>
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{g.title}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t-2 border-ink p-3">
        <div className="mb-2.5 flex items-center gap-2.5">
          <span className="shrink-0 text-ink">
            <Sigil scores={scores} size={40} showRings={false} />
          </span>
          <span className="mono-label leading-tight">
            your mark
            <br />
            <span className="text-ink-3">readiness {Math.round(tracks.reduce((a, t) => a + (scores[t.id] ?? 0) / t.max, 0) / tracks.length * 100)}%</span>
          </span>
        </div>
        <div className="mb-2 flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-ink bg-c1 font-display text-[11px] font-extrabold text-white">
            {level(xp)}
          </span>
          <span className="h-2 flex-1 overflow-hidden rounded-full border-2 border-ink bg-[#f2f0e8]">
            <span className="block h-full bg-c3 transition-[width] duration-500" style={{ width: `${levelProgress(xp)}%` }} />
          </span>
          <span className="font-mono text-[9px] font-bold text-ink-3">{xp} xp</span>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={onSound}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border-2 border-ink bg-card py-1.5 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]"
          >
            {muted ? <VolumeX className="h-3.5 w-3.5 opacity-50" /> : <Volume2 className="h-3.5 w-3.5" />}
            {muted ? 'Muted' : 'Sound'}
          </button>
          <button
            type="button"
            onClick={reset}
            aria-label="Reset progress"
            className="grid place-items-center rounded-lg border-2 border-ink bg-card px-2.5 shadow-[2px_2px_0_var(--color-ink)]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  )
}
