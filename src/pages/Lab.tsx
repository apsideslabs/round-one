import { useState } from 'react'
import { Link } from 'react-router-dom'

/**
 * The workspace: a blank stage. Experiments live here until they are good
 * enough to promote into the app, and then they leave. Nothing is kept here
 * for decoration — see docs/LAB_FIRST.md.
 */
export default function Lab() {
  const [kept] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('ro.lab.kept') ?? '[]') } catch { return [] }
  })

  return (
    <div className="relative min-h-[calc(100dvh-4rem)] w-full">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(18,21,26,0.14) 1px, transparent 0)',
          backgroundSize: '22px 22px'
        }}
      />
      <div className="relative grid min-h-[calc(100dvh-4rem)] place-items-center px-6">
        <div className="max-w-[440px] text-center">
          <span className="chip bg-ink text-paper">Workspace</span>
          <h1 className="mt-2 font-display text-2xl font-extrabold tracking-tight">An empty stage</h1>
          <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-ink-3">
            Nothing is built here right now. Every experiment has either been promoted into the app or deleted.
          </p>
          <p className="mt-3 font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-ink-3">
            lab first · nothing ships until it is kept here
          </p>
          {kept.length > 0 && (
            <p className="mt-2 text-[11.5px] font-medium text-ink-3">shortlist: {kept.join(' · ')}</p>
          )}
          <Link to="/negotiate" className="mt-4 inline-block rounded-lg border-2 border-ink bg-c1 px-3.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_var(--color-ink)]">
            see what was promoted →
          </Link>
        </div>
      </div>
    </div>
  )
}
