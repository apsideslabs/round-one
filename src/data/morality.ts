/**
 * Moral reasoning dilemmas.
 *
 * Grounded in Kohlberg's six stages (three levels), Rest's neo-Kohlbergian
 * schemas — Personal Interest (stages 2–3), Maintaining Norms (stage 4),
 * Post-conventional (stages 5–6) — and Gilligan's care orientation, which is
 * scored as a parallel voice rather than a lower rung.
 *
 * Every option here is defensible. There is no correct answer: the choice
 * reveals the schema you reached for, and the rating at the end reports that
 * preference rather than a grade.
 */
export type Stage = 1 | 2 | 3 | 4 | 5 | 6

export interface MoralOption {
  text: string
  stage: Stage
  care?: boolean
  why: string
}

export interface Dilemma {
  id: string
  title: string
  scenario: string
  prompt: string
  options: MoralOption[]
}

export const stageNames: Record<Stage, string> = {
  1: 'Obedience & punishment',
  2: 'Individual interest',
  3: 'Interpersonal accord',
  4: 'Law & social order',
  5: 'Social contract & rights',
  6: 'Universal principles'
}

export const dilemmas: Dilemma[] = [
  {
    id: 'wallet',
    title: 'The wallet',
    scenario:
      'You find a wallet on the pavement: ₹5,000 in cash, a driving licence and a hospital appointment card for tomorrow morning.',
    prompt: 'What is the strongest reason to hand it in?',
    options: [
      {
        text: 'There are cameras on this street — being caught with it is not worth it.',
        stage: 1,
        why: 'The reason is the consequence to you: punishment avoided. That is stage 1, obedience and punishment.'
      },
      {
        text: 'Hand it in at the police station counter, the way lost property is meant to be handled.',
        stage: 4,
        why: 'The procedure exists so that property returns to its owner without anyone deciding case by case. Stage 4, maintaining norms.'
      },
      {
        text: 'The owner is probably panicking about tomorrow’s appointment; I would want someone to think of me.',
        stage: 3,
        care: true,
        why: 'The reason is another person’s distress and the relationship you imagine with them. Stage 3, with a clear care voice.'
      },
      {
        text: 'The licence and the appointment card belong to them; my convenience does not outrank their right to them.',
        stage: 5,
        why: 'A right is being weighed against an interest — stage 5, social contract and individual rights.'
      }
    ]
  },
  {
    id: 'group-project',
    title: 'The free rider',
    scenario:
      'Four of you built a term project. The fifth member contributed nothing, and the submission is tomorrow. Your name is on the same cover page.',
    prompt: 'What is the strongest reason for what you do next?',
    options: [
      {
        text: 'Ask the professor to remove their name — they should not get marks they did not earn, and the rule is clear.',
        stage: 4,
        why: 'Applying the assessment rule evenly, regardless of who it is. Stage 4, maintaining norms.'
      },
      {
        text: 'Do their part quietly tonight. A confrontation costs me marks and sleep, and nobody will thank me.',
        stage: 2,
        why: 'Cost and benefit to you, calculated plainly. Stage 2, individual interest.'
      },
      {
        text: 'Talk to them first. A team that humiliates one member in front of a professor is a worse team than one that is late.',
        stage: 3,
        care: true,
        why: 'Preserving the relationship and the person’s standing. Stage 3, interpersonal accord, in a care voice.'
      },
      {
        text: 'Tell them you will not cover for them, and let them decide what to tell the professor themselves.',
        stage: 5,
        why: 'Respecting their autonomy to own the choice while refusing to lie. Stage 5, rights and social contract.'
      }
    ]
  },
  {
    id: 'the-report',
    title: 'The report',
    scenario:
      'Your manager asks you to change a retention figure from 61% to 68% in a deck going to a client tomorrow. The underlying data has not changed.',
    prompt: 'What is the strongest reason for how you respond?',
    options: [
      {
        text: 'Do it. The manager signs the deck, and disagreeing with them is a career risk I cannot take this early.',
        stage: 1,
        why: 'Authority decides, and the cost of resisting is personal. Stage 1, obedience and punishment.'
      },
      {
        text: 'Do it, but keep the email asking me to. If it surfaces, I have proof it was not my call.',
        stage: 2,
        why: 'Compliance plus self-protection — a trade, not a principle. Stage 2, individual interest.'
      },
      {
        text: 'Refuse. The client is making a decision on that number, and misleading them is a wrong done to people I will never meet.',
        stage: 5,
        why: 'The harm lands on third parties who cannot consent. Stage 5, rights and social contract.'
      },
      {
        text: 'Refuse, because the audit trail and the firm’s reporting standards exist precisely so numbers cannot be adjusted by mood.',
        stage: 4,
        why: 'The rule and the system it protects. Stage 4, maintaining norms.'
      }
    ]
  },
  {
    id: 'the-exam',
    title: 'The exam',
    scenario:
      'A close friend tells you they plan to cheat in tomorrow’s placement test, which is scored on a curve against your whole batch.',
    prompt: 'What is the strongest reason for your next move?',
    options: [
      {
        text: 'Offer to sit with them tonight instead. If they pass honestly, nobody has to be exposed.',
        stage: 3,
        care: true,
        why: 'Solving the person’s problem rather than the rule’s. Stage 3, with the care voice doing the work.'
      },
      {
        text: 'Tell them plainly that a curve means their marks come out of someone else’s offer letter.',
        stage: 4,
        why: 'Fairness as an even rule applied to everyone. Stage 4, maintaining norms.'
      },
      {
        text: 'Stay out of it. Their risk is theirs, and being involved could cost me my own placement.',
        stage: 2,
        why: 'A boundary drawn around your own exposure. Stage 2, individual interest.'
      },
      {
        text: 'Say I will not cover for them, but I will not report them either — their conscience, their consequence.',
        stage: 5,
        why: 'Two claims held at once: your honesty and their autonomy. Stage 5, rights and social contract.'
      }
    ]
  },
  {
    id: 'the-manager',
    title: 'The manager',
    scenario:
      'You watch a senior manager humiliate a junior colleague in an open-plan office — mocking their accent in front of twelve people. The junior says nothing.',
    prompt: 'What is the strongest reason for what you do?',
    options: [
      {
        text: 'Nothing, for now. The manager controls my appraisal, and a junior colleague is not worth that.',
        stage: 2,
        why: 'A calculation of personal cost. Stage 2, individual interest.'
      },
      {
        text: 'Say something in the room. Whatever the hierarchy says, a person being humiliated deserves someone to stop it.',
        stage: 6,
        care: true,
        why: 'A principle held even against authority and against your own interest — stage 6, with a care voice.'
      },
      {
        text: 'Raise it with HR. There is a dignity-at-work policy, and it exists for exactly this.',
        stage: 4,
        why: 'Using the system’s own rules. Stage 4, maintaining norms.'
      },
      {
        text: 'Check on the colleague afterwards and ask what they want done, before deciding anything for them.',
        stage: 5,
        care: true,
        why: 'Their autonomy and consent lead the response. Stage 5 with care — the person is not a case.'
      }
    ]
  },
  {
    id: 'the-offer',
    title: 'The offer',
    scenario:
      'You are offered a well-paid role on a project that will dam a river used by farming villages downstream. The company is legal, the pay is double, and your family needs the money.',
    prompt: 'What is the strongest reason for your decision?',
    options: [
      {
        text: 'Take it. The work is legal, the pay changes my family’s situation, and that is the end of the calculation.',
        stage: 2,
        why: 'Weighing benefit to your own people. Stage 2, individual interest.'
      },
      {
        text: 'Take it and argue for a mitigation plan from inside — you change more with a seat at the table.',
        stage: 4,
        why: 'Working through the system’s own processes for remedy. Stage 4, maintaining norms.'
      },
      {
        text: 'Decline. I would not accept that cost being imposed on strangers if the choice were theirs to make about me.',
        stage: 6,
        why: 'A universal test — would I accept this done to me? Stage 6, universal principles.'
      },
      {
        text: 'Ask for a transfer to another project and say why. The company can move me; the villages cannot move.',
        stage: 5,
        care: true,
        why: 'A negotiated solution that recognises unequal power. Stage 5, with the care voice audible.'
      }
    ]
  },
  {
    id: 'the-post',
    title: 'The post',
    scenario:
      'A classmate posts something you find genuinely offensive about a community. It is legal, and it is not directed at you.',
    prompt: 'What is the strongest reason for how you respond?',
    options: [
      {
        text: 'Report it to the college so they face consequences. Speech like that should cost them something.',
        stage: 1,
        why: 'Getting an authority to impose a penalty. Stage 1, obedience and punishment.'
      },
      {
        text: 'Message them privately. Public pile-ons rarely change minds; a person might.',
        stage: 3,
        care: true,
        why: 'The relationship as the instrument of change. Stage 3, interpersonal accord with care.'
      },
      {
        text: 'Argue against it publicly while defending their right to have said it.',
        stage: 5,
        why: 'Two principles held together — expression and its cost. Stage 5, rights and social contract.'
      },
      {
        text: 'Leave it to the college’s conduct process. There is a standard for this, and it is not mine to improvise.',
        stage: 4,
        why: 'The institution’s published standard, applied without me inventing my own. Stage 4, maintaining norms.'
      }
    ]
  },
  {
    id: 'the-question',
    title: 'The interview',
    scenario:
      'In a final-round interview you are asked about a skill you do not have. Everyone else in the room has a stronger CV, and you need this job.',
    prompt: 'What is the strongest reason for how you answer?',
    options: [
      {
        text: 'Say I have it. Everyone exaggerates in interviews, and being caught later is a problem for later.',
        stage: 2,
        why: 'Immediate gain, deferred cost. Stage 2, individual interest.'
      },
      {
        text: 'Admit the gap, then show the closest thing I have done and offer to prove it in a week.',
        stage: 5,
        why: 'Honesty as a fair basis for a contract both sides can check. Stage 5, social contract.'
      },
      {
        text: 'Admit it plainly — the panel will find out anyway, and a reputation for honesty is worth more than one offer.',
        stage: 3,
        why: 'Reputation and how others will judge you. Stage 3, interpersonal accord.'
      },
      {
        text: 'Admit it, and say what the panel’s own hiring bar would require me to learn and by when.',
        stage: 4,
        why: 'Answering inside the system’s stated standards. Stage 4, maintaining norms.'
      }
    ]
  }
]
