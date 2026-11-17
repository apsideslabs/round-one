import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw, ChevronRight, Clock, Check, X } from 'lucide-react'
import { Person, Bubble, Defs, type Mood } from '@/components/comic/Faces'
import { drawQuestions, cvQuestions, followFor, type Opt, type Panel, type Q, type Follow } from '@/data/scene'
import { readCV, saveCV, loadCV, type Profile } from '@/lib/cv'

const JUDGES = [
  { name: 'P·ONE', role: 'technical', colour: '#2f5bff' },
  { name: 'P·TWO', role: 'HR · culture', colour: '#be123c' },
  { name: 'P·THREE', role: 'hiring manager', colour: '#0e8c6a' }
]

const verdictFor = (s: number) => (s >= 8 ? 'select' : s >= 4 ? 'maybe' : 'no')
const PER_Q = 45

export default function Interview() {
  const [seed, setSeed] = useState(0)
  const [cvText, setCvText] = useState(() => loadCV())
  const [showCV, setShowCV] = useState(() => loadCV().trim().length === 0)
  const profile: Profile = useMemo(() => readCV(cvText), [cvText])
  const questions = useMemo(() => {
    const base = drawQuestions().slice(0, 8)
    return profile.empty ? drawQuestions() : [...base, ...cvQuestions(profile)]
  }, [seed, profile])
  const [idx, setIdx] = useState(0)
  const [scores, setScores] = useState<Panel>([0, 0, 0])
  const [phase, setPhase] = useState<'ask' | 'follow' | 'debrief' | 'final'>('ask')
  const [last, setLast] = useState<{ q: Q; opt: Opt | null; follow?: Follow; fopt?: Opt | null } | null>(null)
  const [log, setLog] = useState<Array<{ q: Q; opt: Opt | null; follow?: Follow; fopt?: Opt | null }>>([])
  const [left, setLeft] = useState(PER_Q)

  const q = questions[idx]

  useEffect(() => {
    if (phase !== 'ask') return
    setLeft(PER_Q)
    const id = window.setInterval(() => setLeft((t) => Math.max(0, t - 1)), 1000)
    return () => window.clearInterval(id)
  }, [phase, idx])

  const answer = (opt: Opt | null) => {
    setScores((s) => [s[0] + (opt?.fx[0] ?? -2), s[1] + (opt?.fx[1] ?? -2), s[2] + (opt?.fx[2] ?? -2)])
    const follow = followFor(q.id, opt)
    if (follow) {
      setLast({ q, opt, follow })
      setPhase('follow')
      return
    }
    setLast({ q, opt })
    setLog((l) => [...l, { q, opt }])
    setPhase('debrief')
  }

  const answerFollow = (fopt: Opt | null) => {
    setScores((s) => [s[0] + (fopt?.fx[0] ?? -2), s[1] + (fopt?.fx[1] ?? -2), s[2] + (fopt?.fx[2] ?? -2)])
    setLast((prev) => {
      const next = prev ? { ...prev, fopt } : { q, opt: null, fopt }
      setLog((l) => [...l, next])
      return next
    })
    setPhase('debrief')
  }

  useEffect(() => {
    if (phase === 'ask' && left === 0) answer(null)
  })

  const next = () => {
    if (idx + 1 >= questions.length) { setPhase('final'); return }
    setIdx((i) => i + 1)
    setPhase('ask')
  }

  const restart = () => { setSeed((s) => s + 1); setIdx(0); setScores([0, 0, 0]); setLog([]); setLast(null); setPhase('ask') }

  const verdicts = scores.map(verdictFor)
  const selects = verdicts.filter((v) => v === 'select').length
  const overall = selects >= 2 ? 'SELECTED' : verdicts.includes('select') ? 'BORDERLINE' : 'NOT THIS TIME'
  const overallColour = overall === 'SELECTED' ? '#0e8c6a' : overall === 'BORDERLINE' ? '#b8860b' : '#be123c'
  const meter = (v: number) => Math.max(0, Math.min(10, Math.round(v / 2) + 1))
  const scene = q?.scene ?? 'wide'

  return (
    <div className="w-full px-3 pb-24 pt-4 sm:px-6 md:pb-10 lg:px-8">
      <div className="mx-auto max-w-[1020px]">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="chip bg-ink text-paper">Scene</span>
            <h1 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">The interview</h1>
            <p className="mt-0.5 text-[12.5px] font-medium text-ink-3">
              {phase === 'final' ? 'Calibration — they decide without you in the room.' : `${questions.length} questions · three scorecards · 45 seconds each`}
            </p>
          </div>
          <div className="grid gap-1">
            {JUDGES.map((j, i) => (
              <div key={j.name} className="flex items-center gap-2">
                <span className="w-[64px] font-mono text-[8px] font-bold uppercase tracking-wider text-ink-3">{j.name}</span>
                <div className="flex gap-[3px]">
                  {Array.from({ length: 10 }, (_, k) => (
                    <span key={k} className="h-2.5 w-3.5 rounded-[2px] border border-ink/40" style={{ background: k < meter(scores[i]) ? j.colour : '#eeece4' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-2 rounded-xl border-2 border-ink bg-card shadow-[3px_3px_0_var(--color-ink)]">
          <button type="button" onClick={() => setShowCV((v) => !v)} className="flex w-full items-center gap-2 px-3 py-2 text-left">
            <span className="mono-label">your cv</span>
            <span className="min-w-0 flex-1 truncate text-[11.5px] font-medium text-ink-3">
              {profile.empty ? 'paste it — the questions will adapt to your skills' : `${profile.skills.slice(0, 4).join(' · ') || 'read'}${profile.hasInternship ? ' · internship' : ' · no internship'}`}
            </span>
            <ChevronRight className={`h-3.5 w-3.5 shrink-0 transition-transform ${showCV ? 'rotate-90' : ''}`} />
          </button>
          {showCV && (
            <div className="border-t-2 border-ink/15 p-2.5">
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Paste your resume text here. Nothing leaves this browser."
                className="h-24 w-full resize-none rounded-lg border-2 border-ink bg-paper px-2.5 py-2 text-[12px] font-medium outline-none"
              />
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => { saveCV(cvText); setShowCV(false); setSeed((s) => s + 1); setIdx(0); setPhase('ask'); setLog([]); setScores([0, 0, 0]) }}
                  className="rounded-lg border-2 border-ink bg-c2 px-3 py-1 font-mono text-[9px] font-bold uppercase tracking-wider shadow-[2px_2px_0_var(--color-ink)]">
                  adapt the questions
                </button>
                <span className="text-[11px] font-medium text-ink-3">
                  {profile.skills.length ? `found ${profile.skills.length} skills` : 'no skills recognised yet'}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="comic-panel relative overflow-hidden rounded-2xl border-[3px] border-ink bg-[#fffcf5] shadow-[7px_7px_0_var(--color-ink)]">
          <svg viewBox="0 0 800 450" className="block w-full">
            <Defs />
            <rect width="800" height="450" fill="url(#wall)" />
            <line x1="0" y1="300" x2="800" y2="300" stroke="#12151a" strokeWidth="3" />
            <rect x="0" y="300" width="800" height="150" fill="#e7e2d3" />
            <rect x="0" y="300" width="800" height="150" fill="url(#hatch)" opacity="0.25" />
            <rect x="600" y="40" width="150" height="120" fill="#cfe3ee" stroke="#12151a" strokeWidth="4" />
            <line x1="675" y1="40" x2="675" y2="160" stroke="#12151a" strokeWidth="3" />
            <line x1="600" y1="100" x2="750" y2="100" stroke="#12151a" strokeWidth="3" />
            <polygon points="600,160 750,160 470,450 120,450" fill="url(#light)" opacity="0.5" />
            <rect x="70" y="46" width="110" height="80" fill="#efece1" stroke="#12151a" strokeWidth="3.5" />
            <path d="M 78 118 l 30 -40 l 22 26 l 18 -18 l 24 32 Z" fill="#b9c7a6" stroke="#12151a" strokeWidth="2" />

            {scene === 'board' && (
              <g>
                <rect x="36" y="34" width="360" height="188" fill="#fbfbf6" stroke="#12151a" strokeWidth="4" />
                <g stroke="#2f5bff" strokeWidth="3" fill="none">
                  <rect x="66" y="62" width="74" height="38" rx="4" />
                  <rect x="176" y="62" width="74" height="38" rx="4" />
                  <rect x="286" y="62" width="74" height="38" rx="4" />
                  <path d="M 140 81 h 36 M 250 81 h 36" />
                </g>
                <g stroke="#be123c" strokeWidth="2.5" fill="none">
                  <path d="M 66 140 h 294" strokeDasharray="6 5" />
                  {[96, 176, 256].map((cx) => <circle key={cx} cx={cx} cy="140" r="8" />)}
                </g>
                <text x="66" y="172" fontSize="11" fontFamily="JetBrains Mono, monospace" fill="#12151a" opacity="0.6">buckets · collisions</text>
              </g>
            )}

            {scene !== 'board' && scene !== 'you' && (
              <>
                <rect x="150" y="300" width="620" height="20" fill="#c9a227" stroke="#12151a" strokeWidth="3.5" />
                <rect x="150" y="300" width="620" height="20" fill="url(#wood)" opacity="0.6" />
                <rect x="176" y="320" width="20" height="110" fill="#a8871d" stroke="#12151a" strokeWidth="3" />
                <rect x="726" y="320" width="20" height="110" fill="#a8871d" stroke="#12151a" strokeWidth="3" />
                <ellipse cx="470" cy="432" rx="330" ry="20" fill="#12151a" opacity="0.10" />
                <path d="M 300 300 l 10 -40 l 90 0 l 6 40 Z" fill="#8e9aa6" stroke="#12151a" strokeWidth="3" />
                <rect x="296" y="296" width="116" height="8" rx="3" fill="#6f7a86" stroke="#12151a" strokeWidth="2.5" />
                <rect x="470" y="272" width="34" height="30" rx="4" fill="#fffcf5" stroke="#12151a" strokeWidth="3" />
                <path d="M 504 278 q 16 6 0 18" fill="none" stroke="#12151a" strokeWidth="3" />
              </>
            )}

            {scene !== 'you' ? (
              <>
                <Person x={scene === 'board' ? 500 : 392} y={scene === 'panel' ? 118 : 128} scale={scene === 'panel' ? 0.96 : scene === 'board' ? 0.8 : 0.86} skin="#f0c9a4" skinShade="#e0b189" hair="#2b2b2b" shirt="#2f5bff" mood={(q?.moods[0] ?? 'neutral') as Mood} hairStyle="short" glasses lookX={-2} />
                <Person x={scene === 'board' ? 600 : 502} y={scene === 'panel' ? 110 : 120} scale={scene === 'panel' ? 1.02 : scene === 'board' ? 0.84 : 0.92} skin="#d9a273" skinShade="#c78e5f" hair="#12151a" shirt="#be123c" mood={(q?.moods[1] ?? 'neutral') as Mood} hairStyle="bun" lookX={-2} />
                <Person x={scene === 'board' ? 700 : 614} y={scene === 'panel' ? 118 : 128} scale={scene === 'panel' ? 0.96 : scene === 'board' ? 0.8 : 0.86} skin="#c98d5c" skinShade="#b47a4b" hair="#3d2b1f" shirt="#0e8c6a" mood={(q?.moods[2] ?? 'neutral') as Mood} hairStyle="bald" beard lookX={-2} />
                {(scene === 'board' ? [500, 600, 700] : [392, 502, 614]).map((cx, i) => (
                  <g key={cx}>
                    <rect x={cx - 34} y="304" width="68" height="14" rx="2" fill="#12151a" opacity="0.85" />
                    <text x={cx} y="314" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#fffcf5" fontFamily="JetBrains Mono, monospace">{JUDGES[i].name}</text>
                  </g>
                ))}
                <g filter="url(#soft)">
                  <ellipse cx="86" cy="392" rx="58" ry="60" fill="#12151a" />
                  <path d="M 18 450 q 68 -54 136 0 Z" fill="#ff4b26" stroke="#12151a" strokeWidth="3" />
                </g>
              </>
            ) : (
              <>
                <rect x="0" y="300" width="800" height="150" fill="url(#halftone)" opacity="0.45" />
                <Person x={400} y={130} scale={1.5} skin="#f0c9a4" skinShade="#e0b189" hair="#2b2b2b" shirt="#ff4b26" mood="neutral" hairStyle="short" />
              </>
            )}

            {q?.ask && phase !== 'final' && <Bubble x={scene === 'board' ? 600 : 502} y={22} text={phase === 'follow' && last?.follow ? last.follow.ask : q.ask} />}
            {phase === 'final' && <Bubble x={502} y={22} text="We will let you know." />}

            <g>
              <rect x="0" y="0" width="360" height="34" fill="#12151a" />
              <rect x="360" y="0" width="16" height="34" fill="#f5b01b" />
              <text x="16" y="22" fontSize="11.5" fontWeight="800" fill="#fffcf5" fontFamily="JetBrains Mono, monospace">
                {phase === 'final' ? 'CALIBRATION · AFTER YOU LEAVE' : `${q?.round.toUpperCase()} · QUESTION ${idx + 1} OF ${questions.length}`.toUpperCase()}
              </text>
            </g>
            <rect width="800" height="450" fill="url(#vignette)" pointerEvents="none" />
          </svg>

          {phase === 'ask' && (
            <div className="absolute right-4 top-11 flex items-center gap-1.5 rounded-full border-2 border-ink bg-[#fffcf5] px-2.5 py-1">
              <Clock className="h-3 w-3" />
              <span className={`font-mono text-[11px] font-bold tabular-nums ${left <= 10 ? 'text-bad' : ''}`}>{left}s</span>
            </div>
          )}

          {phase === 'final' && (
            <>
              {JUDGES.map((j, i) => {
                const v = verdicts[i]
                const text = v === 'select' ? 'SELECT' : v === 'maybe' ? 'MAYBE' : 'NO'
                const colour = v === 'select' ? '#0e8c6a' : v === 'maybe' ? '#b8860b' : '#be123c'
                return (
                  <div key={j.name} className="comic-stamp pointer-events-none absolute rounded-sm border-[3px] px-2 py-0.5 font-display text-[10px] font-extrabold uppercase tracking-[0.14em] sm:text-[11px]"
                    style={{ left: '3.5%', top: `${54 + i * 13}%`, borderColor: colour, color: colour, background: 'rgba(255,252,245,0.86)', animationDelay: `${i * 0.28}s` }}>
                    {j.name} · {text}
                  </div>
                )
              })}
              <div className="comic-stamp pointer-events-none absolute bottom-6 right-8 rounded-sm border-4 px-3 py-1 font-display text-base font-extrabold uppercase tracking-[0.16em] sm:text-lg"
                style={{ borderColor: overallColour, color: overallColour, background: 'rgba(255,252,245,0.9)', animationDelay: '0.9s' }}>
                {overall}
              </div>
            </>
          )}
        </div>

        {/* ---------- debrief ---------- */}
        {phase === 'debrief' && last && (
          <div className="mt-3 grid gap-2 rounded-xl border-2 border-ink bg-card p-3.5 shadow-[3px_3px_0_var(--color-ink)] sm:grid-cols-2">
            <div>
              <p className="mono-label mb-1">what they heard</p>
              <p className="text-[13px] font-medium leading-relaxed text-ink-2">
                {last.opt ? last.opt.heard : 'nothing — the clock ran out'}
              </p>
              {last.fopt && (
                <p className="mt-1 text-[12px] font-medium leading-relaxed text-ink-2">
                  Then, on the follow-up: <span className="font-bold">{last.fopt.heard}</span>
                </p>
              )}
              <p className="mono-label mb-1 mt-2.5">scorecard</p>
              <div className="flex gap-2">
                {[...(last.opt?.fx ?? [0, 0, 0])].map((d, i) => (
                  <span key={i} className={`inline-flex items-center gap-1 rounded-md border-2 border-ink px-1.5 py-0.5 font-mono text-[10px] font-bold ${d > 0 ? 'bg-c2-soft' : d < 0 ? 'bg-c1-soft' : 'bg-[#f4f2ea]'}`}>
                    {d > 0 ? <Check className="h-3 w-3" /> : d < 0 ? <X className="h-3 w-3" /> : '·'} {JUDGES[i].name} {d > 0 ? `+${d}` : d}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="mono-label mb-1">what a strong answer sounds like</p>
              <p className="rounded-lg border-2 border-ink bg-c2-soft px-2.5 py-2 text-[12.5px] font-medium italic leading-relaxed text-ink">
                {(last.follow ?? last.q).model}
              </p>
              <p className="mt-1.5 text-[11.5px] font-medium leading-relaxed text-ink-3">{(last.follow ?? last.q).why}</p>
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button type="button" onClick={next} className="inline-flex items-center gap-1.5 rounded-lg border-2 border-ink bg-c1 px-3.5 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_var(--color-ink)]">
                {idx + 1 >= questions.length ? 'Go to calibration' : 'Next question'} <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ---------- answers ---------- */}
        {phase === 'follow' && last?.follow && (
          <div className="mt-3">
            <p className="mono-label mb-1.5">they push back — answer again</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {last.follow.opts.map((o) => (
                <button key={o.label} type="button" onClick={() => answerFollow(o)}
                  className="group flex items-center justify-between gap-2 rounded-xl border-2 border-ink bg-c3-soft px-3.5 py-2.5 text-left text-[13px] font-bold leading-snug shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none">
                  <span>{o.label}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-ink-3" />
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'ask' && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {q.opts.map((o) => (
              <button key={o.label} type="button" onClick={() => answer(o)}
                className="group flex items-center justify-between gap-2 rounded-xl border-2 border-ink bg-card px-3.5 py-2.5 text-left text-[13px] font-bold leading-snug shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none">
                <span>{o.label}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-ink-3 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        )}

        {/* ---------- final debrief ---------- */}
        {phase === 'final' && (
          <div className="mt-3 grid gap-2">
            <div className="rounded-xl border-2 border-ink bg-card p-3 shadow-[3px_3px_0_var(--color-ink)]">
              <p className="mono-label mb-1.5">every answer, and the line that would have scored</p>
              <ul className="grid gap-1.5">
                {log.map(({ q: item, opt }, i) => (
                  <li key={item.id} className="grid gap-0.5 border-b border-line/60 pb-1.5 last:border-0 last:pb-0">
                    <span className="flex items-center gap-1.5 text-[12px] font-extrabold">
                      <span className="font-mono text-[9px] text-ink-3">{String(i + 1).padStart(2, '0')}</span>
                      {item.ask}
                      <span className={`ml-auto rounded border border-ink px-1 font-mono text-[8px] font-bold uppercase ${opt?.grade === 'strong' ? 'bg-c2-soft' : opt?.grade === 'ok' ? 'bg-c3-soft' : 'bg-c1-soft'}`}>
                        {opt ? opt.grade : 'timed out'}
                      </span>
                    </span>
                    <span className="text-[11.5px] font-medium leading-relaxed text-ink-3">
                      you: {opt ? opt.label : 'no answer'} → best: {item.model}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={restart} className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-c1 px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-[3px_3px_0_var(--color-ink)]">
                <RotateCcw className="h-3.5 w-3.5" /> walk in again
              </button>
              <Link to="/panel" className="rounded-xl border-2 border-ink bg-card px-4 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider shadow-[3px_3px_0_var(--color-ink)]">
                written panel →
              </Link>
            </div>
            <p className="text-[12.5px] font-medium leading-relaxed text-ink-2">
              {overall === 'SELECTED'
                ? 'Two of three scored you above the line, so calibration lists you as a definite offer.'
                : overall === 'BORDERLINE'
                  ? 'One yes, and the rest unsure. This is the bucket that gets argued over — trainable weakness or disqualifying.'
                  : 'Nobody scored you above the line. The decision takes a minute and nobody disagrees.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
