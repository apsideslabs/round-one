import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import { dilemmas, stageNames, type Dilemma, type MoralOption } from '@/data/morality'
import { rate, schemas, schemaOf, type SchemaId } from '@/lib/morality'
import { trackById } from '@/data/tracks'
import { Button } from '@/components/ui/button'
import { useProgress } from '@/store/progress'
import { soundFinish, soundRight } from '@/lib/fx'
import { pad, shuffle } from '@/lib/utils'

const track = trackById('morality')
const POINTS = 10

type Phase = 'intro' | 'play' | 'result'

interface Choice {
  dilemma: Dilemma
  option: MoralOption
}

export default function Morality() {
  const navigate = useNavigate()
  const record = useProgress((s) => s.record)
  const addXp = useProgress((s) => s.addXp)

  const [phase, setPhase] = useState<Phase>('intro')
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<MoralOption | null>(null)
  const [choices, setChoices] = useState<Choice[]>([])
  const [runId, setRunId] = useState(0)

  const deck = useMemo(() => dilemmas.map((d) => ({ ...d, options: shuffle(d.options) })), [runId])
  const dilemma = deck[index]
  const result = useMemo(() => rate(choices.map((c) => c.option)), [choices])

  const choose = (option: MoralOption) => {
    if (picked) return
    setPicked(option)
    soundRight()
    setChoices((c) => [...c, { dilemma, option }])
  }

  const advance = () => {
    if (!picked) return
    if (index === deck.length - 1) {
      record('morality', deck.length * POINTS)
      addXp(deck.length * POINTS + 20)
      soundFinish()
      setPhase('result')
      return
    }
    setIndex((i) => i + 1)
    setPicked(null)
  }

  const restart = () => {
    setPhase('intro')
    setIndex(0)
    setPicked(null)
    setChoices([])
    setRunId((n) => n + 1)
  }

  /* ---------------- intro ---------------- */
  if (phase === 'intro') {
    return (
      <section className="mx-auto w-full max-w-3xl px-4 pb-12 pt-6 sm:px-6">
        <span className="chip" style={{ background: track.soft }}>
          <span className="h-2 w-2 rounded-full border border-ink" style={{ background: track.colour }} />
          {track.no} · Moral development
        </span>
        <h1 className="mt-3 text-balance font-display text-3xl font-extrabold leading-tight tracking-tighter sm:text-4xl">
          There is no correct answer. There is a reason you reach for.
        </h1>
        <p className="mt-3 max-w-[58ch] text-[15px] font-medium leading-relaxed text-ink-2">
          {dilemmas.length} dilemmas, four defensible options each. Every option is tagged with the stage of reasoning it
          represents — Kohlberg&rsquo;s six stages, grouped into Rest&rsquo;s three schemas — and you are rated on the pattern
          you chose, not on being right.
        </p>

        <div className="card-pop mt-5 p-4">
          <p className="mono-label mb-2 inline-flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5" /> How the rating works
          </p>
          <ul className="grid gap-2 text-[13.5px] font-medium leading-relaxed text-ink-2">
            <li>
              <b className="text-ink">Personal interest</b> — stages 2–3: cost to me, reward, and how the people around me
              will read it.
            </li>
            <li>
              <b className="text-ink">Maintaining norms</b> — stage 4: the rule, the policy, the fair procedure.
            </li>
            <li>
              <b className="text-ink">Post-conventional</b> — stages 5–6: rights, consent and principles that survive being
              inconvenient.
            </li>
            <li>
              A separate <b className="text-ink">care index</b> counts choices reasoned from relationships and
              responsiveness — Gilligan&rsquo;s voice, scored alongside rather than beneath.
            </li>
          </ul>
          <p className="mt-3 text-[12.5px] font-medium leading-relaxed text-ink-3">
            This is a training reflection, not a psychological assessment. Kohlberg&rsquo;s stage sequence is contested, and
            Rest&rsquo;s own data fit three schemas better than six stages — which is exactly how this scores you.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Button variant="accent" onClick={() => setPhase('play')}>
            Start the dilemmas →
          </Button>
          <Button variant="light" onClick={() => navigate('/')}>
            Back to home
          </Button>
        </div>
      </section>
    )
  }

  /* ---------------- result ---------------- */
  if (phase === 'result') {
    const dominant = schemas[result.dominant]
    return (
      <section className="mx-auto w-full max-w-3xl px-4 pb-12 pt-6 sm:px-6">
        <div className="card-pop overflow-hidden">
          <div className="h-1.5" style={{ background: track.colour }} />
          <div className="p-5 sm:p-7">
            <span className="chip">Your rating</span>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{result.band.title}</h1>
            <p className="mt-2 max-w-[54ch] text-sm font-medium leading-relaxed text-ink-2">{result.band.line}</p>

            <div className="mt-5 grid gap-2.5">
              {(Object.keys(schemas) as SchemaId[]).map((id) => (
                <div key={id} className="grid grid-cols-[110px_1fr_38px] items-center gap-3">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-ink-2">{schemas[id].short}</span>
                  <span className="h-2.5 overflow-hidden rounded-full border-2 border-ink bg-[#f2f0e8]">
                    <motion.span
                      initial={{ width: 0 }}
                      animate={{ width: `${result.share[id]}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="block h-full"
                      style={{ background: schemas[id].colour }}
                    />
                  </span>
                  <span className="text-right font-mono text-[10px] font-bold">{result.share[id]}%</span>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <div className="rounded-xl border-2 border-ink px-3.5 py-3" style={{ background: track.soft }}>
                <span className="block font-display text-xl font-extrabold">{result.care}</span>
                <span className="mono-label">care choices</span>
              </div>
              <div className="rounded-xl border-2 border-ink px-3.5 py-3" style={{ background: track.soft }}>
                <span className="block font-display text-xl font-extrabold">{result.total}</span>
                <span className="mono-label">dilemmas</span>
              </div>
              <div className="rounded-xl border-2 border-ink px-3.5 py-3" style={{ background: track.soft }}>
                <span className="block font-display text-xl font-extrabold">
                  {Object.entries(result.byStage).filter(([, n]) => n > 0).length}
                </span>
                <span className="mono-label">stages used</span>
              </div>
            </div>

            <div className="mt-4 rounded-xl border-2 border-ink bg-c3-soft px-4 py-3.5">
              <p className="mono-label mb-1">What to practise</p>
              <p className="text-[13.5px] font-medium leading-relaxed text-ink-2">{result.band.practice}</p>
            </div>
            <p className="mt-3 text-[12.5px] font-medium leading-relaxed text-ink-3">
              Dominant schema: {dominant.label}. {dominant.blurb} A rating here describes a preference you showed in
              {' '}{result.total} choices — not your character, and not a score to win.
            </p>
          </div>
        </div>

        <h2 className="mb-2.5 mt-6 font-display text-lg font-extrabold tracking-tight">Every dilemma, and the reasoning you chose</h2>
        <ul className="grid gap-2">
          {choices.map(({ dilemma: d, option }, i) => (
            <li key={d.id} className="rounded-xl border-2 border-ink bg-card px-3.5 py-2.5 shadow-[2px_2px_0_var(--color-ink)]">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-[13.5px] font-extrabold leading-snug">
                  {pad(i + 1)} · {d.title}
                </span>
                <span className="chip">stage {option.stage} · {schemas[schemaOf(option.stage)].short}</span>
              </div>
              <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-ink-2">
                <b className="text-ink">{option.text}</b>
                <br />
                {option.why}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <Button variant="accent" onClick={restart} className="flex-1">
            Run the dilemmas again
          </Button>
          <Button variant="light" onClick={() => navigate('/')} className="flex-1">
            Back to home
          </Button>
        </div>
      </section>
    )
  }

  /* ---------------- play ---------------- */
  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-12 pt-5 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 border-ink bg-card px-3.5 py-2 shadow-[3px_3px_0_var(--color-ink)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip" style={{ background: track.soft }}>
            <span className="h-2 w-2 rounded-full border border-ink" style={{ background: track.colour }} />
            {track.no} · Moral development
          </span>
          <span className="chip border-line bg-[#f4f2ea]">
            Dilemma <b>{pad(index + 1)} / {deck.length}</b>
          </span>
        </div>
        <span className="mono-label">no wrong answers</span>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-[#e8e5dc]">
        <div className="h-full bg-ink transition-[width] duration-500" style={{ width: `${((index + (picked ? 1 : 0)) / deck.length) * 100}%` }} />
      </div>

      <motion.div key={`${runId}-${index}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-pop mt-4 overflow-hidden">
        <div className="h-1.5" style={{ background: track.colour }} />
        <div className="p-5 sm:p-7">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="rounded-lg border-2 border-ink px-2 py-0.5 font-display text-sm font-extrabold shadow-[2px_2px_0_var(--color-ink)]" style={{ background: track.colour, color: track.ink }}>
              {index + 1}
            </span>
            <span className="mono-label">{dilemma.title}</span>
          </div>

          <p className="mb-3 max-w-[62ch] text-[15px] font-medium leading-relaxed text-ink-2">{dilemma.scenario}</p>
          <h2 className="mb-4 text-balance font-display text-xl font-extrabold leading-tight tracking-tight sm:text-2xl">{dilemma.prompt}</h2>

          <div className="grid gap-2.5">
            {dilemma.options.map((option, i) => {
              const isPicked = picked === option
              return (
                <button
                  key={option.text}
                  type="button"
                  disabled={!!picked}
                  onClick={() => choose(option)}
                  className={`grid grid-cols-[24px_1fr] items-start gap-3 rounded-xl border-2 border-ink bg-card px-3.5 py-3 text-left text-[14.5px] font-bold leading-snug shadow-[3px_3px_0_var(--color-ink)] transition-all duration-150 ${
                    !picked ? 'hover:-translate-x-px hover:-translate-y-px hover:bg-c3-soft' : isPicked ? 'bg-c1-soft' : 'opacity-45'
                  }`}
                >
                  <span className="grid h-6 w-6 place-items-center rounded-md border-2 border-ink bg-[#f4f2ea] font-mono text-[11px] font-bold">
                    {i + 1}
                  </span>
                  <span className="min-w-0 break-words">{option.text}</span>
                </button>
              )
            })}
          </div>

          {picked && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-xl border-2 border-ink bg-c3-soft px-4 py-3.5 shadow-[3px_3px_0_var(--color-ink)]">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span className="chip bg-card">stage {picked.stage}</span>
                <span className="font-display text-base font-extrabold">{stageNames[picked.stage]}</span>
                <span className="chip bg-card">{schemas[schemaOf(picked.stage)].label}</span>
                {picked.care && <span className="chip bg-card">care voice</span>}
              </div>
              <p className="max-w-[62ch] text-[13.5px] font-medium leading-relaxed text-ink-2">{picked.why}</p>
              <div className="mt-3 flex justify-end">
                <Button size="sm" onClick={advance}>
                  {index === deck.length - 1 ? 'See your rating →' : 'Next dilemma →'}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
