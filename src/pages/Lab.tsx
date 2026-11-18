import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Rubik } from '@/lab/Rubik'

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
      <div className="relative mx-auto grid h-[calc(100dvh-4rem)] max-w-[1100px] grid-rows-[auto_1fr] px-3 py-3">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="chip bg-ink text-paper">Lab</span>
            <h1 className="mt-1 font-display text-xl font-extrabold tracking-tight">Rubik's cube</h1>
            <p className="text-[11.5px] font-medium text-ink-3">CSS 3D · spring-snapped turns · inertial orbit</p>
          </div>
          <Link to="/negotiate" className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3 underline underline-offset-4">promoted tools →</Link>
        </div>
        <div className="min-h-0 overflow-hidden rounded-2xl border-[3px] border-ink bg-[#f7f5ee] shadow-[6px_6px_0_var(--color-ink)]">
          <Rubik />
        </div>
        <div className="hidden">{kept.join('·')}{<Link to="/negotiate">promoted</Link>}</div>
      </div>
    </div>
  )
}
