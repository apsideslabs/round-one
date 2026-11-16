import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { TopBar } from '@/components/TopBar'
import { BottomNav } from '@/components/BottomNav'
import { CommandPalette } from '@/components/CommandPalette'

export function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar onOpenPalette={() => setPaletteOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t-2 border-ink px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
          <span className="mono-label">Round One · aptitude → logic → memory → the panel</span>
          <span className="mono-label">Built with React, Vite and Tailwind</span>
        </div>
      </footer>
      <BottomNav />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  )
}
