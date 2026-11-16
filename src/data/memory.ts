import type { MemoryBrief } from './types'

export const memory: MemoryBrief[] = [
  {
    id: 'm1', name: 'Client brief', seconds: 12,
    facts: [['Client', 'Nexora Retail'], ['Budget', '₹42 lakh'], ['Timeline', '14 weeks'], ['Team', '5 engineers, 1 designer'], ['Go-live', '3 March'], ['Main risk', 'Payments integration']],
    questions: [
      {
        id: 'm1q1', tag: 'Recall', difficulty: 'easy', prompt: 'What was the budget?',
        options: ['₹24 lakh', '₹42 lakh', '₹44 lakh', '₹40 lakh'], answer: 1,
        why: 'The brief said ₹42 lakh.',
        steps: ['Find the budget line: Budget — ₹42 lakh.', 'Read the digits in order: four-two, not two-four.', 'Nothing in the brief converts it; it is the figure as written.'],
        wrong: {0: '₹24 lakh reverses the digits.', 2: '₹44 lakh is two lakh over — a near miss.', 3: '₹40 lakh rounds it down; a brief does not round.'}
      },
      {
        id: 'm1q2', tag: 'Recall', difficulty: 'easy', prompt: 'When was go-live?',
        options: ['3 March', '14 March', '30 March', '3 April'], answer: 0,
        why: '3 March — the 14 was the timeline in weeks, not the date.',
        steps: ['Two numbers in the brief look dateable: 14 and 3 March.', '14 belongs to Timeline (weeks), not the calendar.', 'Go-live is 3 March.'],
        wrong: {1: '14 March borrows the 14 from the timeline.', 2: '30 March is a month-end guess.', 3: '3 April keeps the day, moves the month.'}
      },
      {
        id: 'm1q3', tag: 'Recall', difficulty: 'easy', prompt: 'How many engineers were on the team?',
        options: ['3', '4', '5', '6'], answer: 2,
        why: '5 engineers plus 1 designer — six people in all.',
        steps: ['The team line: 5 engineers, 1 designer.', 'The question asks for engineers, not headcount.', '5 engineers; the team is six.'],
        wrong: {0: '3 is a typical team size, not this one.', 1: '4 undercounts the engineers by one.', 3: '6 is the whole team — the trap the question sets.'}
      },
    ]
  },
  {
    id: 'm2', name: 'The panel', seconds: 12,
    facts: [['Panel · Product', 'Rhea Kapur'], ['Panel · Engineering', 'Arjun Menon'], ['Panel · Design', 'Fatima Sheikh'], ['Role', 'Analyst'], ['Location', 'Pune'], ['Notice period', '60 days']],
    questions: [
      {
        id: 'm2q1', tag: 'Recall', difficulty: 'easy', prompt: 'Who sat on the panel from Design?',
        options: ['Rhea Kapur', 'Arjun Menon', 'Fatima Sheikh', 'Nobody'], answer: 2,
        why: 'Fatima Sheikh covered design.',
        steps: ['Read down the function column: Product, Engineering, Design.', 'Design maps to Fatima Sheikh.', 'Match the function, not the order of names.'],
        wrong: {0: 'Rhea Kapur sat for Product.', 1: 'Arjun Menon sat for Engineering.', 3: 'The brief names a designer.'}
      },
      {
        id: 'm2q2', tag: 'Recall', difficulty: 'easy', prompt: 'Which role was being discussed?',
        options: ['Associate', 'Analyst', 'Architect', 'Manager'], answer: 1,
        why: 'Analyst, based in Pune.',
        steps: ['The role line reads: Role — Analyst.', 'It sits beside Location and Notice period.', 'Answer: Analyst.'],
        wrong: {0: 'Associate is a neighbouring grade.', 2: 'Architect is a technical title, not stated.', 3: 'Manager is a level above the role.'}
      },
      {
        id: 'm2q3', tag: 'Recall', difficulty: 'easy', prompt: 'What notice period was mentioned?',
        options: ['30 days', '45 days', '60 days', '90 days'], answer: 2,
        why: '60 days — the notice period, not the notice pay.',
        steps: ['The last line: Notice period — 60 days.', 'Notice periods are quoted in days.', '60 days, unconverted.'],
        wrong: {0: '30 days is a common default, not this one.', 1: '45 days is the middle option.', 3: '90 days is three months — a different notice standard entirely.'}
      },
    ]
  },
  {
    id: 'm3', name: 'Invoice', seconds: 12,
    facts: [['Invoice no.', '4482'], ['Units', '1,250'], ['Rate', '₹96 per unit'], ['Discount', '12%'], ['Buyer', 'Kestrel Logistics'], ['Payment terms', 'Net 30']],
    questions: [
      {
        id: 'm3q1', tag: 'Recall', difficulty: 'easy', prompt: 'How many units were billed?',
        options: ['1,150', '1,250', '1,520', '1,025'], answer: 1,
        why: '1,250 units.',
        steps: ['The units line: Units — 1,250.', 'Rate is a separate line and does not change the count.', '1,250.'],
        wrong: {0: '1,150 swaps a digit of the real count.', 2: '1,520 reorders the digits.', 3: '1,025 drops the 5 and moves the digits left.'}
      },
      {
        id: 'm3q2', tag: 'Recall', difficulty: 'easy', prompt: 'What was the rate per unit?',
        options: ['₹69', '₹86', '₹96', '₹106'], answer: 2,
        why: '₹96 per unit, with a 12% discount on top.',
        steps: ['The rate line: ₹96 per unit.', 'The 12% discount applies to the invoice value, not the rate.', '₹96.'],
        wrong: {0: '₹69 assumes a much deeper discount.', 1: '₹86 changes a digit of the real rate.', 3: '₹106 adds a markup on top of the rate.'}
      },
      {
        id: 'm3q3', tag: 'Recall', difficulty: 'easy', prompt: 'What were the payment terms?',
        options: ['Net 15', 'Net 30', 'Net 45', 'Advance'], answer: 1,
        why: 'Net 30 — payable within thirty days.',
        steps: ['The terms line: Payment terms — Net 30.', 'Net 30 means thirty days from the invoice date.', 'Answer: Net 30.'],
        wrong: {0: 'Net 15 is a tighter term.', 2: 'Net 45 is a looser term than the one stated.', 3: 'Advance is payment before delivery — the opposite.'}
      },
    ]
  },
  {
    id: 'm4', name: 'The process', seconds: 12,
    facts: [['Step 1', 'Discover'], ['Step 2', 'Define'], ['Step 3', 'Design'], ['Step 4', 'Build'], ['Step 5', 'Measure'], ['Owner', 'Product team']],
    questions: [
      {
        id: 'm4q1', tag: 'Recall', difficulty: 'easy', prompt: 'Which step came third?',
        options: ['Define', 'Design', 'Build', 'Discover'], answer: 1,
        why: 'Order: Discover, Define, Design, Build, Measure.',
        steps: ['Recite the five in order from the brief.', 'Position 3 is Design.', 'Count rather than recall loosely.'],
        wrong: {0: 'Define sits at step 2, not step 3.', 2: 'Build sits at step 4, after Design.', 3: 'Discover is step 1 — the process starts there.'}
      },
      {
        id: 'm4q2', tag: 'Recall', difficulty: 'easy', prompt: 'What came immediately after Define?',
        options: ['Discover', 'Design', 'Build', 'Measure'], answer: 1,
        why: 'Design follows Define.',
        steps: ['Locate Define: step 2.', 'The next line in the brief is step 3: Design.', 'Answer: Design.'],
        wrong: {0: 'Discover comes before Define.', 2: 'Build is two steps later.', 3: 'Measure is the final step, step 5.'}
      },
      {
        id: 'm4q3', tag: 'Recall', difficulty: 'easy', prompt: 'Who owned the process?',
        options: ['Engineering', 'Design', 'Product team', 'QA'], answer: 2,
        why: 'The product team owned it.',
        steps: ['The owner line: Owner — Product team.', 'Engineering and Design appear as step names, not as the owner.', 'Answer: Product team.'],
        wrong: {0: 'Engineering is not named as owner.', 1: 'Design is a step in the process, not its owner.', 3: 'QA does not appear in the brief.'}
      },
    ]
  },
  {
    id: 'm5', name: 'Project status', seconds: 12,
    facts: [['Project', 'Helios'], ['Sprint', '7 of 10'], ['Open defects', '23'], ['Blockers', '2'], ['Release', '18 June'], ['Owner', 'Priya Nair']],
    questions: [
      {
        id: 'm5q1', tag: 'Recall', difficulty: 'easy', prompt: 'How many open defects were there?',
        options: ['13', '23', '32', '2'], answer: 1,
        why: '23 open defects, against 2 blockers.',
        steps: ['The defects line: Open defects — 23.', 'Blockers — 2 is a different line.', 'Answer: 23.'],
        wrong: {0: '13 swaps a digit of the defect count.', 2: '32 reverses the digits of the defect count.', 3: '2 is the blocker count — the closest confusion.'}
      },
      {
        id: 'm5q2', tag: 'Recall', difficulty: 'easy', prompt: 'Which sprint were they in?',
        options: ['5 of 10', '6 of 10', '7 of 10', '8 of 10'], answer: 2,
        why: 'Sprint 7 of 10.',
        steps: ['The sprint line: Sprint — 7 of 10.', '7 is the current sprint; 10 is the total.', 'Answer: 7 of 10.'],
        wrong: {0: '5 of 10 would be behind schedule; the file says 7.', 1: '6 of 10 is one sprint behind the stated position.', 3: '8 of 10 is one sprint ahead of the file.'}
      },
      {
        id: 'm5q3', tag: 'Recall', difficulty: 'easy', prompt: 'Who owned the project?',
        options: ['Priya Nair', 'Rhea Kapur', 'Arjun Menon', 'Fatima Sheikh'], answer: 0,
        why: 'Priya Nair — the other three names come from the panel brief.',
        steps: ['The owner line: Owner — Priya Nair.', 'Rhea, Arjun and Fatima belong to the earlier panel brief.', 'Answer: Priya Nair.'],
        wrong: {1: 'Rhea Kapur is from the panel brief — cross-brief contamination.', 2: 'Arjun Menon is also from the panel brief.', 3: 'Fatima Sheikh is the third panel name.'}
      },
    ]
  },
  {
    id: 'm6', name: 'Candidate file', seconds: 12,
    facts: [['Candidate', 'Dev Sharma'], ['Experience', '3 years'], ['Current CTC', '₹9.6 LPA'], ['Expected', '₹14 LPA'], ['Notice', '45 days'], ['Stack', 'React, Node']],
    questions: [
      {
        id: 'm6q1', tag: 'Recall', difficulty: 'easy', prompt: 'What was the expected salary?',
        options: ['₹9.6 LPA', '₹12 LPA', '₹14 LPA', '₹16 LPA'], answer: 2,
        why: '₹14 LPA expected, against ₹9.6 LPA current.',
        steps: ['Two salary lines: Current CTC ₹9.6 LPA, Expected ₹14 LPA.', 'The question asks what was expected.', 'Answer: ₹14 LPA.'],
        wrong: {0: '₹9.6 LPA is the current package.', 1: '₹12 LPA is a round number in between.', 3: '₹16 LPA overshoots the file.'}
      },
      {
        id: 'm6q2', tag: 'Recall', difficulty: 'easy', prompt: 'How much experience did the candidate have?',
        options: ['2 years', '3 years', '4 years', '5 years'], answer: 1,
        why: '3 years of experience, at ₹9.6 LPA.',
        steps: ['The experience line: Experience — 3 years.', 'It sits directly under the name.', 'Answer: 3 years.'],
        wrong: {0: '2 years is one short of the stated experience.', 2: '4 years is one year over the file.', 3: '5 years is a mid-level figure.'}
      },
      {
        id: 'm6q3', tag: 'Recall', difficulty: 'easy', prompt: 'Which stack was listed?',
        options: ['React, Node', 'Java, Spring', 'Python, Django', 'Go, gRPC'], answer: 0,
        why: 'React and Node — the stack listed in the file.',
        steps: ['The last line: Stack — React, Node.', 'It follows Notice.', 'Answer: React, Node.'],
        wrong: {1: 'Java and Spring are common, not listed.', 2: 'Python and Django are not in the file.', 3: 'Go and gRPC are not in the file.'}
      },
    ]
  },
]
