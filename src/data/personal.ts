import type { Q } from './scene'
import { skillsForProject, unusedSkills, type CVIntel } from '@/lib/cvintel'

const short = (s: string, n = 84) => (s.length > n ? `${s.slice(0, n).trim()}…` : s)

/** Questions built by quoting the candidate's own CV back at them. */
export function buildPersonalQuestions(intel: CVIntel): Q[] {
  const out: Q[] = []
  const push = (q: Q) => out.push(q)

  // 1. a project, named
  const project = intel.projects[0]
  if (project) {
    const tech = skillsForProject(intel, project)
    push({
      id: 'p-proj', round: 'Your CV', scene: 'panel',
      ask: `“${short(project, 46)}” — what was the hardest part?`,
      moods: ['neutral', 'smile', 'neutral'],
      opts: [
        { label: '“Getting the team together.”', fx: [0, 0, -1], grade: 'weak', heard: 'management, no engineering' },
        { label: 'Name the specific technical wall and how you got past it', fx: [2, 2, 2], grade: 'strong', heard: 'a real problem you owned' },
        { label: '“The deadline.”', fx: [-1, 0, -1], grade: 'weak', heard: 'pressure, not craft' },
        { label: 'Describe the whole project again from the start', fx: [-1, -1, -1], grade: 'weak', heard: 'you did not answer the question' }
      ],
      model: tech.length
        ? `“${tech[0]} was fine; the wall was ${tech[1] ?? 'state consistency'}. I reproduced it in a two-line case, found the ordering bug, and fixed it at the source rather than patching the symptom.”`
        : '“The data model. I had modelled it flat, and the second feature forced a redesign — I rebuilt it with the relationship in the centre, which cost two days but saved the third feature.”',
      why: 'They asked for one hard part. Give one wall, one method, one result — not a summary of the project.'
    })
  }

  // 2. a number, questioned
  if (intel.metrics.length) {
    const metric = intel.metrics[0]
    push({
      id: 'p-metric', round: 'Your CV', scene: 'board',
      ask: `Your CV says “${metric}”. How did you measure that?`,
      moods: ['neutral', 'neutral', 'sceptical'],
      opts: [
        { label: '“I estimated it.”', fx: [-1, -1, -1], grade: 'weak', heard: 'the number is decoration' },
        { label: 'The baseline, the instrument, and who else saw it', fx: [2, 2, 2], grade: 'strong', heard: 'a number you can defend' },
        { label: '“It is roughly right.”', fx: [-2, -1, -1], grade: 'weak', heard: 'soft claim' },
        { label: 'Explain what the number means for the user', fx: [1, 1, 2], grade: 'ok', heard: 'impact, but not method' }
      ],
      model: `“I timed the old process myself for a week — ${metric} was the average across five runs. I logged timestamps in the app, so it was not self-reported.”`,
      why: 'Every number on a CV invites this question. Have the baseline and the instrument ready, or remove the number.'
    })
  } else {
    push({
      id: 'p-nometric', round: 'Your CV', scene: 'panel',
      ask: 'Not one line on this CV has a number in it. Give me one.',
      moods: ['sceptical', 'neutral', 'neutral'],
      opts: [
        { label: '“I do not really measure things.”', fx: [-2, -1, -1], grade: 'weak', heard: 'no outcome thinking' },
        { label: 'Give a real figure, even a small one, with its source', fx: [2, 2, 2], grade: 'strong', heard: 'you can quantify your own work' },
        { label: '“It is hard to measure college projects.”', fx: [-1, -1, -1], grade: 'weak', heard: 'excuse' },
        { label: 'Describe the size of the thing instead — users, records, lines', fx: [1, 2, 1], grade: 'ok', heard: 'scale, if not impact' }
      ],
      model: '“My timetable tool is used by about 300 students in three departments — I can see that from the login table. The number I care about is how many still use it after week two.”',
      why: 'No number is a choice, and it reads as unmeasured work. Size, users or time saved — pick one and be able to source it.'
    })
  }

  // 3. a bullet, quoted
  const bullet = intel.bullets.find((b) => b.split(' ').length > 6 && !b.toLowerCase().includes('cgpa'))
  if (bullet) {
    push({
      id: 'p-bullet', round: 'Your CV', scene: 'panel',
      ask: `“${short(bullet)}” — what did you personally do?`,
      moods: ['neutral', 'neutral', 'sceptical'],
      opts: [
        { label: '“That was mostly a team effort.”', fx: [-2, -1, -1], grade: 'weak', heard: 'unscoreable' },
        { label: 'Your files, your decisions, your bugs', fx: [2, 2, 2], grade: 'strong', heard: 'ownership you can defend' },
        { label: '“I coordinated it.”', fx: [0, 1, -1], grade: 'weak', heard: 'process, not engineering' },
        { label: 'Re-read the line back to them', fx: [-1, -1, -2], grade: 'weak', heard: 'nothing new' }
      ],
      model: '“I wrote the module that line is about — the parser and the tests around it. My teammate did the UI. The bug that cost us a day was mine: I assumed sorted input.”',
      why: 'They are separating your work from the team\'s. Name the part that would break if you had not done it.'
    })
  }

  // 4. a skill with no evidence
  const unused = unusedSkills(intel)
  if (unused.length) {
    const skill = unused[0]
    push({
      id: 'p-unused', round: 'Your CV', scene: 'board',
      ask: `You list ${skill}, but nothing here shows you using it. Where did you?`,
      moods: ['neutral', 'neutral', 'sceptical'],
      opts: [
        { label: '“I did a course on it.”', fx: [-1, 0, -1], grade: 'weak', heard: 'exposure, not use' },
        { label: 'Name the place you used it, even a small script', fx: [2, 2, 2], grade: 'strong', heard: 'the keyword has a story' },
        { label: '“I know the basics well.”', fx: [-2, -1, -1], grade: 'weak', heard: 'tutorial knowledge' },
        { label: 'Say honestly it is coursework and what you would build with it', fx: [1, 1, 1], grade: 'ok', heard: 'honest, if thin' }
      ],
      model: `“${skill} is coursework, honestly. The nearest real use is a script I wrote to clean our lab's dataset — 4,000 rows, and it saved an afternoon of manual work.”`,
      why: 'A keyword with no story is a liability. Either attach one small real use, or say plainly what it is.'
    })
  }

  // 5. leadership verb
  const verb = intel.verbs.find((v) => ['led', 'managed', 'mentored'].includes(v))
  if (verb) {
    push({
      id: 'p-verb', round: 'Your CV', scene: 'panel',
      ask: `You say you ${verb}. Who disagreed with you, and what happened?`,
      moods: ['neutral', 'smile', 'sceptical'],
      opts: [
        { label: '“Nobody disagreed.”', fx: [-2, -1, -1], grade: 'weak', heard: 'either not true or not leading' },
        { label: 'The disagreement, how you decided, what you would change', fx: [2, 2, 2], grade: 'strong', heard: 'real leadership under friction' },
        { label: '“I made the final call.”', fx: [-1, 0, -1], grade: 'weak', heard: 'authority, not leadership' },
        { label: 'Describe how you split the work to avoid conflict', fx: [1, 1, 1], grade: 'ok', heard: 'process, but no friction faced' }
      ],
      model: '“Two of the four wanted a different stack. I asked each to prototype for a day, and we picked on the benchmark rather than on opinion. It cost a day and saved an argument.”',
      why: 'The word "led" is tested with friction. A leader with no disagreement in their story has not led anything.'
    })
  }

  // 6. internship or gap
  push({
    id: 'p-exp', round: 'Your CV', scene: 'wide',
    ask: intel.hasInternship
      ? `What did you own at ${intel.companies[0] ?? 'your internship'}?`
      : 'No internship here. What did you do with those months?',
    moods: ['neutral', 'neutral', 'sceptical'],
    opts: intel.hasInternship
      ? [
          { label: '“I learnt the workflow.”', fx: [-1, -1, -1], grade: 'weak', heard: 'observer' },
          { label: 'The one thing that would have broken without you', fx: [2, 2, 2], grade: 'strong', heard: 'ownership' },
          { label: '“I did whatever was assigned.”', fx: [-2, 0, -1], grade: 'weak', heard: 'execution only' },
          { label: 'Name the team, the stack, and your module', fx: [1, 1, 2], grade: 'strong', heard: 'context plus ownership' }
        ]
      : [
          { label: '“I could not find one.”', fx: [-2, -1, -1], grade: 'weak', heard: 'no initiative' },
          { label: 'What you built instead, and who used it', fx: [2, 2, 2], grade: 'strong', heard: 'self-directed work' },
          { label: '“I was focusing on marks.”', fx: [-1, 0, -1], grade: 'weak', heard: 'nothing to show' },
          { label: 'Open source, freelance or a lab project with real users', fx: [1, 2, 2], grade: 'strong', heard: 'real work without a badge' }
        ],
    model: intel.hasInternship
      ? '“The nightly reconciliation job — 400 lines, mine end to end. When it failed, the finance team did it by hand the next morning, so I had a real customer.”'
      : '“I built the timetable tool my department uses — about 300 students. No company name, but real users and real complaints.”',
    why: 'They want output, not a title. If there is no internship, replace it with proof of self-directed work.'
  })

  // 7. marks, only when they are low
  if (intel.cgpa !== null && intel.cgpa < 7) {
    push({
      id: 'p-cgpa', round: 'Your CV', scene: 'wide',
      ask: `Your CGPA is ${intel.cgpa.toFixed(1)}. Why should we look past it?`,
      moods: ['neutral', 'neutral', 'sceptical'],
      opts: [
        { label: '“The marking was strict.”', fx: [-2, -1, -1], grade: 'weak', heard: 'blame' },
        { label: 'Own it, show the trend, redirect to evidence', fx: [2, 2, 2], grade: 'strong', heard: 'accountability' },
        { label: '“Marks do not matter in this industry.”', fx: [-2, -1, -2], grade: 'weak', heard: 'dismissive' },
        { label: '“My last two semesters were better.”', fx: [1, 1, 1], grade: 'ok', heard: 'a trend, if shown' }
      ],
      model: `“${intel.cgpa.toFixed(1)} is the average of six semesters, and second year pulled it down — I was running three clubs. I cut to one and the last two semesters are 8.1.”`,
      why: 'Do not argue with the number. Explain it, show the trend, and move to evidence they can check.'
    })
  }

  return out
}
