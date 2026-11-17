import { Link, useLocation } from 'react-router-dom'
import { Command, Volume2, VolumeX, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProgress } from '@/store/progress'
import { setMuted } from '@/lib/fx'
import { tracks } from '@/data/tracks'
import { games } from '@/data/games'
import { guides } from '@/data/guides'

function titleFor(pathname: string): { title: string; sub: string } {
  const track = tracks.find((t) => t.path === pathname)
  if (track) return { title: track.name, sub: `Round ${track.no}` }
  const game = games.find((g) => g.path === pathname)
  if (game) return { title: game.name, sub: 'Arcade' }
  const guide = guides.find((g) => pathname === `/guides/${g.slug}`)
  if (guide) return { title: guide.title, sub: 'Guide' }
  if (pathname === '/menu') return { title: 'Menu', sub: 'Everything' }
  if (pathname === '/mock') return { title: 'Full mock test', sub: '20 questions · 20 minutes' }
  if (pathname === '/lab') return { title: 'Workspace', sub: 'Blank stage' }
  if (pathname === '/interview') return { title: 'The interview', sub: 'Illustrated scene' }
  if (pathname === '/arcade') return { title: 'Arcade', sub: `${games.length} games` }
  if (pathname === '/guides') return { title: 'Guides', sub: `${guides.length} guides` }
  if (pathname === '/') return { title: 'Home', sub: 'Overview' }
  return { title: 'Round One', sub: 'Interview trainer' }
}

export function TopBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { muted, toggleMute } = useProgress()
  const { pathname } = useLocation()
  const { title, sub } = titleFor(pathname)

  const onSound = () => {
    toggleMute()
    setMuted(!muted)
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/95 backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <span className="grid h-8 w-8 place-items-center rounded-[9px] border-2 border-ink bg-c1 shadow-[2px_2px_0_var(--color-ink)]">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round">
                <path d="M4 19V11M10 19V5M16 19v-5M22 19H2" />
              </svg>
            </span>
            <span className="font-display text-base font-extrabold tracking-tight lg:hidden">
              Round<span className="text-c1">One</span>
            </span>
          </Link>
          <div className="hidden min-w-0 lg:block">
            <p className="mono-label leading-none">{sub}</p>
            <h1 className="truncate font-display text-lg font-extrabold leading-tight tracking-tight">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="light" size="sm" onClick={onOpenPalette} aria-label="Search" className="gap-1.5">
            <Command className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="hidden rounded border border-ink px-1 font-mono text-[10px] sm:inline">K</kbd>
          </Button>
          <Button variant="light" size="sm" onClick={onSound} aria-label={muted ? 'Unmute' : 'Mute'} aria-pressed={!muted}>
            {muted ? <VolumeX className="h-4 w-4 opacity-40" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          <Link
            to="/menu"
            aria-label="All sections"
            className="hidden h-9 w-9 place-items-center rounded-lg border-2 border-ink bg-ink text-paper shadow-[2px_2px_0_var(--color-ink)] md:grid lg:hidden"
          >
            <LayoutGrid className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  )
}
