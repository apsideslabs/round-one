import type { PanelQuestion } from './types'

export const interview: PanelQuestion[] = [
  {
    id: 'p01', tag: 'Opener', question: 'Tell me about yourself.',
    skeleton: ['Open with what you are right now — course or role, one line of focus.', 'Give one proof point with a number: a project, a metric, a result.', 'Close with why this role, in a single sentence.', 'Keep it under 90 seconds when spoken.'],
    checks: ['I named a specific proof point instead of adjectives', 'I used at least one number', 'I connected the answer to this role', 'I kept it under roughly 120 words'],
    model: '“I’m a final-year CS student focused on backend systems. Last summer I rebuilt a checkout service that cut failed payments by 18% in six weeks. I want to do that kind of work at scale, which is why this platform role is the one I’m after.”'
  },
  {
    id: 'p02', tag: 'Motivation', question: 'Why this company, and not the one next door?',
    skeleton: ['Name something specific: a product, a market, a way of working.', 'Connect it to a skill you can actually prove.', 'Say what you would want to work on first.'],
    checks: ['I named something specific about them, not “good culture”', 'I linked it to a skill of mine', 'I said what I would want to work on', 'Nothing in my answer would fit any other company unchanged'],
    model: '“You ship to tier-3 cities first, which means latency and offline behaviour matter more than polish. I spent a term making an offline-first inventory app for a co-operative, so that constraint is familiar ground. I’d want to start on the sync layer.”'
  },
  {
    id: 'p03', tag: 'Motivation', question: 'Why this role, and why now?',
    skeleton: ['Say what the role contains that you want to get better at.', 'Name the gap in your current experience honestly.', 'Tie the timing to something concrete — graduation, a project ending.'],
    checks: ['I described the work, not the title', 'I admitted what I have not done yet', 'I gave a concrete reason for the timing', 'I did not say “it’s a great opportunity”'],
    model: '“The role owns a service end to end, including on-call. I’ve built features but never carried a pager, and that’s the gap I want closed. My degree finishes in May, so the timing lines up with the team’s next hiring cycle.”'
  },
  {
    id: 'p04', tag: 'Behavioural · STAR', question: 'Tell me about a time you handled a conflict in a team.',
    skeleton: ['Situation — one sentence of context.', 'Task — what you specifically owned.', 'Action — what you did, in the first person, not “we”.', 'Result — the outcome, with a number if one exists.'],
    checks: ['I set the situation up in one sentence', 'I described what I did, in first person', 'I gave a concrete result', 'I described the problem without blaming a person'],
    model: '“Two of us disagreed on the database for a college fest app: he wanted Postgres, I wanted Mongo. I wrote a one-page comparison against our actual load — 400 concurrent check-ins — and we picked Postgres. Check-in failures dropped from 12% in the pilot to under 1% on the day.”'
  },
  {
    id: 'p05', tag: 'Behavioural · STAR', question: 'Describe a failure and what you learned from it.',
    skeleton: ['Pick a real failure with a real cost — not a humblebrag.', 'Own the decision you got wrong, in one line.', 'State the change you made afterwards.', 'Show the change holding in a later example.'],
    checks: ['The failure had an actual cost', 'I said what I got wrong, not what others did', 'I named a specific change I made', 'I gave evidence the change stuck'],
    model: '“I shipped a migration without a rollback plan and we lost four hours of writes. That was my call. I now write the rollback first, and I’ve since run three migrations where the rollback was used once and took ninety seconds.”'
  },
  {
    id: 'p06', tag: 'Behavioural · STAR', question: 'Tell me about a time you led without authority.',
    skeleton: ['Name the situation where you had no formal power.', 'Say how you got buy-in: a shared problem, a prototype, a number.', 'Describe what you personally did.', 'Give the result and what it changed.'],
    checks: ['I had no formal authority in the story', 'I explained how I got others to follow', 'I described my own actions, not the team’s', 'I gave a measurable outcome'],
    model: '“Our placement cell had no tooling and I wasn’t on the committee. I built a tracker over a weekend for my own batch, showed it to two coordinators, and by the next drive all four branches were using it — 1,100 students instead of 240.”'
  },
  {
    id: 'p07', tag: 'Behavioural · STAR', question: 'Tell me about a deadline you nearly missed, and what you did.',
    skeleton: ['Set the deadline and why it mattered.', 'Say what slipped, and how you noticed early.', 'Describe the trade you made — scope, people, or sequence.', 'State the outcome and the cost.'],
    checks: ['The deadline mattered to someone else', 'I noticed the slip early rather than late', 'I named a real trade-off, not “we worked harder”', 'I was honest about what was cut'],
    model: '“A client demo was fixed for Friday and the reporting module was two days behind. On Wednesday I cut the export feature, moved one engineer onto the summary view, and told the client what they would not see. We demoed on time; the export shipped the following week.”'
  },
  {
    id: 'p08', tag: 'Self-awareness', question: 'What is your weakness, and what are you doing about it?',
    skeleton: ['Choose a real weakness that is not fatal to this role.', 'Give one example where it showed up.', 'Describe the system you built to contain it.', 'Note the progress, without claiming it is fixed.'],
    checks: ['The weakness was real, not “I work too hard”', 'I gave an example of it costing me something', 'I described a concrete countermeasure', 'I did not claim to have cured it'],
    model: '“I over-prepare and then under-rehearse saying it out loud, so my first explanation of anything is muddled. Last review my manager flagged it. I now do a two-minute spoken run-through before every demo — it’s better, not solved.”'
  },
  {
    id: 'p09', tag: 'Self-awareness', question: 'What do people get wrong about you?',
    skeleton: ['Name the misreading in one line.', 'Explain what causes it — quietness, pace, directness.', 'Show the correction with an example.', 'Say what you do about it now.'],
    checks: ['I named a specific misreading', 'I explained the cause rather than blaming the reader', 'I gave an example that corrects it', 'I described a habit, not a personality claim'],
    model: '“People read my quietness in meetings as disagreement. It’s usually processing. I now say “thinking” out loud so silence doesn’t get interpreted, and I follow up in writing within the hour.”'
  },
  {
    id: 'p10', tag: 'Judgement', question: 'How do you handle ambiguity when the brief is unclear?',
    skeleton: ['Say what you do first: write down what you think is being asked.', 'Name who you check it with, and how fast.', 'Describe the smallest thing you can build to test it.', 'Say how you keep the decision visible.'],
    checks: ['I described a concrete first action', 'I named a person or channel I check with', 'I described a small test rather than a big plan', 'I said how I record the decision'],
    model: '“I write a half-page: what I think we’re solving, what I’m assuming, what would prove me wrong. I send it to the requester the same day and build the smallest version that tests the biggest assumption. The assumptions live in the ticket, so a later disagreement has a reference.”'
  },
  {
    id: 'p11', tag: 'Judgement', question: 'Tell me about a time you disagreed with your manager.',
    skeleton: ['State the disagreement in one line.', 'Show you understood their reasoning.', 'Say what you did — data, a prototype, a question.', 'Give the outcome, including if you were wrong.'],
    checks: ['I stated the disagreement without heat', 'I represented their position fairly', 'I brought evidence or a test, not just an opinion', 'I said what happened, even if I lost'],
    model: '“My manager wanted to ship a feature to all users at once. I argued for a 5% rollout. He said the risk was acceptable and the deadline was real. We compromised on 20% for two days — which caught a crash on one Android version. He changed the default after that.”'
  },
  {
    id: 'p12', tag: 'Judgement', question: 'How do you prioritise when everything is urgent?',
    skeleton: ['Name the frame you use — impact, reversibility, who is blocked.', 'Show it applied to a real week.', 'Say what you dropped and who you told.', 'Describe how you communicate the queue.'],
    checks: ['I named an explicit rule, not “I stay calm”', 'I applied it to a specific situation', 'I said what I deprioritised', 'I described how I told people'],
    model: '“I sort by who is blocked and whether the decision is reversible. Last month that meant fixing a broken deploy for two hours while a feature slipped a day. I posted the queue in the channel so nobody had to ask twice.”'
  },
  {
    id: 'p13', tag: 'Teamwork', question: 'How do you give feedback to a peer?',
    skeleton: ['Say when you give it: close to the event, in private.', 'Name the behaviour, not the character.', 'Give the impact you saw.', 'Say what you asked for.'],
    checks: ['I described a private, specific setting', 'I named behaviour, not personality', 'I described the impact', 'I ended with a request, not a verdict'],
    model: '“I do it within a day, in private, and I stick to what I saw: ‘the review comments landed after merge twice this week, which meant rework.’ Then a request: ‘can we agree the review happens before the branch is cut?’”'
  },
  {
    id: 'p14', tag: 'Teamwork', question: 'What do you do when a teammate is not delivering?',
    skeleton: ['Ask before assuming — check the cause first.', 'Say what you noticed, without accusation.', 'Offer a concrete unblock.', 'Escalate only after a named point.'],
    checks: ['I checked the cause before judging', 'I described the conversation without blame', 'I offered something specific', 'I said when escalation is fair'],
    model: '“I ask first. Last time the answer was a family emergency, and the fix was to split the ticket. If it were capacity rather than circumstance, I’d say what’s slipping and by when, and agree a checkpoint before it becomes a surprise.”'
  },
  {
    id: 'p15', tag: 'Closing', question: 'Where do you see yourself in five years?',
    skeleton: ['Name a capability, not a title.', 'Tie it to the work this role actually does.', 'Say what you want to be trusted with.', 'Avoid promises you cannot keep.'],
    checks: ['I named a capability, not just a job title', 'It connected to this team’s work', 'I said what I want to own', 'I did not claim a title I cannot earn'],
    model: '“I want to be the person a team trusts with the ambiguous system — the one that touches billing or permissions. In five years that means owning one end to end and having mentored two people through their first on-call.”'
  },
  {
    id: 'p16', tag: 'Closing', question: 'Why should we hire you?',
    skeleton: ['Pick the one thing you do better than the average candidate.', 'Prove it with a result.', 'Say what it is worth to this team specifically.', 'Stop. Do not list three more.'],
    checks: ['I led with one differentiator, not five', 'I proved it with evidence', 'I connected it to their problem', 'I stopped after the proof'],
    model: '“Because I ship things that hold under real load. My fest app ran 4,000 check-ins in an hour without a failure, and I documented the load test so the next person could repeat it. You’re scaling a service that has never had that test.”'
  },
  {
    id: 'p17', tag: 'Negotiation', question: 'What are your salary expectations?',
    skeleton: ['Name a researched range for this role and city, not a single number.', 'Anchor on the market, not on your current package alone.', 'Say what else you weigh: learning, role scope, location.', 'Keep the door open without naming a figure you cannot defend.'],
    checks: ['I gave a range, not one number', 'The range was justified by something external', 'I said it was open to discussion', 'I did not undersell with a number I would resent'],
    model: '“For this role in Bengaluru I’m seeing ₹12–15 LPA, so that’s my range. I care more about owning the service than the last lakh, and I’m open to how the whole package is structured.”'
  },
  {
    id: 'p18', tag: 'Closing', question: 'What questions do you have for us?',
    skeleton: ['Ask about the work, not the perks.', 'Ask something only this team could answer.', 'Ask what success looks like in ninety days.', 'Close by restating your interest.'],
    checks: ['My question could not be answered by a website', 'I asked about the work itself', 'I asked how success is measured', 'I closed with a clear next step'],
    model: '“What does the first ninety days look like for whoever takes this role, and what would make you say it went well? Also — what is the one thing about this codebase that surprises every new joiner?”'
  }
]
