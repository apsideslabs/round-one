import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { guides } from '@/data/guides'

export default function GuideDetail() {
  const { slug } = useParams()
  const guide = guides.find((g) => g.slug === slug)

  if (!guide) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-extrabold">That guide does not exist.</h1>
        <Link to="/guides" className="mt-3 inline-block underline">
          Back to all guides
        </Link>
      </div>
    )
  }

  return (
    <article className="mx-auto w-full max-w-2xl px-4 pb-28 pt-6 sm:px-6">
      <Link to="/guides" className="mono-label inline-flex items-center gap-1.5 hover:text-ink">
        <ArrowLeft className="h-3.5 w-3.5" /> All guides
      </Link>

      <header className="mt-4">
        <span className="chip">{guide.kicker}</span>
        <h1 className="mt-3 text-balance font-display text-3xl font-extrabold leading-tight tracking-tighter sm:text-4xl">
          {guide.title}
        </h1>
        <p className="mt-2 text-[15px] font-medium leading-relaxed text-ink-2">{guide.summary}</p>
        <p className="mono-label mt-3">{guide.minutes} min read</p>
      </header>

      <div className="mt-7 grid gap-6">
        {guide.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-2 font-display text-xl font-extrabold tracking-tight">{section.heading}</h2>
            {section.body.map((para) => (
              <p key={para.slice(0, 24)} className="mb-2.5 text-[15px] font-medium leading-relaxed text-ink-2">
                {para}
              </p>
            ))}
            {section.example && (
              <div className="mt-3 rounded-xl border-2 border-ink bg-c3-soft px-4 py-3.5 shadow-[3px_3px_0_var(--color-ink)]">
                <p className="mono-label mb-1">Worked example</p>
                <p className="font-display text-base font-extrabold leading-snug">{section.example.q}</p>
                <p className="mt-1.5 text-[13.5px] font-medium leading-relaxed text-ink-2">
                  <b className="text-ink">Answer: {section.example.answer}.</b> {section.example.why}
                </p>
              </div>
            )}
          </section>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2.5">
        <Link to="/logic" className="btn-pop flex-1">
          Practise this now
        </Link>
        <Link to="/guides" className="btn-pop flex-1 bg-card text-ink">
          Another guide
        </Link>
      </div>
    </article>
  )
}
