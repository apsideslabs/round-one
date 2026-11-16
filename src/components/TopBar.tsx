import { Link } from 'react-router-dom'
import { Volume2, VolumeX, Command } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProgress, level, levelProgress } from '@/store/progress'
import { setMuted } from '@/lib/fx'

export function TopBar({ onOpenPalette }: { onOpenPalette: () => void }) {
  const { xp, muted, toggleMute } = useProgress()

  const onSound = () => {
    toggleMute()
    setMuted(!muted)
  }

  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-[9px] border-2 border-ink bg-c1 shadow-[2px_2px_0_var(--color-ink)]">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round">
              <path d="M4 19V11M10 19V5M16 19v-5M22 19H2" />
            </svg>
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">
            Round<span className="text-c1">One</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex" title={`Level ${level(xp)}`}>
            <span className="grid h-7 w-7 place-items-center rounded-full border-2 border-ink bg-c1 font-display text-xs font-extrabold text-white shadow-[2px_2px_0_var(--color-ink)]">
              {level(xp)}
            </span>
            <span className="h-2.5 w-16 overflow-hidden rounded-full border-2 border-ink bg-[#f2f0e8]">
              <span className="block h-full bg-c3 transition-[width] duration-500" style={{ width: `${levelProgress(xp)}%` }} />
            </span>
          </div>

          <Button variant="light" size="sm" onClick={onOpenPalette} aria-label="Open command menu" className="gap-1.5">
            <Command className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Menu</span>
            <kbd className="hidden rounded border border-ink px-1 font-mono text-[10px] sm:inline">K</kbd>
          </Button>

          <Button variant="light" size="sm" onClick={onSound} aria-label={muted ? 'Unmute' : 'Mute'} aria-pressed={!muted}>
            {muted ? <VolumeX className="h-4 w-4 opacity-40" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
