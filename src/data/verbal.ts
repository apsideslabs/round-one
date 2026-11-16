import type { Mcq } from './types'

export const verbal: Mcq[] = [
  {
    id: 'v01', tag: 'Synonym', difficulty: 'easy', prompt: 'Choose the word closest in meaning to CANDID.',
    options: ['Deceitful', 'Frank', 'Cautious', 'Elaborate'], answer: 1,
    why: 'Candid means open and direct — frank.',
    steps: ['Put the word in a sentence: "she gave a candid answer" — meaning an honest, unguarded one.', 'Match that sense: frank is open and direct.', 'Check it survives substitution: "a frank answer" reads the same.'],
    wrong: { 0: 'Deceitful means deliberately misleading — the opposite of candid.', 2: 'Cautious means careful, hedging; candid is unguarded.', 3: 'Elaborate means detailed; candid is about honesty, not length.' }
  },
  {
    id: 'v02', tag: 'Synonym', difficulty: 'medium', prompt: 'Choose the word closest in meaning to ABATE.',
    options: ['Increase', 'Subside', 'Repeat', 'Delay'], answer: 1,
    why: 'To abate is to lessen or die down, as a storm does.',
    steps: ['Recall the common collocation: "the storm abated".', 'That means it weakened, not stopped or repeated.', 'Subside carries exactly that sense of gradually lessening.'],
    wrong: { 0: 'Increase is the antonym — abate means to go down.', 2: 'Repeat concerns frequency, not intensity.', 3: 'Delay is about timing; abate is about strength.' }
  },
  {
    id: 'v03', tag: 'Synonym', difficulty: 'medium', prompt: 'Choose the word closest in meaning to METICULOUS.',
    options: ['Careless', 'Thorough', 'Speedy', 'Doubtful'], answer: 1,
    why: 'Meticulous means showing great attention to detail — thorough.',
    steps: ['Note the root sense: meticulous comes from fear of detail-level error.', 'The behaviour it describes is checking, re-checking, precision.', 'Thorough is the closest match; speed is not implied either way.'],
    wrong: { 0: 'Careless is the direct opposite.', 2: 'Speedy describes pace; a meticulous person is often slow.', 3: 'Doubtful describes uncertainty, not care.' }
  },
  {
    id: 'v04', tag: 'Synonym', difficulty: 'hard', prompt: 'Choose the word closest in meaning to TENACIOUS.',
    options: ['Timid', 'Persistent', 'Generous', 'Temporary'], answer: 1,
    why: 'Tenacious means holding on firmly — persistent.',
    steps: ['Think of the physical image: a tenacious grip does not let go.', 'Applied to a person, it means refusing to give up.', 'Persistent is that sense; the others are unrelated traits.'],
    wrong: { 0: 'Timid is hesitant — the opposite of holding on.', 2: 'Generous concerns giving, not persistence.', 3: 'Temporary concerns duration of a thing, not a person\'s resolve.' }
  },
  {
    id: 'v05', tag: 'Antonym', difficulty: 'easy', prompt: 'Choose the word most nearly opposite to FRUGAL.',
    options: ['Thrifty', 'Extravagant', 'Careful', 'Modest'], answer: 1,
    why: 'Frugal means sparing with money; extravagant is its opposite.',
    steps: ['Define frugal: economical, careful with spending.', 'Look for the opposite pole: spending freely and wastefully.', 'Extravagant is that pole. Watch for synonyms planted as distractors.'],
    wrong: { 0: 'Thrifty is a synonym of frugal — the classic trap in antonym questions.', 2: 'Careful sits on the same side as frugal.', 3: 'Modest describes size or manner, not spending.' }
  },
  {
    id: 'v06', tag: 'Antonym', difficulty: 'medium', prompt: 'Choose the word most nearly opposite to BENEVOLENT.',
    options: ['Kind', 'Malevolent', 'Generous', 'Helpful'], answer: 1,
    why: 'Benevolent means well-wishing; malevolent means wishing harm.',
    steps: ['Split the root: bene = good, volens = wishing.', 'The opposite swaps the prefix: male = bad.', 'Malevolent is the exact antonym; the rest are synonyms.'],
    wrong: { 0: 'Kind is a synonym of benevolent.', 2: 'Generous is a synonym in practice.', 3: 'Helpful sits on the same side.' }
  },
  {
    id: 'v07', tag: 'Antonym', difficulty: 'easy', prompt: 'Choose the word most nearly opposite to TRANSPARENT.',
    options: ['Clear', 'Opaque', 'Visible', 'Obvious'], answer: 1,
    why: 'Opaque blocks light; transparent lets it through.',
    steps: ['Transparent means light passes through and you see clearly.', 'The opposite is a material that blocks light.', 'Opaque. Clear, visible and obvious all sit on the transparent side.'],
    wrong: { 0: 'Clear is a synonym of transparent, not its opposite.', 2: 'Visible means able to be seen — not the opposite.', 3: 'Obvious is the figurative use of transparent, so also a synonym.' }
  },
  {
    id: 'v08', tag: 'Antonym', difficulty: 'medium', prompt: 'Choose the word most nearly opposite to AUGMENT.',
    options: ['Increase', 'Diminish', 'Extend', 'Add'], answer: 1,
    why: 'To augment is to add to or enlarge, so diminish is the opposite.',
    steps: ['Define augment: to make greater.', 'The opposite is to make smaller.', 'Diminish. Increase, extend and add all point the same way as augment.'],
    wrong: { 0: 'Increase is a synonym of augment, not an antonym.', 2: 'Extend is a synonym in the sense of enlarging.', 3: 'Add is the literal meaning.' }
  },
  {
    id: 'v09', tag: 'Error spotting', difficulty: 'medium',
    prompt: 'One part of this sentence is wrong. Which one? "One of my friend / is coming / to the party / tonight."',
    options: ['One of my friend', 'is coming', 'to the party', 'tonight'], answer: 0,
    why: '"One of" takes a plural noun: one of my friends.',
    steps: ['Find the subject: "one of my ___".', '"One of" selects from a group, so the group must be plural.', 'Correct: "one of my friends". The verb then stays singular — "is coming" is right, which is why part 2 is a trap.'],
    wrong: { 1: '"is coming" is correct — "one" is the subject and it is singular.', 2: 'The prepositional phrase is fine.', 3: 'The time adverb is fine — it modifies when she works, not the tense.' }
  },
  {
    id: 'v10', tag: 'Error spotting', difficulty: 'medium',
    prompt: 'Which part is wrong? "She has been working / in this company / since three years / and enjoys it."',
    options: ['She has been working', 'in this company', 'since three years', 'and enjoys it'], answer: 2,
    why: '"Since" marks a point in time; a duration takes "for".',
    steps: ['Separate the two time words: since vs for.', '"Since" + a point: since 2021, since Monday.', '"For" + a length: for three years. The phrase mixes them.'],
    wrong: { 0: 'The present perfect continuous is correct for an ongoing action.', 1: 'The preposition of place is correct.', 3: 'The tense shift is correct — she still enjoys it.' }
  },
  {
    id: 'v11', tag: 'Error spotting', difficulty: 'hard',
    prompt: 'Which part is wrong? "The manager, along with his team, / were present / at the meeting / yesterday."',
    options: ['The manager, along with his team,', 'were present', 'at the meeting', 'yesterday'], answer: 1,
    why: '"Along with" does not change the subject, which is "the manager" — singular.',
    steps: ['Find the true subject: "the manager".', 'Phrases like "along with", "as well as" and "together with" are parenthetical — they do not add to the subject.', 'Singular subject takes "was present".'],
    wrong: { 0: 'The phrase is correctly punctuated as a parenthetical.', 2: 'The prepositional phrase is fine.', 3: 'The time adverb is fine — it modifies when she works, not the tense.' }
  },
  {
    id: 'v12', tag: 'Error spotting', difficulty: 'medium',
    prompt: 'Which part is wrong? "Each of the students / have submitted / their assignments / on time."',
    options: ['Each of the students', 'have submitted', 'their assignments', 'on time'], answer: 1,
    why: '"Each" is singular, so it takes "has submitted".',
    steps: ['Identify the head word: "each".', '"Each", "every", "either" and "neither" are grammatically singular even when followed by "of the plural".', 'Correct verb: "has submitted".'],
    wrong: { 0: '"Each of the students" is the standard construction — the plural noun is required after "of".', 2: 'The object is fine — “their assignments” agrees with the plural students.', 3: 'The adverbial phrase is fine.' }
  },
  {
    id: 'v13', tag: 'Fill in the blank', difficulty: 'easy',
    prompt: 'He is not only a good engineer ___ a patient mentor.',
    options: ['and also', 'but also', 'as well', 'besides'], answer: 1,
    why: '"Not only … but also" is the fixed pair.',
    steps: ['Recognise the opening construction: "not only".', 'It is half of a correlative pair and demands its partner.', 'The pair is "not only … but also".'],
    wrong: { 0: '"And also" duplicates the additive sense and breaks the pair.', 2: '"As well" would leave "not only" unpaired and needs rephrasing.', 3: '"Besides" cannot follow "not only".' }
  },
  {
    id: 'v14', tag: 'Fill in the blank', difficulty: 'medium',
    prompt: '___ the heavy rain, the match continued.',
    options: ['Despite', 'Although', 'However', 'Because'], answer: 0,
    why: '"Despite" takes a noun phrase; "although" needs a clause with a verb.',
    steps: ['Look at what follows the blank: "the heavy rain" — a noun phrase, no verb.', 'Choose a preposition that accepts a noun phrase: despite, in spite of.', '"Although" would need "although it rained heavily".'],
    wrong: { 1: '"Although" requires a full clause with a verb.', 2: '"However" is an adverb and cannot introduce a noun phrase.', 3: '"Because" would reverse the meaning — the match continued in spite of the rain.' }
  },
  {
    id: 'v15', tag: 'Fill in the blank', difficulty: 'medium',
    prompt: 'The team could not agree ___ the timeline.',
    options: ['on', 'to', 'with', 'for'], answer: 0,
    why: 'You agree on a matter, agree with a person, and agree to a proposal.',
    steps: ['Ask what the object is: a timeline — a matter under discussion.', 'The preposition for a matter is "on" (or "about").', '"Agree with" takes a person; "agree to" takes a proposal or request.'],
    wrong: { 1: '"Agree to" would suit "agree to the plan" — a proposal, not a disputed detail.', 2: '"Agree with" needs a person or an opinion attributed to someone.', 3: '"Agree for" is not idiomatic in this sense.' }
  },
  {
    id: 'v16', tag: 'Fill in the blank', difficulty: 'hard',
    prompt: 'She was ___ about the details, checking every figure twice.',
    options: ['negligent', 'meticulous', 'indifferent', 'hasty'], answer: 1,
    why: 'The second half explains the blank: checking every figure twice is meticulous.',
    steps: ['Use the evidence after the comma as the definition.', '"Checking every figure twice" is the behaviour of someone careful to the point of fussiness.', 'Meticulous. The other three contradict the evidence.'],
    wrong: { 0: 'Negligent would mean she ignored the details.', 2: 'Indifferent contradicts checking twice.', 3: 'Hasty contradicts it too — checking twice is slow.' }
  },
  {
    id: 'v17', tag: 'Para jumble', difficulty: 'medium',
    prompt: 'Arrange into one coherent sentence: P) it started to rain, Q) we were walking home, R) so we took shelter, S) under a shop awning.',
    options: ['QPRS', 'PQRS', 'QRPS', 'QPSR'], answer: 0,
    why: 'Q sets the scene, P adds the event, R gives the response, S names the place.',
    steps: ['Find the clause that can open a sentence: Q, "we were walking home" — subject + verb.', 'P cannot open (it begins with "it" but is a subordinate-style continuation) and R begins with "so", which needs a cause first.', 'So: Q → P (the rain) → R (so we sheltered) → S (where).'],
    wrong: { 1: 'Starting with P leaves "we were walking home" dangling after the rain.', 2: 'R begins with "so" and cannot precede its cause.', 3: 'Putting S before R separates the shelter from where it happened.' }
  },
  {
    id: 'v18', tag: 'Para jumble', difficulty: 'hard',
    prompt: 'Arrange into one coherent sentence: P) which was founded in 1998, Q) the company, R) now employs 400 people, S) across three cities.',
    options: ['QPRS', 'PQRS', 'QRPS', 'QSPR'], answer: 0,
    why: 'The subject opens, and the relative clause sits next to what it describes.',
    steps: ['Identify the subject: Q, "the company".', 'P is a relative clause beginning "which" — it must touch its antecedent.', 'So Q → P, then R (the verb phrase) and S (the modifier of 400 people).'],
    wrong: { 1: 'P cannot start: "which" has nothing to refer to yet.', 2: 'R before P separates the company from its relative clause.', 3: 'S before P strands "which was founded in 1998" at the end.' }
  },
  {
    id: 'v19', tag: 'Para jumble', difficulty: 'medium',
    prompt: 'Arrange into one coherent sentence: P) but the deadline held, Q) the team lost two engineers, R) and the release shipped, S) on time.',
    options: ['QPRS', 'PQRS', 'QRPS', 'QPSR'], answer: 0,
    why: 'The loss comes first, the contrast second, the outcome last.',
    steps: ['Q states the setback and can stand alone as a clause.', 'P begins with "but", so it must follow the setback it contrasts with.', 'R adds the outcome, S modifies "shipped". Q → P → R → S.'],
    wrong: { 1: 'P opens with a conjunction and cannot start the sentence.', 2: 'R before P leaves "but the deadline held" after the outcome, reversing cause and contrast.', 3: 'S attaches to the wrong clause.' }
  },
  {
    id: 'v20', tag: 'Para jumble', difficulty: 'hard',
    prompt: 'Arrange into one coherent sentence: P) because the data was incomplete, Q) the analyst, R) asked for another week, S) rather than guess.',
    options: ['QPRS', 'PQRS', 'QRPS', 'QSRP'], answer: 0,
    why: 'Subject, then the reason, then the action, then the alternative rejected.',
    steps: ['Q names the subject and must come first.', 'P gives the reason and is bracketed by commas, so it sits inside the main clause.', 'R is the main verb phrase, and S states what she refused to do — it belongs last.'],
    wrong: { 1: 'P cannot open — "because" would need the main clause first in this construction.', 2: 'R before P puts the action ahead of its reason.', 3: 'S before R leaves the main verb stranded at the end.' }
  },
  {
    id: 'v21', tag: 'Reading', difficulty: 'hard',
    prompt: 'Passage: "Remote teams report higher focus but slower decisions. The delay is not caused by time zones alone; teams that met in person first decided faster than teams that never had." Which claim does the passage support?',
    options: ['Remote work always slows decisions', 'Time zones are the only cause of delay', 'Prior in-person contact is associated with faster decisions', 'Remote teams are less focused'], answer: 2,
    why: 'The passage compares two kinds of remote team and finds the difference in prior in-person contact.',
    steps: ['Separate the two claims: focus is higher, decisions are slower.', 'The second sentence removes time zones as a sole explanation and names a different variable.', 'The variable is prior in-person contact — that is the supported claim.'],
    wrong: { 0: '"Always" overclaims; the passage reports a tendency, and it explicitly offers a counter-case.', 1: 'The passage says the opposite — "not caused by time zones alone".', 3: 'It says focus was higher, not lower.' }
  },
  {
    id: 'v22', tag: 'Reading', difficulty: 'hard',
    prompt: 'Passage: "A firm cut its interview panel from five people to two. Offer acceptance rose from 61% to 74%, while the share of hires rated \'strong\' by managers stayed flat." What does this best support?',
    options: ['Smaller panels find better candidates', 'Shorter processes improved acceptance without hurting hire quality', 'Managers preferred the five-person panel', 'Acceptance rose because salaries increased'], answer: 1,
    why: 'Acceptance rose and quality ratings did not change — that is the claim.',
    steps: ['Track two numbers across the change: acceptance up 13 points, strong-hire share flat.', 'Acceptance up means candidates said yes more often; flat quality means the hires were no worse.', 'Together: a shorter process improved acceptance without damaging quality.'],
    wrong: { 0: 'Quality stayed flat, so the panel did not find better candidates — it found equal ones faster.', 2: 'Nothing in the passage reports manager preference.', 3: 'Salary is not mentioned; assuming it is the cause invents a variable.' }
  },
  {
    id: 'v23', tag: 'One-word', difficulty: 'medium', prompt: 'One word for "a person who speaks many languages".',
    options: ['Linguist', 'Polyglot', 'Orator', 'Translator'], answer: 1,
    why: 'A polyglot speaks several languages.',
    steps: ['Break the root: poly = many, glot = tongue/language.', 'A polyglot is literally a many-tongued person.', 'A linguist studies language; a translator converts between two.'],
    wrong: { 0: 'A linguist studies language scientifically — they need not speak many.', 2: 'An orator speaks well to an audience.', 3: 'A translator works between languages but is not defined by speaking many.' }
  },
  {
    id: 'v24', tag: 'One-word', difficulty: 'medium', prompt: 'One word for "a speech delivered without preparation".',
    options: ['Extempore', 'Elegy', 'Epilogue', 'Epitome'], answer: 0,
    why: 'Extempore means speaking on the spot, without notes.',
    steps: ['Recall the exam-hall use: "extempore speech" — speak now, no preparation.', 'Check the others by meaning: an elegy mourns, an epilogue closes a work, an epitome is a summary.', 'Extempore is the only one about unprepared speech.'],
    wrong: { 1: 'An elegy is a poem of mourning.', 2: 'An epilogue is the closing section of a book or play.', 3: 'An epitome is a perfect example or a summary.' }
  }
]
