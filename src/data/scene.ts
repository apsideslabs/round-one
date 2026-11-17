/** The question bank behind the illustrated interview. */
export type Grade = 'weak' | 'ok' | 'strong'
export type Scene = 'wide' | 'panel' | 'board' | 'you'
export type Panel = [number, number, number]

export interface Opt {
  label: string
  fx: Panel
  grade: Grade
  heard: string
}

export interface Q {
  id: string
  round: string
  scene: Scene
  ask: string
  moods: ['neutral' | 'smile' | 'frown' | 'bored' | 'impressed' | 'sceptical', 'neutral' | 'smile' | 'frown' | 'bored' | 'impressed' | 'sceptical', 'neutral' | 'smile' | 'frown' | 'bored' | 'impressed' | 'sceptical']
  opts: Opt[]
  model: string
  why: string
}

export const QUESTIONS: Q[] = [
  {
    id: 'i1', round: 'Introduction', scene: 'wide', ask: 'Tell me about yourself.',
    moods: ['neutral', 'neutral', 'sceptical'],
    opts: [
      { label: 'Recite the CV from school onward', fx: [-2, 0, -1], grade: 'weak', heard: 'a list of institutions, in order' },
      { label: 'One line about you, then one result with a number', fx: [2, 1, 2], grade: 'strong', heard: 'who you are and one proof' },
      { label: '“I am hardworking and sincere.”', fx: [-1, 1, -1], grade: 'weak', heard: 'an adjective, not evidence' },
      { label: '“I applied because of what you build — here is the fit.”', fx: [1, 2, 2], grade: 'strong', heard: 'you did the homework' }
    ],
    model: '“Final-year CS student. I built a billing tool that a 12-person shop now uses daily — it cut their invoicing from three hours to twenty minutes. I want to do that at a larger scale, which is why I am here.”',
    why: 'One line of identity, one number of proof, one line of direction. Twenty seconds, and it opens the project you want them to ask about.'
  },
  {
    id: 'i2', round: 'Introduction', scene: 'panel', ask: 'What do you know about us?',
    moods: ['neutral', 'smile', 'neutral'],
    opts: [
      { label: '“You are a big company in IT services.”', fx: [0, -1, 0], grade: 'weak', heard: 'a sentence that fits fifty companies' },
      { label: 'Name a product, a recent deal, and where you would fit', fx: [2, 2, 2], grade: 'strong', heard: 'specifics from the pre-placement talk' },
      { label: '“I did not get time to look it up.”', fx: [-2, -1, -1], grade: 'weak', heard: 'not interested' },
      { label: 'Repeat the pre-placement talk almost word for word', fx: [0, 0, -1], grade: 'ok', heard: 'attention, but no thinking' }
    ],
    model: '“You run the payments platform most of the campus already uses — the one the pre-placement talk walked through. I have built against your sandbox API, and the gap I want to close is scale testing.”',
    why: 'The pre-placement talk is the cheat sheet, but repeating it back is not the same as having a view. One product, one detail, one link to your own work.'
  },
  {
    id: 'i3', round: 'Introduction', scene: 'wide', ask: 'Why should we take you and not the person outside?',
    moods: ['neutral', 'neutral', 'sceptical'],
    opts: [
      { label: '“I am the best in my class.”', fx: [0, -1, -1], grade: 'weak', heard: 'a claim with nothing behind it' },
      { label: 'One thing you can do that most cannot, with the proof', fx: [2, 1, 2], grade: 'strong', heard: 'a differentiator, evidenced' },
      { label: '“I really need this job.”', fx: [-1, -1, -1], grade: 'weak', heard: 'need, not value' },
      { label: '“I will work harder than anyone.”', fx: [0, 0, -1], grade: 'ok', heard: 'effort promised, not shown' }
    ],
    model: '“Most people on that bench can code. I have shipped to real users and handled the support calls that came with it — so I will not need to be taught why a bug at 2 a.m. matters.”',
    why: 'Differentiation is not superiority. Name the specific experience that most of the queue does not have.'
  },
  {
    id: 'p1', round: 'Project', scene: 'panel', ask: 'Walk me through this project.',
    moods: ['neutral', 'smile', 'neutral'],
    opts: [
      { label: 'Describe what it does, no numbers', fx: [0, 0, -1], grade: 'ok', heard: 'features, no outcome' },
      { label: 'Problem, what you built, the measured result', fx: [2, 1, 2], grade: 'strong', heard: 'a result you can defend' },
      { label: '“It was a team project, I did my part.”', fx: [-1, 0, -1], grade: 'weak', heard: 'you will disappear in a team' },
      { label: '“Can I draw the architecture?” — walk to the board', fx: [2, 1, 1], grade: 'strong', heard: 'you can explain structure' }
    ],
    model: '“The shop was invoicing on paper. I built a Flask app with a Postgres backend; invoicing went from three hours to twenty minutes a day. The hard part was GST rounding, which I fixed by storing paise as integers.”',
    why: 'Problem, build, number, then the one technical detail that proves you were inside it.'
  },
  {
    id: 'p2', round: 'Project', scene: 'board', ask: 'What was the hardest bug you hit?',
    moods: ['neutral', 'neutral', 'sceptical'],
    opts: [
      { label: '“There were no real bugs, it worked first time.”', fx: [-2, -1, -2], grade: 'weak', heard: 'either a toy or a story' },
      { label: 'Symptom, what you thought, how you found it, the fix', fx: [2, 2, 2], grade: 'strong', heard: 'a debugging method' },
      { label: '“The server kept crashing, I restarted it.”', fx: [-1, 0, -1], grade: 'weak', heard: 'no diagnosis' },
      { label: 'Blame the library and move on', fx: [-2, -1, -1], grade: 'weak', heard: 'not your problem, not your fix' }
    ],
    model: '“Payments would fail once in fifty attempts. I added logging and saw duplicate IDs — a race in the retry logic. I made the idempotency key client-side and the failures stopped.”',
    why: 'They are testing method, not cleverness: symptom, hypothesis, instrument, fix.'
  },
  {
    id: 'p3', round: 'Project', scene: 'panel', ask: 'What would you do differently if you rebuilt it?',
    moods: ['neutral', 'smile', 'neutral'],
    opts: [
      { label: '“Nothing, it works fine.”', fx: [-1, 0, -2], grade: 'weak', heard: 'no reflection' },
      { label: 'One concrete change, and what it would save', fx: [2, 2, 2], grade: 'strong', heard: 'you can critique your own work' },
      { label: '“I would use a better framework.”', fx: [0, 0, -1], grade: 'ok', heard: 'a preference, not a reason' },
      { label: '“I would add more features.”', fx: [0, 0, -1], grade: 'ok', heard: 'scope, not learning' }
    ],
    model: '“I would put the GST rules behind a test suite first. Half my late nights were re-checking rounding by hand, and that is a test, not a person.”',
    why: 'This question measures whether you can see your own work clearly. One specific change with a number attached.'
  },
  {
    id: 't1', round: 'Technical', scene: 'board', ask: 'How does a hash map actually work?',
    moods: ['neutral', 'neutral', 'neutral'],
    opts: [
      { label: '“I use the library, I don’t know the internals.”', fx: [-2, 1, 0], grade: 'weak', heard: 'honest, but no depth' },
      { label: 'Buckets, collisions, and the edge you are unsure of', fx: [2, 2, 2], grade: 'strong', heard: 'you know the mechanism and its limits' },
      { label: 'Bluff confidently with the wrong terms', fx: [-2, -2, -2], grade: 'weak', heard: 'a bluff they can hear' },
      { label: '“Give me a second to think aloud.” Then reason it out', fx: [1, 1, 2], grade: 'strong', heard: 'you can think under observation' }
    ],
    model: '“A hash function turns the key into an index into an array of buckets. Collisions go in a list or a tree; Java switches to a red-black tree past eight. Load factor 0.75 triggers a resize, which is why inserts are amortised O(1).”',
    why: 'Mechanism, collision handling, resize — then name one thing you are unsure about. Admitting an edge is stronger than inventing one.'
  },
  {
    id: 't2', round: 'Technical', scene: 'board', ask: 'Reverse a linked list. Talk while you write.',
    moods: ['neutral', 'neutral', 'neutral'],
    opts: [
      { label: 'Stay silent until you have the full solution', fx: [0, -1, -1], grade: 'ok', heard: 'nothing to evaluate until the end' },
      { label: 'Three pointers, say the invariant out loud, then code', fx: [2, 2, 2], grade: 'strong', heard: 'a plan you can defend' },
      { label: 'Write from memory without checking edge cases', fx: [-1, -1, -2], grade: 'weak', heard: 'memorised, not understood' },
      { label: 'Ask what happens with an empty list before starting', fx: [1, 2, 2], grade: 'strong', heard: 'you check boundaries first' }
    ],
    model: '“Prev, curr, next. Invariant: everything left of curr is reversed. I will run it on a two-node list and an empty list before I say done.”',
    why: 'They score the running commentary. Silence is unscoreable; an invariant plus edge cases is a hire signal.'
  },
  {
    id: 't3', round: 'Technical', scene: 'board', ask: 'SQL or NoSQL for a payments ledger — which, and why?',
    moods: ['neutral', 'neutral', 'sceptical'],
    opts: [
      { label: '“NoSQL, it is faster.”', fx: [-1, 0, -1], grade: 'weak', heard: 'a slogan' },
      { label: 'Pick one, name the guarantee you need, name the cost', fx: [2, 2, 2], grade: 'strong', heard: 'trade-offs, not tribes' },
      { label: '“Whichever the team uses.”', fx: [0, 0, -1], grade: 'weak', heard: 'no opinion' },
      { label: '“SQL, because ACID.”', fx: [1, 1, 1], grade: 'ok', heard: 'right word, no reasoning' }
    ],
    model: '“SQL. A ledger needs multi-row atomicity — debit and credit either both land or neither does. NoSQL can do it, but I would be reimplementing transactions in application code.”',
    why: 'Name the guarantee, then the cost of not having it. The acronym alone is a coin flip.'
  },
  {
    id: 't4', round: 'Technical', scene: 'panel', ask: 'Your API is slow in production. What do you check first?',
    moods: ['neutral', 'smile', 'neutral'],
    opts: [
      { label: '“Add more servers.”', fx: [-1, 0, -1], grade: 'weak', heard: 'buying your way out' },
      { label: 'Measure first: where the time actually goes', fx: [2, 2, 2], grade: 'strong', heard: 'you instrument before guessing' },
      { label: '“Optimise the database queries.”', fx: [1, 0, 0], grade: 'ok', heard: 'a guess, sometimes right' },
      { label: '“Rewrite it in a faster language.”', fx: [-2, -1, -2], grade: 'weak', heard: 'expensive guess' }
    ],
    model: '“Traces before theories. Is it one endpoint or all? p50 or p99? If p99 only, I would look at lock contention or a slow dependency before touching the database.”',
    why: 'The answer they want is a measurement plan, not a fix. Guessing first is the failure mode.'
  },
  {
    id: 'b1', round: 'Behavioural', scene: 'panel', ask: 'Tell me about a time you failed.',
    moods: ['sceptical', 'neutral', 'neutral'],
    opts: [
      { label: '“I have never really failed.”', fx: [-1, -1, -1], grade: 'weak', heard: 'no self-awareness' },
      { label: 'Explain how a teammate caused it', fx: [-2, -2, -2], grade: 'weak', heard: 'blame' },
      { label: 'Own it, and what changed in how you work', fx: [2, 2, 2], grade: 'strong', heard: 'accountability and a fix' },
      { label: 'A vague answer about “time management”', fx: [0, 0, -1], grade: 'ok', heard: 'a rehearsed non-answer' }
    ],
    model: '“I promised a client demo in a week and shipped a broken build the night before. I had skipped staging. Now nothing reaches a client without a staging run, even when it costs a day.”',
    why: 'The failure should cost something real, and the change should still be visible in how you work today.'
  },
  {
    id: 'b2', round: 'Behavioural', scene: 'panel', ask: 'A teammate is not doing their share. What did you do?',
    moods: ['neutral', 'neutral', 'sceptical'],
    opts: [
      { label: '“I did their work quietly.”', fx: [0, 0, -1], grade: 'ok', heard: 'you absorb problems instead of solving them' },
      { label: '“I reported them to the professor.”', fx: [-1, -1, 0], grade: 'weak', heard: 'escalation before conversation' },
      { label: 'Talked to them first, then agreed a written split', fx: [2, 2, 2], grade: 'strong', heard: 'you handle people directly' },
      { label: '“I stopped talking to them.”', fx: [-2, -2, -2], grade: 'weak', heard: 'avoidance' }
    ],
    model: '“I asked what was going on before assuming. Turned out they were stuck, not lazy. We split the work again in writing and shipped on time.”',
    why: 'One conversation before escalation, and a concrete mechanism afterwards. That is what "teamwork" means to them.'
  },
  {
    id: 'b3', round: 'Behavioural', scene: 'wide', ask: 'Tell me about a time you disagreed with a senior.',
    moods: ['neutral', 'neutral', 'sceptical'],
    opts: [
      { label: '“I never disagree with seniors.”', fx: [-1, -1, -1], grade: 'weak', heard: 'no judgement of your own' },
      { label: 'How you raised it, what happened, what you accepted', fx: [2, 2, 2], grade: 'strong', heard: 'you can push back without breaking things' },
      { label: '“I argued until they agreed.”', fx: [0, -1, -2], grade: 'weak', heard: 'winning over working' },
      { label: '“I did it my way anyway.”', fx: [-2, -2, -2], grade: 'weak', heard: 'insubordination' }
    ],
    model: '“My lead wanted to skip tests to hit a date. I asked for two hours to write the three tests around the payment path. We shipped on time, and those tests caught a bug the next week.”',
    why: 'Disagreement is scored on method: bring evidence, accept the decision, do not sabotage it.'
  },
  {
    id: 'h1', round: 'HR', scene: 'wide', ask: 'Why this company, and not the one next door?',
    moods: ['neutral', 'smile', 'neutral'],
    opts: [
      { label: '“Good growth, good culture.”', fx: [0, -1, 0], grade: 'weak', heard: 'could be any company' },
      { label: 'Name their product, and the gap in your own skills', fx: [2, 2, 2], grade: 'strong', heard: 'a specific reason' },
      { label: '“Any company is fine, I just need a job.”', fx: [-2, -2, -2], grade: 'weak', heard: 'flight risk' },
      { label: '“You are the biggest, so the safest.”', fx: [0, -2, -1], grade: 'weak', heard: 'safety, not interest' }
    ],
    model: '“You ship the payments stack I already build against, and I am weak at scale testing. That is the gap I want to close with people who do it daily.”',
    why: 'A reason that cannot be copy-pasted to the next company is the only kind that counts.'
  },
  {
    id: 'h2', round: 'HR', scene: 'panel', ask: 'Any posting, any shift, anywhere in India?',
    moods: ['neutral', 'neutral', 'sceptical'],
    opts: [
      { label: '“Only if it is my home city.”', fx: [-1, -2, -1], grade: 'weak', heard: 'a constraint they cannot staff around' },
      { label: '“Yes — and here is what I have already done to be ready.”', fx: [1, 2, 2], grade: 'strong', heard: 'mobility, with evidence' },
      { label: '“I will decide if I get the offer.”', fx: [0, -1, 0], grade: 'weak', heard: 'a maybe they will not risk' },
      { label: '“Whatever, as long as the salary is high.”', fx: [-1, -2, -1], grade: 'weak', heard: 'you will leave for ₹2,000' }
    ],
    model: '“Yes. I have lived away from home for my internship and managed my own rent and commute, so a new city is not a first for me.”',
    why: 'This is a retention question wearing a logistics costume. Answer the fear behind it.'
  },
  {
    id: 'h3', round: 'HR', scene: 'wide', ask: 'What is your expected salary?',
    moods: ['neutral', 'neutral', 'sceptical'],
    opts: [
      { label: '“Whatever the company policy is.”', fx: [0, -1, 0], grade: 'ok', heard: 'no research' },
      { label: 'A researched range for this role and city, tied to your value', fx: [1, 2, 2], grade: 'strong', heard: 'you did the homework' },
      { label: 'A number twice the band, confidently', fx: [-1, -2, -1], grade: 'weak', heard: 'you do not know the market' },
      { label: '“I cannot say, you decide.”', fx: [-1, -1, -1], grade: 'weak', heard: 'unprepared' }
    ],
    model: '“For a fresher role in this city the band is usually six to seven lakh fixed. Given my internship in payments, I would be looking at the upper half — and I am open to structure.”',
    why: 'A range with a source beats both a demand and a shrug. Say fixed, not CTC.'
  },
  {
    id: 'h4', round: 'HR', scene: 'panel', ask: 'Do you have other offers? Will you join if we make one?',
    moods: ['neutral', 'smile', 'neutral'],
    opts: [
      { label: '“No offers at all.”', fx: [-1, -1, -1], grade: 'weak', heard: 'low demand' },
      { label: 'Honest status, plus why this one is first choice', fx: [1, 2, 2], grade: 'strong', heard: 'wanted, and wanting you' },
      { label: '“Yes, three, all better than this.”', fx: [-1, -2, -2], grade: 'weak', heard: 'leverage play they will not reward' },
      { label: '“I will definitely join.” — without any reason', fx: [0, 0, -1], grade: 'ok', heard: 'a promise with nothing behind it' }
    ],
    model: '“One process is at final stage elsewhere. You are my first choice because of the payments work — if the offer comes, I will take it and withdraw the other.”',
    why: 'They are managing yield. Honest scarcity plus a specific reason is what makes an offer safe to give.'
  },
  {
    id: 'y1', round: 'Your turn', scene: 'wide', ask: 'Any questions for us?',
    moods: ['smile', 'smile', 'neutral'],
    opts: [
      { label: '“No, I think I’m good.”', fx: [-1, -1, -1], grade: 'weak', heard: 'not curious' },
      { label: '“What does success look like in the first six months?”', fx: [2, 2, 2], grade: 'strong', heard: 'you think about doing the job' },
      { label: 'Ask about salary and leave first', fx: [0, -1, 0], grade: 'weak', heard: 'what you get, not what you give' },
      { label: 'Ask something the PPT already answered', fx: [-1, 0, -1], grade: 'weak', heard: 'you were not listening' }
    ],
    model: '“What separates someone who does well in the first six months here from someone who struggles? And what would you want me to have learnt by month three?”',
    why: 'The best closing question is about their expectations of you, not your benefits.'
  },
  {
    id: 'y2', round: 'Your turn', scene: 'panel', ask: 'Anything you want to add before we finish?',
    moods: ['neutral', 'neutral', 'neutral'],
    opts: [
      { label: '“No, thank you.”', fx: [0, 0, -1], grade: 'ok', heard: 'a polite exit' },
      { label: 'One thing you did not get to say, in two sentences', fx: [2, 1, 2], grade: 'strong', heard: 'a deliberate close' },
      { label: 'Repeat your whole introduction', fx: [-1, -1, -1], grade: 'weak', heard: 'no judgement about what matters' },
      { label: 'Ask whether you got selected', fx: [-2, -1, -1], grade: 'weak', heard: 'pressure, not poise' }
    ],
    model: '“One thing — the project I mentioned is open source and has eleven users outside my college. I would like to keep working on it here.”',
    why: 'The last word is a free slot. Use it for the one fact you would regret leaving out.'
  }
]

/** Two questions from each round, so a run is ten questions and never the same twice. */
export function drawQuestions() {
  const byRound = new Map<string, Q[]>()
  for (const q of QUESTIONS) {
    const list = byRound.get(q.round) ?? []
    list.push(q)
    byRound.set(q.round, list)
  }
  const picked: Q[] = []
  for (const list of byRound.values()) {
    const shuffled = [...list].sort(() => Math.random() - 0.5)
    picked.push(...shuffled.slice(0, 2))
  }
  return picked
}
