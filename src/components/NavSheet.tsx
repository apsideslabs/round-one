import * as Dialog from '@radix-ui/react-dialog'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, ChevronRight, RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import { tracks, trackById } from '@/data/tracks'
import { games } from '@/data/games'
import { guides } from '@/data/guides'
import { useProgress } from '@/store/progress'
import { setMuted } from '@/lib/fx'

export function NavSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { muted, toggleMute, reset, lastRound, scores, gameBests } = useProgress()
  const resume = lastRound ? trackById(lastRound) : null

  const close = () => onOpenChange(false)

  const onSound = () => {
    toggleMute()
    setMuted(!muted)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-[2px]" />
        <Dialog.Content className="sheet-in fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-3xl border-2 border-ink bg-paper shadow-[0_-8px_0_rgba(18,21,26,0.12)] sm:inset-x-auto sm:bottom-4 sm:left-1/2 sm:w-[560px] sm:-translate-x-1/2 sm:rounded-3xl">
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>

          <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-ink/25 sm:hidden" />
          <div className="flex items-center justify-between gap-3 border-b-2 border-ink px-4 py-3">
            <span className="font-display text-lg font-extrabold tracking-tight">Everything</span>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close menu"
                className="grid h-9 w-9 place-items-center rounded-lg border-2 border-ink bg-card shadow-[2px_2px_0_var(--color-ink)]"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            {resume && (
              <Link
                to={resume.path}
                onClick={close}
                className="mb-4 flex items-center justify-between gap-3 rounded-xl border-2 border-ink px-3.5 py-3 shadow-[3px_3px_0_var(--color-ink)]"
                style={{ background: resume.soft }}
              >
                <span className="grid gap-0.5">
                  <span className="mono-label">Continue</span>
                  <span className="font-display text-base font-extrabold tracking-tight">{resume.name}</span>
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            <p className="mono-label mb-2">Rounds</p>
            <ul className="mb-5 grid gap-1.5">
              {tracks.map((t) => (
                <li key={t.id}>
                  <Link
                    to={t.path}
                    onClick={close}
                    className="flex items-center gap-3 rounded-lg border-2 border-ink bg-card px-3 py-2.5 shadow-[2px_2px_0_var(--color-ink)]"
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-md border-2 border-ink font-mono text-[10px] font-bold" style={{ background: t.colour, color: t.ink }}>
                      {t.no}
                    </span>
                    <span className="min-w-0 flex-1 text-[13.5px] font-extrabold">{t.name}</span>
                    <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3">
                      {scores[t.id] ? `${scores[t.id]}/${t.max}` : '—'}
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mono-label mb-2">Arcade</p>
            <ul className="mb-5 grid grid-cols-2 gap-1.5">
              {games.map((g) => (
                <li key={g.id}>
                  <Link
                    to={g.path}
                    onClick={close}
                    className="flex h-full flex-col gap-0.5 rounded-lg border-2 border-ink bg-card px-2.5 py-2 shadow-[2px_2px_0_var(--color-ink)]"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full border border-ink" style={{ background: g.colour }} />
                      <span className="text-[12.5px] font-extrabold">{g.name}</span>
                    </span>
                    <span className="font-mono text-[8.5px] font-bold uppercase tracking-wider text-ink-3">
                      {gameBests[g.id] ? `best ${gameBests[g.id]}` : 'new'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mono-label mb-2">Guides</p>
            <ul className="mb-5 grid gap-1.5">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link to={`/guides/${g.slug}`} onClick={close} className="flex items-center gap-2.5 rounded-lg border-2 border-ink bg-card px-3 py-2 shadow-[2px_2px_0_var(--color-ink)]">
                    <BookOpen className="h-3.5 w-3.5 shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold">{g.title}</span>
                    <span className="font-mono text-[8.5px] font-bold uppercase tracking-wider text-ink-3">{g.minutes}m</span>
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mono-label mb-2">Settings</p>
            <div className="grid gap-1.5 pb-2">
              <button
                type="button"
                onClick={onSound}
                className="flex items-center gap-2.5 rounded-lg border-2 border-ink bg-card px-3 py-2.5 text-left text-[13px] font-bold shadow-[2px_2px_0_var(--color-ink)]"
              >
                {muted ? <VolumeX className="h-4 w-4 opacity-50" /> : <Volume2 className="h-4 w-4" />}
                <span className="flex-1">Sound {muted ? 'off' : 'on'}</span>
                <span className="chip bg-[#f4f2ea] border-line">{muted ? 'muted' : 'on'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  reset()
                  close()
                }}
                className="flex items-center gap-2.5 rounded-lg border-2 border-ink bg-card px-3 py-2.5 text-left text-[13px] font-bold shadow-[2px_2px_0_var(--color-ink)]"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="flex-1">Reset all progress</span>
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
