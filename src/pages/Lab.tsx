import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LightTrails } from '@/lab/LightTrails'
import { Zoetrope } from '@/lab/Zoetrope'

const PIECES = [
  { id: 'trails', name: 'Light trails', note: 'a month as one exposure', render: () => <LightTrails /> },
  { id: 'zoetrope', name: 'Zoetrope', note: 'twelve frames on a drum', render: () => <Zoetrope /> }
]

export default function Lab() {
  const [id, setId] = useState('trails')
  const piece = PIECES.find((p) => p.id === id) ?? PIECES[0]

  return (
    <div className="w-full px-3 pb-20 pt-3 sm:px-5 md:pb-6 lg:px-6">
      <div className="mx-auto flex h-[calc(100dvh-6rem)] max-w-[1150px] flex-col md:h-[calc(100dvh-4.5rem)]">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="chip bg-ink text-paper">Lab</span>
            <h1 className="mt-1 font-display text-xl font-extrabold tracking-tight">Two pieces</h1>
            <p className="text-[11.5px] font-medium text-ink-3">a photograph and an animation machine</p>
          </div>
          <Link to="/negotiate" className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3 underline underline-offset-4">promoted tools →</Link>
        </div>

        <div className="mb-2 flex flex-wrap gap-1.5">
          {PIECES.map((p) => (
            <button key={p.id} type="button" onClick={() => setId(p.id)}
              className={`rounded-lg border-2 border-ink px-2.5 py-1 text-left transition-transform hover:-translate-y-0.5 ${id === p.id ? 'bg-ink text-paper' : 'bg-card'}`}>
              <span className="block text-[11.5px] font-extrabold leading-tight">{p.name}</span>
              <span className={`block font-mono text-[7.5px] uppercase tracking-wider ${id === p.id ? 'text-white/60' : 'text-ink-3'}`}>{p.note}</span>
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border-[3px] border-ink bg-[#f7f5ee] shadow-[6px_6px_0_var(--color-ink)]">
          {piece.render()}
        </div>
      </div>
    </div>
  )
}
