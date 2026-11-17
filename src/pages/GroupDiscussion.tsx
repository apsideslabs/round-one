import { useEffect, useMemo, useState } from 'react'
import { RotateCcw, Users } from 'lucide-react'
import { Person, Defs, Bubble, type Mood } from '@/components/comic/Faces'

/**
 * A group discussion, scored the way evaluators actually score it: content,
 * communication, listening, initiative and team orientation, each out of five.
 */
interface Moment { lines: Array<{ who: 0 | 1 | 2; text: string }> }
interface Topic { title: string; moments: Moment[] }

const TOPICS: Topic[] = [
  {
    title: 'AI will remove more jobs than it creates',
    moments: [
      { lines: [{ who: 0, text: 'AI is just automation again.' }, { who: 1, text: 'Then why did hiring fall in support?' }] },
      { lines: [{ who: 2, text: 'Every earlier wave created new roles.' }, { who: 0, text: 'Not at the same speed though.' }] },
      { lines: [{ who: 1, text: 'So the issue is transition, not loss.' }, { who: 2, text: 'Easy to say if your job is safe.' }] },
      { lines: [{ who: 0, text: 'We keep going in circles.' }, { who: 1, text: 'Someone define what we are arguing.' }] },
      { lines: [{ who: 2, text: 'Two minutes left.' }, { who: 0, text: 'We should land somewhere.' }] }
    ]
  },
  {
    title: 'Work from home is better for freshers',
    moments: [
      { lines: [{ who: 1, text: 'Freshers learn by overhearing.' }, { who: 2, text: 'They also save three hours of commute.' }] },
      { lines: [{ who: 0, text: 'Nobody mentors over a call.' }, { who: 1, text: 'Mine did, twice a week.' }] },
      { lines: [{ who: 2, text: 'Then it depends on the team, not the place.' }, { who: 0, text: 'That is a cop-out.' }] },
      { lines: [{ who: 1, text: 'Hybrid keeps coming up.' }, { who: 2, text: 'As a word, not a plan.' }] },
      { lines: [{ who: 0, text: 'We have not agreed on one thing.' }, { who: 1, text: 'Time is nearly up.' }] }
    ]
  },
  {
    title: 'Engineering colleges should teach only skills, not theory',
    moments: [
      { lines: [{ who: 2, text: 'Theory is what lets you learn the next tool.' }, { who: 0, text: 'Tell that to a student with no job.' }] },
      { lines: [{ who: 1, text: 'Both, obviously.' }, { who: 2, text: 'Saying both ends the discussion.' }] },
      { lines: [{ who: 0, text: 'Companies retrain anyway.' }, { who: 1, text: 'So the degree is a filter, not a skill.' }] },
      { lines: [{ who: 2, text: 'That is a strong point.' }, { who: 0, text: 'Nobody has responded to it.' }] },
      { lines: [{ who: 1, text: 'We are short on time.' }, { who: 2, text: 'Wrap up?' }] }
    ]
  }
]

interface Move { label: string; fx: [number, number, number, number, number]; heard: string; reply: string }
const MOVES: Move[] = [
  { label: 'Open with a definition and why it matters', fx: [4, 3, 1, 5, 2], heard: 'you framed the discussion', reply: 'Okay, that gives us something to work with.' },
  { label: 'Add a number or example nobody has used', fx: [5, 3, 1, 3, 2], heard: 'new information', reply: 'Where is that from? That changes it.' },
  { label: 'Build on the last speaker by name', fx: [2, 3, 5, 2, 5], heard: 'you listened', reply: 'Exactly — and that also covers the other case.' },
  { label: 'Disagree, with a reason and a concession', fx: [3, 4, 3, 3, 4], heard: 'reasoned pushback', reply: 'Fair, though I still think the timing differs.' },
  { label: 'Summarise the group and land a conclusion', fx: [2, 5, 4, 3, 5], heard: 'you closed it', reply: 'That is a good summary of where we got to.' }
]

const DIMS = ['content', 'communication', 'listening', 'initiative', 'team']

