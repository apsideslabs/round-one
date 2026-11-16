import type { Guide } from './types'

export const guides: Guide[] = [
  {
    slug: 'classification',
    title: 'Odd one out',
    kicker: 'Classification',
    minutes: 6,
    summary: 'The basis is the property exactly three items hold. A 2–2 split never decides the answer.',
    sections: [
      {
        heading: 'What the question is actually asking',
        body: [
          'Classification gives you four items where three share a property and one does not. You are not looking for what is different — every item is different from the others in some way. You are looking for what the majority has in common, and then for the one that fails it.',
          'That inversion is the whole skill. “What is odd?” has four possible answers. “What do these three share?” has one.'
        ]
      },
      {
        heading: 'The method',
        body: [
          'Write two or three labels for each item: what it is, where it is found, what it is used for. Then find a label exactly three carry.',
          'If two items each look odd for different reasons, go one level deeper until a single property splits the set 3–1. Instruments become drums versus strings; rivers become Himalayan versus peninsular.'
        ],
        example: {
          q: 'Tabla, mridangam, sitar, dholak — which is the odd one?',
          answer: 'Sitar',
          why: 'All four are Indian instruments, so that label separates nothing. One level deeper: tabla, mridangam and dholak are percussion; the sitar is a string instrument.'
        }
      },
      {
        heading: 'Traps worth knowing',
        body: [
          'A property held by only two items splits the group 2–2 and cannot be the basis. If the Ganga and the Godavari both reach the Bay of Bengal while the Yamuna and Kosi join the Ganga, that fact decides nothing — you need a 3–1 property such as “rises in the Himalayas”.',
          'Words with two meanings are planted deliberately. Mercury is a planet and a metal; use whichever reading makes exactly three items group together.',
          'Ignore word length, first letters and alphabetical order unless the question is about letters. They are planted to catch people who pattern-match on surface features.'
        ]
      }
    ]
  },
  {
    slug: 'number-series',
    title: 'Number series',
    kicker: 'Quantitative reasoning',
    minutes: 7,
    summary: 'Check the differences first, then the ratios, then the two interleaved series. Nine out of ten series fall to one of those.',
    sections: [
      {
        heading: 'The order you should check things in',
        body: [
          'First differences. If the gaps are constant you have an arithmetic series. If the gaps themselves form a pattern (+3, +5, +7) you have a quadratic.',
          'Then ratios. If each term is a multiple of the last, it is geometric — and if the multiple grows, the series is exponential with a twist.',
          'Then interleaving. If nothing works, split odd and even positions into two separate series. Examiners use this constantly because it looks impossible from the surface.'
        ]
      },
      {
        heading: 'Worked examples',
        body: ['Two that look unrelated and are not.'],
        example: {
          q: '3, 6, 11, 18, 27, ?',
          answer: '38',
          why: 'Gaps are 3, 5, 7, 9 — an arithmetic series of odd numbers. The next gap is 11, so 27 + 11 = 38.'
        }
      },
      {
        heading: 'The second example',
        body: ['Same method, different pattern — this one is a product, not a sum.'],
        example: {
          q: '2, 6, 12, 20, 30, ?',
          answer: '42',
          why: 'Each term is n(n+1): 1×2, 2×3, 3×4, 4×5, 5×6 — so the next is 6×7 = 42. The gaps (4, 6, 8, 10) give it away if you check differences first.'
        }
      },
      {
        heading: 'When to move on',
        body: [
          'If two minutes of checking has produced nothing, mark it and return. A screening test is scored on total marks, and one stubborn series can eat the time three easy ones would have taken.',
          'Learn the common sequences cold: squares, cubes, primes, Fibonacci, n(n+1), n²+1, and powers of two. Recognising one instantly is worth more than any cleverness in the moment.'
        ]
      }
    ]
  },
  {
    slug: 'syllogisms',
    title: 'Syllogisms',
    kicker: 'Formal logic',
    minutes: 5,
    summary: 'Draw the chain. If a conclusion reverses an arrow, it does not follow.',
    sections: [
      {
        heading: 'The one rule that solves most of them',
        body: [
          'Convert every statement to an arrow. “All engineers are graduates” is engineers → graduates. “All graduates are literate” is graduates → literate. Chain them: engineers → graduates → literate, so all engineers are literate.',
          'A conclusion that runs against an arrow is invalid. “All literate people are engineers” reverses the chain and fails, no matter how plausible it sounds.'
        ],
        example: {
          q: 'All engineers are graduates. All graduates are literate. Which follows?',
          answer: 'All engineers are literate',
          why: 'The arrows chain forwards. The reverse — that every literate person is an engineer — is not supported by anything in the premises.'
        }
      },
      {
        heading: '“Some” statements',
        body: [
          '“Some pens are red” tells you an overlap exists, not how big it is. Combine it with “all red things are colours” and you can only conclude that some pens are colours — the overlap, not the whole set.',
          'Never upgrade “some” to “all”. That single move accounts for most wrong answers in this question type.'
        ]
      },
      {
        heading: 'A quick checklist',
        body: [
          'Does the conclusion introduce a term that appears in neither premise? If yes, it cannot follow.',
          'Does it turn a “some” into an “all”, or an “all” into a “some”? Check whether the direction of the arrow survives.',
          'If two conclusions each look valid, look for the one that uses the full chain rather than a single statement.'
        ]
      }
    ]
  },
  {
    slug: 'data-interpretation',
    title: 'Data reasoning',
    kicker: 'Critical thinking',
    minutes: 6,
    summary: 'A difference in rates supports a likelihood. It never supports a guarantee.',
    sections: [
      {
        heading: 'Rates versus counts',
        body: [
          'A statement like “60% of those who took the training were promoted, against 40% of those who did not” supports exactly one claim: the trained group was more likely to be promoted.',
          'It does not say the training caused it — people who choose training may already be more motivated — and it does not say 60% of everyone was promoted. Both are the standard wrong answers.'
        ]
      },
      {
        heading: 'The overclaim test',
        body: [
          'Read each option and ask what it would take to be true. If the option needs more than the passage gives — a cause, a total, a comparison across a group not mentioned — it is out.',
          'Words that should raise your guard: guarantees, always, all, proves, never. Data almost never supports them.'
        ],
        example: {
          q: 'What does the promotion data best support?',
          answer: 'Those who took the training were more likely to be promoted',
          why: 'A difference between two rates is evidence of a difference in likelihood. Everything stronger than that is an overclaim.'
        }
      },
      {
        heading: 'Reading tables fast',
        body: [
          'Read the row and column headers before any number. Half of all errors in data interpretation come from reading the wrong column.',
          'Then find the question’s unit: is it asking for a percentage of a total, a ratio between two cells, or a difference? Compute only what is asked, and sanity-check the magnitude before you commit.'
        ]
      }
    ]
  },
  {
    slug: 'star-answers',
    title: 'STAR answers',
    kicker: 'Interview craft',
    minutes: 8,
    summary: 'Situation, Task, Action, Result — in that order, with the Action in the first person.',
    sections: [
      {
        heading: 'Why the structure matters more than the story',
        body: [
          'Interviewers are not scoring how interesting your project was. They are scoring whether you can compress an experience into a shape they can compare against other candidates. STAR is that shape.',
          'Situation is one sentence. Task is what you owned. Action is what you did — “I”, not “we”. Result is the outcome, with a number if one exists.'
        ]
      },
      {
        heading: 'The three failures that sink a STAR answer',
        body: [
          'Too much situation. If you are still setting the scene after thirty seconds, you have lost the room. One sentence, then move.',
          '“We” instead of “I”. The interviewer cannot tell what you contributed, so they cannot score it. Use the first person even when the work was shared, and name your part honestly.',
          'No result. An answer without an outcome is an anecdote. If you genuinely cannot quantify it, say what changed — a decision, a process, a person’s behaviour.'
        ],
        example: {
          q: 'Tell me about a conflict you handled.',
          answer: 'Situation: two of us disagreed on the database for a fest app. Task: I owned the check-in module. Action: I wrote a one-page comparison against our real load of 400 concurrent check-ins. Result: we chose Postgres and failures dropped from 12% to under 1%.',
          why: 'Four sentences, one per letter, and the Action is unmistakably the speaker’s.'
        }
      },
      {
        heading: 'Rehearse out loud, not on paper',
        body: [
          'A written answer that reads well often collapses when spoken, because you have never heard its length. Time yourself saying it: 90 seconds is the ceiling for an opener, 2 minutes for a behavioural story.',
          'Record one answer on your phone and listen back once. It is uncomfortable and it is the fastest correction available.'
        ]
      }
    ]
  },
  {
    slug: 'salary-negotiation',
    title: 'Salary conversations',
    kicker: 'Negotiation',
    minutes: 6,
    summary: 'Give a researched range, anchor on the market, and never name a number you would resent.',
    sections: [
      {
        heading: 'Answer the question with a range',
        body: [
          'A single number is a commitment and an anchor. A range gives you room and signals that you have done the work: “for this role in Bengaluru I’m seeing ₹12–15 LPA, so that’s my range.”',
          'Justify it with something external — market data, the scope of the role, the city — rather than with what you currently earn. Your current package is a fact about your last job, not about this one.'
        ]
      },
      {
        heading: 'If they ask first',
        body: [
          'You can defer once: “I’d rather understand the scope first — what range is budgeted for this role?” If they insist, give the range. Refusing twice reads as evasive.',
          'Never give a number you would resent accepting. Candidates who lowball to seem reasonable spend the next year negotiating a correction.'
        ]
      },
      {
        heading: 'What else is on the table',
        body: [
          'Notice period, joining bonus, review timing, remote days, learning budget, and the title on the offer letter all move. If base salary is fixed, ask which of those is not.',
          'Get the final structure in writing before you resign. Verbals have a way of becoming “we said we’d revisit that”.'
        ]
      }
    ]
  }
]
