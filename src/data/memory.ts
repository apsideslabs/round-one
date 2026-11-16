import type { MemoryBrief } from './types'

export const memory: MemoryBrief[] = [
  {
    id: 'm1', name: 'Client brief', seconds: 12,
    facts: [['Client', 'Nexora Retail'], ['Budget', '₹42 lakh'], ['Timeline', '14 weeks'], ['Team', '5 engineers, 1 designer'], ['Go-live', '3 March'], ['Main risk', 'Payments integration']],
    questions: [
      { id: 'm1q1', tag: 'Recall', difficulty: 'easy', prompt: 'What was the budget?', options: ['₹24 lakh', '₹42 lakh', '₹44 lakh', '₹40 lakh'], answer: 1, why: 'The brief said ₹42 lakh. Transposed digits are the usual trap.' },
      { id: 'm1q2', tag: 'Recall', difficulty: 'easy', prompt: 'When was go-live?', options: ['3 March', '14 March', '30 March', '3 April'], answer: 0, why: '3 March. The 14 in the brief was the timeline in weeks, not the date.' },
      { id: 'm1q3', tag: 'Recall', difficulty: 'easy', prompt: 'How many engineers were on the team?', options: ['3', '4', '5', '6'], answer: 2, why: '5 engineers plus 1 designer — six people in all.' }
    ]
  },
  {
    id: 'm2', name: 'The panel', seconds: 12,
    facts: [['Panel · Product', 'Rhea Kapur'], ['Panel · Engineering', 'Arjun Menon'], ['Panel · Design', 'Fatima Sheikh'], ['Role', 'Analyst'], ['Location', 'Pune'], ['Notice period', '60 days']],
    questions: [
      { id: 'm2q1', tag: 'Recall', difficulty: 'easy', prompt: 'Who sat on the panel from Design?', options: ['Rhea Kapur', 'Arjun Menon', 'Fatima Sheikh', 'Nobody'], answer: 2, why: 'Fatima Sheikh covered design.' },
      { id: 'm2q2', tag: 'Recall', difficulty: 'easy', prompt: 'Which role was being discussed?', options: ['Associate', 'Analyst', 'Architect', 'Manager'], answer: 1, why: 'Analyst, based in Pune.' },
      { id: 'm2q3', tag: 'Recall', difficulty: 'easy', prompt: 'What notice period was mentioned?', options: ['30 days', '45 days', '60 days', '90 days'], answer: 2, why: '60 days — the notice period, not the notice pay.' }
    ]
  },
  {
    id: 'm3', name: 'Invoice', seconds: 12,
    facts: [['Invoice no.', '4482'], ['Units', '1,250'], ['Rate', '₹96 per unit'], ['Discount', '12%'], ['Buyer', 'Kestrel Logistics'], ['Payment terms', 'Net 30']],
    questions: [
      { id: 'm3q1', tag: 'Recall', difficulty: 'medium', prompt: 'How many units were billed?', options: ['1,150', '1,250', '1,520', '1,025'], answer: 1, why: '1,250 units.' },
      { id: 'm3q2', tag: 'Recall', difficulty: 'medium', prompt: 'What was the rate per unit?', options: ['₹69', '₹86', '₹96', '₹106'], answer: 2, why: '₹96 per unit, with a 12% discount on top.' },
      { id: 'm3q3', tag: 'Recall', difficulty: 'medium', prompt: 'What were the payment terms?', options: ['Net 15', 'Net 30', 'Net 45', 'Advance'], answer: 1, why: 'Net 30 — payable within thirty days.' }
    ]
  },
  {
    id: 'm4', name: 'The process', seconds: 12,
    facts: [['Step 1', 'Discover'], ['Step 2', 'Define'], ['Step 3', 'Design'], ['Step 4', 'Build'], ['Step 5', 'Measure'], ['Owner', 'Product team']],
    questions: [
      { id: 'm4q1', tag: 'Recall', difficulty: 'easy', prompt: 'Which step came third?', options: ['Define', 'Design', 'Build', 'Discover'], answer: 1, why: 'Order: Discover, Define, Design, Build, Measure.' },
      { id: 'm4q2', tag: 'Recall', difficulty: 'easy', prompt: 'What came immediately after Define?', options: ['Discover', 'Design', 'Build', 'Measure'], answer: 1, why: 'Design follows Define.' },
      { id: 'm4q3', tag: 'Recall', difficulty: 'easy', prompt: 'Who owned the process?', options: ['Engineering', 'Design', 'Product team', 'QA'], answer: 2, why: 'The product team owned it.' }
    ]
  },
  {
    id: 'm5', name: 'Project status', seconds: 12,
    facts: [['Project', 'Helios'], ['Sprint', '7 of 10'], ['Open defects', '23'], ['Blockers', '2'], ['Release', '18 June'], ['Owner', 'Priya Nair']],
    questions: [
      { id: 'm5q1', tag: 'Recall', difficulty: 'medium', prompt: 'How many open defects were there?', options: ['13', '23', '32', '2'], answer: 1, why: '23 open defects, against 2 blockers — the numbers are meant to be confused.' },
      { id: 'm5q2', tag: 'Recall', difficulty: 'medium', prompt: 'Which sprint were they in?', options: ['5 of 10', '6 of 10', '7 of 10', '8 of 10'], answer: 2, why: 'Sprint 7 of 10.' },
      { id: 'm5q3', tag: 'Recall', difficulty: 'medium', prompt: 'Who owned the project?', options: ['Priya Nair', 'Rhea Kapur', 'Arjun Menon', 'Fatima Sheikh'], answer: 0, why: 'Priya Nair. The other three names are from the panel brief — cross-brief contamination is the real test here.' }
    ]
  },
  {
    id: 'm6', name: 'Candidate file', seconds: 12,
    facts: [['Candidate', 'Dev Sharma'], ['Experience', '3 years'], ['Current CTC', '₹9.6 LPA'], ['Expected', '₹14 LPA'], ['Notice', '45 days'], ['Stack', 'React, Node']],
    questions: [
      { id: 'm6q1', tag: 'Recall', difficulty: 'medium', prompt: 'What was the expected salary?', options: ['₹9.6 LPA', '₹12 LPA', '₹14 LPA', '₹16 LPA'], answer: 2, why: '₹14 LPA expected, against ₹9.6 LPA current.' },
      { id: 'm6q2', tag: 'Recall', difficulty: 'medium', prompt: 'How much experience did the candidate have?', options: ['2 years', '3 years', '4 years', '5 years'], answer: 1, why: '3 years of experience, at ₹9.6 LPA.' },
      { id: 'm6q3', tag: 'Recall', difficulty: 'medium', prompt: 'Which stack was listed?', options: ['React, Node', 'Java, Spring', 'Python, Django', 'Go, gRPC'], answer: 0, why: 'React and Node — the stack listed in the file.' }
    ]
  }
]