export default function GroupDiscussion() {
  const [topicIdx, setTopicIdx] = useState(() => Math.floor(Math.random() * TOPICS.length))
  const [turn, setTurn] = useState(0)
  const [scores, setScores] = useState<number[]>([2.5, 2.5, 2.5, 2.5, 2.5])
  const [speech, setSpeech] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [talk, setTalk] = useState(0)
  const topic = TOPICS[topicIdx]
  const moment = topic.moments[Math.min(turn, topic.moments.length - 1)]

  useEffect(() => { setSpeech(null); setTalk((t) => t + 12) }, [turn])

  const move = (m: Move) => {
    setScores((s) => s.map((v, i) => Math.min(5, v + (m.fx[i] - 2.5) * 0.45)))
    setSpeech(m.reply)
    setTalk((t) => t + 25)
    window.setTimeout(() => {
      if (turn + 1 >= topic.moments.length) setDone(true)
      else setTurn((t) => t + 1)
    }, 900)
  }

  const restart = () => {
    setTopicIdx(Math.floor(Math.random() * TOPICS.length))
    setTurn(0); setScores([2.5, 2.5, 2.5, 2.5, 2.5]); setSpeech(null); setDone(false); setTalk(0)
  }

  const average = useMemo(() => scores.reduce((a, b) => a + b, 0) / scores.length, [scores])
  const verdict = average >= 3.8 ? 'ADVANCED' : average >= 2.8 ? 'BORDERLINE' : 'ELIMINATED'

  return (
    <div className="w-full px-3 pb-24 pt-4 sm:px-6 md:pb-10 lg:px-8">
      <div className="mx-auto max-w-[1020px]">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="chip bg-ink text-paper">Scene</span>
            <h1 className="mt-1.5 font-display text-2xl font-extrabold tracking-tight sm:text-3xl">Group discussion</h1>
            <p className="mt-0.5 text-[12.5px] font-medium text-ink-3">{topic.title} · 8 people, one table, no chair</p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-ink-3" />
            <span className="mono-label">your airtime</span>
            <div className="h-2.5 w-28 overflow-hidden rounded-full border-2 border-ink bg-[#eeece4]">
              <div className="h-full bg-c3" style={{ width: `${Math.min(100, talk)}%` }} />
            </div>
          </div>
        </div>

        <div className="comic-panel relative overflow-hidden rounded-2xl border-[3px] border-ink bg-[#fffcf5] shadow-[7px_7px_0_var(--color-ink)]">
          <svg viewBox="0 0 800 430" className="block w-full">
            <Defs />
            <rect width="800" height="430" fill="url(#wall)" />
            <rect x="0" y="300" width="800" height="130" fill="#e7e2d3" />
            <rect x="0" y="300" width="800" height="130" fill="url(#hatch)" opacity="0.25" />
            {/* round table */}
            <ellipse cx="400" cy="300" rx="290" ry="76" fill="#c9a227" stroke="#12151a" strokeWidth="4" />
            <ellipse cx="400" cy="300" rx="290" ry="76" fill="url(#wood)" opacity="0.5" />
            <ellipse cx="400" cy="292" rx="250" ry="58" fill="#e3d7ae" opacity="0.5" />

            {/* far side participants */}
            <Person x={250} y={120} scale={0.8} skin="#d9a273" skinShade="#c78e5f" hair="#12151a" shirt="#2f5bff" mood={(moment.lines[0].who === 0 ? 'smile' : 'neutral') as Mood} hairStyle="short" lookX={2} />
            <Person x={400} y={112} scale={0.84} skin="#f0c9a4" skinShade="#e0b189" hair="#3d2b1f" shirt="#be123c" mood={(moment.lines[1].who === 1 ? 'sceptical' : 'neutral') as Mood} hairStyle="bun" lookX={-2} />
            <Person x={552} y={120} scale={0.8} skin="#c98d5c" skinShade="#b47a4b" hair="#12151a" shirt="#0e8c6a" mood={(moment.lines[0].who === 2 ? 'frown' : 'neutral') as Mood} hairStyle="curly" lookX={-2} />

            {/* near side: two backs and you */}
            <g filter="url(#soft)">
              <path d="M 176 430 q 54 -56 108 0 Z" fill="#2f5bff" stroke="#12151a" strokeWidth="3" />
              <ellipse cx="230" cy="388" rx="42" ry="38" fill="#12151a" />
              <path d="M 506 430 q 54 -56 108 0 Z" fill="#0e8c6a" stroke="#12151a" strokeWidth="3" />
              <ellipse cx="560" cy="388" rx="42" ry="38" fill="#12151a" />
            </g>
            <ellipse cx="400" cy="404" rx="52" ry="44" fill="#ff4b26" stroke="#12151a" strokeWidth="3" />
            <text x="400" y="410" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fffcf5" fontFamily="JetBrains Mono, monospace">YOU</text>

            {moment.lines.slice(0, 1).map((l) => (
              <Bubble key={l.text} x={l.who === 1 ? 400 : l.who === 0 ? 250 : 552} y={30} text={l.text} />
            ))}
            {speech && <Bubble x={400} y={188} text={speech} />}

            <g>
              <rect x="0" y="0" width="330" height="32" fill="#12151a" />
              <rect x="330" y="0" width="14" height="32" fill="#f5b01b" />
              <text x="14" y="21" fontSize="11" fontWeight="800" fill="#fffcf5" fontFamily="JetBrains Mono, monospace">
                {`GD · ${Math.min(turn + 1, topic.moments.length)} OF ${topic.moments.length}`}
              </text>
            </g>
            <rect width="800" height="430" fill="url(#vignette)" pointerEvents="none" />
          </svg>

          {done && (
            <div className="comic-stamp pointer-events-none absolute bottom-6 right-8 rounded-sm border-4 px-3 py-1 font-display text-base font-extrabold uppercase tracking-[0.16em]"
              style={{ borderColor: verdict === 'ADVANCED' ? '#0e8c6a' : verdict === 'BORDERLINE' ? '#b8860b' : '#be123c', color: verdict === 'ADVANCED' ? '#0e8c6a' : verdict === 'BORDERLINE' ? '#b8860b' : '#be123c', background: 'rgba(255,252,245,0.9)' }}>
              {verdict}
            </div>
          )}
        </div>

        {!done ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {MOVES.map((m) => (
              <button key={m.label} type="button" onClick={() => move(m)}
                className="flex items-center justify-between gap-2 rounded-xl border-2 border-ink bg-card px-3.5 py-2.5 text-left text-[13px] font-bold leading-snug shadow-[3px_3px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none">
                {m.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-3 grid gap-2 rounded-xl border-2 border-ink bg-card p-3 shadow-[3px_3px_0_var(--color-ink)]">
            <p className="mono-label">evaluator scorecard · out of 5</p>
            <div className="grid gap-1.5">
              {DIMS.map((d, i) => (
                <div key={d} className="grid grid-cols-[110px_1fr_34px] items-center gap-2">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-3">{d}</span>
                  <div className="h-3 overflow-hidden rounded border-2 border-ink bg-[#eeece4]">
                    <div className="h-full bg-c2" style={{ width: `${(scores[i] / 5) * 100}%` }} />
                  </div>
                  <span className="font-mono text-[10px] font-bold tabular-nums">{scores[i].toFixed(1)}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button type="button" onClick={restart} className="inline-flex items-center gap-2 rounded-xl border-2 border-ink bg-c1 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-white shadow-[3px_3px_0_var(--color-ink)]">
                <RotateCcw className="h-3.5 w-3.5" /> new topic
              </button>
              <span className="text-[12px] font-medium text-ink-3">
                {average >= 3.8 ? 'Advanced — you framed, listened and closed.' : average >= 2.8 ? 'Borderline — you spoke, but the group did not move because of you.' : 'Eliminated — the group carried the discussion without you.'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
