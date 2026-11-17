import * as Dialog from '@radix-ui/react-dialog'
import { Command } from 'cmdk'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, BarChart3, Layers, Sparkles, Users, Home, RotateCcw, Volume2, Scale, Gamepad2 } from 'lucide-react'
import { tracks } from '@/data/tracks'
import { guides } from '@/data/guides'
import { useProgress } from '@/store/progress'

const icons = { logic: BarChart3, memory: Layers, riddles: Sparkles, panel: Users, morality: Scale }

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate()
  const { reset, toggleMute } = useProgress()

  const go = (path: string) => {
    onOpenChange(false)
    navigate(path)
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/55 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-[12%] z-50 w-[min(92vw,520px)] -translate-x-1/2 rounded-2xl border-2 border-ink bg-card p-2 shadow-[8px_8px_0_var(--color-ink)]">
          <Dialog.Title className="sr-only">Command menu</Dialog.Title>
          <Command loop className="[&_[cmdk-group-heading]]:mono-label [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
            <Command.Input
              placeholder="Jump to a round, a guide…"
              className="w-full rounded-xl border-2 border-ink bg-paper px-3 py-2.5 font-sans text-sm font-semibold outline-none"
            />
            <Command.List className="mt-2 max-h-[52vh] overflow-y-auto">
              <Command.Empty className="px-3 py-6 text-center text-sm text-ink-3">Nothing matches that.</Command.Empty>

              <Command.Group heading="Rounds">
                <Item onSelect={() => go('/')} icon={<Home className="h-4 w-4" />} label="Home" />
                {tracks.map((t) => {
                  const Icon = icons[t.id as keyof typeof icons]
                  return <Item key={t.id} onSelect={() => go(t.path)} icon={<Icon className="h-4 w-4" />} label={`${t.no} · ${t.name}`} />
                })}
              </Command.Group>

              <Command.Group heading="Test">
                <Item onSelect={() => go('/mock')} icon={<Gamepad2 className="h-4 w-4" />} label="Full mock test" />
                <Item onSelect={() => go('/interview')} icon={<Gamepad2 className="h-4 w-4" />} label="The interview (scene)" />
                <Item onSelect={() => go('/negotiate')} icon={<Gamepad2 className="h-4 w-4" />} label="Negotiation (salary)" />
                <Item onSelect={() => go('/gd')} icon={<Gamepad2 className="h-4 w-4" />} label="Group discussion (scene)" />
                <Item onSelect={() => go('/lab')} icon={<Gamepad2 className="h-4 w-4" />} label="Workspace" />
              </Command.Group>

              <Command.Group heading="Arcade">
                <Item onSelect={() => go('/arcade')} icon={<Gamepad2 className="h-4 w-4" />} label="All games" />
                <Item onSelect={() => go('/arcade/mastermind')} icon={<Gamepad2 className="h-4 w-4" />} label="Mastermind" />
                <Item onSelect={() => go('/arcade/sequence')} icon={<Gamepad2 className="h-4 w-4" />} label="Sequence" />
                <Item onSelect={() => go('/arcade/maths')} icon={<Gamepad2 className="h-4 w-4" />} label="Maths sprint" />
                <Item onSelect={() => go('/arcade/estimate')} icon={<Gamepad2 className="h-4 w-4" />} label="Estimate" />
                <Item onSelect={() => go('/arcade/triage')} icon={<Gamepad2 className="h-4 w-4" />} label="Triage" />
                <Item onSelect={() => go('/arcade/debug')} icon={<Gamepad2 className="h-4 w-4" />} label="Spot the bug" />
                <Item onSelect={() => go('/arcade/oddtile')} icon={<Gamepad2 className="h-4 w-4" />} label="Odd tile" />
                <Item onSelect={() => go('/arcade/matrix')} icon={<Gamepad2 className="h-4 w-4" />} label="Pattern matrix" />
              </Command.Group>

              <Command.Group heading="Guides">
                <Item onSelect={() => go('/guides')} icon={<BookOpen className="h-4 w-4" />} label="All guides" />
                {guides.map((g) => (
                  <Item key={g.slug} onSelect={() => go(`/guides/${g.slug}`)} icon={<BookOpen className="h-4 w-4" />} label={g.title} />
                ))}
              </Command.Group>

              <Command.Group heading="Actions">
                <Item
                  onSelect={() => {
                    toggleMute()
                    onOpenChange(false)
                  }}
                  icon={<Volume2 className="h-4 w-4" />}
                  label="Toggle sound"
                />
                <Item
                  onSelect={() => {
                    reset()
                    onOpenChange(false)
                  }}
                  icon={<RotateCcw className="h-4 w-4" />}
                  label="Reset all progress"
                />
              </Command.Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Item({ label, icon, onSelect }: { label: string; icon: ReactNode; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-semibold text-ink-2 data-[selected=true]:bg-c1-soft data-[selected=true]:text-ink"
    >
      {icon}
      {label}
    </Command.Item>
  )
}
