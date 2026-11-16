import type { Mcq } from './types'

export const riddles: Mcq[] = [
  {
    id: 'r01', tag: 'Classic', difficulty: 'easy',
    prompt: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?',
    options: ['A shadow', 'An echo', 'A dream', 'A rumour'], answer: 1,
    why: 'An echo returns your voice without a mouth of its own.',
    steps: ['Split the clues: it "speaks" your words back, it "hears" you, and it needs air.', 'A shadow needs light, not sound; a dream needs sleep; a rumour needs people.', 'An echo is reflected sound — it repeats what you say and travels on air.'],
    wrong: {
      0: 'A shadow has no voice and depends on light, not wind.',
      2: 'A dream needs a sleeper; it does not come alive with wind.',
      3: 'A rumour spreads through people, not air, and does not repeat your voice.'
    }
  },
  {
    id: 'r02', tag: 'Trap', difficulty: 'medium',
    prompt: 'A bat and a ball cost ₹110 together. The bat costs ₹100 more than the ball. What does the ball cost?',
    options: ['₹10', '₹5', '₹15', '₹1'], answer: 1,
    why: '₹10 is the reflex answer and it fails the check: ₹10 + ₹110 = ₹120.',
    steps: ['Let the ball be x. Then the bat is x + 100.', 'Together: x + (x + 100) = 110, so 2x = 10.', 'x = 5. Check: ₹5 + ₹105 = ₹110, and the bat is exactly ₹100 more.'],
    wrong: {
      0: '₹10 is the answer your brain produces by subtracting 100 from 110 — but then the bat would be ₹110 and the total ₹120.',
      2: '₹15 makes the bat ₹115 and the total ₹130.',
      3: '₹1 makes the bat ₹101 and the total ₹102.'
    }
  },
  {
    id: 'r03', tag: 'Rate', difficulty: 'medium',
    prompt: 'If five machines make five widgets in five minutes, how long do 100 machines take to make 100 widgets?',
    options: ['100 minutes', '20 minutes', '5 minutes', '1 minute'], answer: 2,
    why: 'Each machine makes one widget in five minutes — so 100 machines make 100 widgets in five.',
    steps: ['Find the rate of one machine: five machines make five widgets in five minutes, so each makes one widget in five minutes.', 'Scale the machines, not the time: 100 machines each make one widget in the same five minutes.', 'Total: 100 widgets in 5 minutes.'],
    wrong: {
      0: '100 minutes scales the time with the count — but the machines work in parallel, not in sequence.',
      1: '20 minutes divides 100 by 5, mixing up machines and minutes.',
      3: '1 minute assumes a machine makes a widget in one minute; the rate is one per five.'
    }
  },
  {
    id: 'r04', tag: 'Position', difficulty: 'easy',
    prompt: 'You are running a race and you overtake the person in second place. What position are you in now?',
    options: ['First', 'Second', 'Third', 'Last'], answer: 1,
    why: 'You take the place of the person you passed: second.',
    steps: ['Draw the order: first, second, you, fourth.', 'Overtaking the runner in second puts you where they were.', 'You are second. The person in first is still ahead of you.'],
    wrong: {
      0: 'First is the reflex answer — but overtaking second place does not touch the leader.',
      2: 'Third would mean you went backwards.',
      3: 'Last is the opposite of what overtaking does.'
    }
  },
  {
    id: 'r05', tag: 'Word', difficulty: 'easy', prompt: 'What has keys but cannot open a single lock?',
    options: ['A piano', 'A drawer', 'A clock', 'A river'], answer: 0,
    why: 'A piano has keys and opens nothing.',
    steps: ['The word "keys" has two senses: instruments for locks, and the levers on an instrument.', 'Three options have physical locks or none at all.', 'The piano has musical keys — 88 of them — and opens no lock.'],
    wrong: {
      1: 'A drawer is opened by a key, so it belongs with locks.',
      2: 'A clock has hands, not keys.',
      3: 'A river has a bed and a bank, not keys.'
    }
  },
  {
    id: 'r06', tag: 'Family', difficulty: 'medium',
    prompt: 'A man looks at a photograph and says, "Brothers and sisters I have none, but that man\'s father is my father\'s son." Who is in the photograph?',
    options: ['His father', 'His son', 'His brother', 'Himself'], answer: 1,
    why: 'With no siblings, "my father\'s son" can only be the speaker — so the photo shows his son.',
    steps: ['Start from the inside out: "my father\'s son".', 'He has no brothers, so that phrase can only mean the speaker himself.', 'So "that man\'s father is me" — the man in the photograph is his son.'],
    wrong: {
      0: 'If it were his father, the sentence would read "that man\'s father is my father" — but it says "my father\'s son".',
      2: 'He states he has no brothers, so it cannot be a brother.',
      3: 'Himself would make it "that man\'s father is me", which would mean he is his own father.'
    }
  },
  {
    id: 'r07', tag: 'Sequence', difficulty: 'medium',
    prompt: 'What comes next: O, T, T, F, F, S, S, ?',
    options: ['E', 'N', 'T', 'S'], answer: 0,
    why: 'First letters of one to seven — so the next is E for eight.',
    steps: ['The letters are not a word pattern; try initial letters.', 'One, Two, Three, Four, Five, Six, Seven — O, T, T, F, F, S, S matches exactly.', 'The eighth is Eight, so the next letter is E.'],
    wrong: {
      1: 'N is the second letter of "nine", not the first letter of "eight".',
      2: 'T would repeat "three" or "two"; the sequence has moved past both.',
      3: 'S repeats "six" or "seven" and skips eight entirely.'
    }
  },
  {
    id: 'r08', tag: 'Family', difficulty: 'easy',
    prompt: 'Two fathers and two sons sit down to three eggs, and each person eats one whole egg. How?',
    options: ['One egg was shared', 'They were grandfather, father and son', 'One person did not eat', 'There were four eggs'], answer: 1,
    why: 'Three people: a grandfather, his son, and his grandson — two fathers, two sons.',
    steps: ['Four roles, three eggs — so some roles must overlap in one person.', 'A grandfather is a father; his son is both a son and a father; the grandson is a son.', 'That is three people covering two fathers and two sons, eating three eggs.'],
    wrong: {
      0: 'The question says each person ate one whole egg, so nothing was shared.',
      2: 'It states each person eats one — nobody abstains.',
      3: 'Four eggs contradicts the three given.'
    }
  },
  {
    id: 'r09', tag: 'Word', difficulty: 'easy', prompt: 'What gets wetter the more it dries?',
    options: ['A towel', 'A sponge', 'A river', 'A cloud'], answer: 0,
    why: 'A towel dries you by absorbing water, so it gets wetter as it works.',
    steps: ['Read "dries" as an action performed on something else.', 'The thing that dries you takes the water into itself.', 'A towel absorbs as it dries you — it gets wetter the more drying it does.'],
    wrong: {
      1: 'A sponge absorbs, but it is not described as drying something else.',
      2: 'A river does not dry anything.',
      3: 'A cloud releases water; it does not dry.'
    }
  },
  {
    id: 'r10', tag: 'Word', difficulty: 'easy',
    prompt: 'I have cities but no houses, forests but no trees, and water but no fish. What am I?',
    options: ['A painting', 'A map', 'A dream', 'A photograph'], answer: 1,
    why: 'A map carries the names and shapes of all three without the things themselves.',
    steps: ['Each clue names something a representation can show but not contain.', 'Cities, forests and water all appear on a map as symbols and labels.', 'A map is the only option that represents all three by convention.'],
    wrong: {
      0: 'A painting shows a scene; it does not label cities or forests.',
      2: 'A dream has no fixed symbols for cities or forests.',
      3: 'A photograph shows what the lens saw — it cannot label a forest.'
    }
  },
  {
    id: 'r11', tag: 'Word', difficulty: 'medium', prompt: 'The more you take, the more you leave behind. What are they?',
    options: ['Footsteps', 'Breaths', 'Photographs', 'Promises'], answer: 0,
    why: 'Every step you take is a step left behind you.',
    steps: ['Look for something where the act of taking creates a trace.', 'Taking a step leaves a print.', 'The more steps you take, the more prints you leave.'],
    wrong: {
      1: 'Breaths leave nothing behind.',
      2: 'Photographs are not "taken" in a way that leaves more of them behind you.',
      3: 'Promises are made, not taken, and leave no count behind.'
    }
  },
  {
    id: 'r12', tag: 'Word', difficulty: 'medium',
    prompt: 'What can travel around the world while staying in one corner?',
    options: ['A stamp', 'A coin', 'A flag', 'A map'], answer: 0,
    why: 'A postage stamp sits in the corner of an envelope and goes wherever the letter goes.',
    steps: ['The trick is "corner" — a physical corner of something small.', 'A stamp is stuck in the corner of an envelope.', 'The envelope travels the world; the stamp never leaves its corner.'],
    wrong: {
      1: 'A coin travels in a pocket, not in a corner.',
      2: 'A flag flies; it is not fixed to a corner.',
      3: 'A map shows the world but does not travel around it.'
    }
  },
  {
    id: 'r13', tag: 'Trap', difficulty: 'hard', prompt: 'How many months of the year have 28 days?',
    options: ['One', 'Two', 'Six', 'All twelve'], answer: 3,
    why: 'Every month has at least 28 days, so all twelve "have 28 days".',
    steps: ['Read the wording precisely: "have 28 days" is not "have exactly 28 days".', 'January has 31 days, which includes a 28th day.', 'So all twelve months contain 28 days. The question is about reading, not the calendar.'],
    wrong: {
      0: '"One" answers "which month has exactly 28 days" — a different question.',
      1: '"Two" counts February in a leap year and one other; still not what was asked.',
      2: '"Six" is a guess at months with 30 days or fewer.'
    }
  },
  {
    id: 'r14', tag: 'Trap', difficulty: 'medium', prompt: 'A farmer has 17 sheep. All but 9 die. How many are left?',
    options: ['8', '9', '17', '7'], answer: 1,
    why: '"All but 9" means 9 survive.',
    steps: ['Parse the phrase: "all but 9" = all except 9.', 'So 9 sheep did not die.', 'The number left is 9. The subtraction 17 − 9 = 8 answers a question nobody asked.'],
    wrong: {
      0: '8 comes from subtracting 9 from 17 — the arithmetic is right, the reading is wrong.',
      2: '17 assumes nothing died, contradicting the sentence.',
      3: '7 has no basis in either reading.'
    }
  },
  {
    id: 'r15', tag: 'Word', difficulty: 'medium', prompt: 'What has a head and a tail but no body?',
    options: ['A coin', 'A snake', 'A comet', 'A kite'], answer: 0,
    why: 'A coin has heads and tails and nothing in between.',
    steps: ['Take "head" and "tail" as the two sides of a coin.', 'A snake has a body; a comet has a nucleus and a tail but also a body; a kite has a frame.', 'A coin has only two faces — a head and a tail, no body.'],
    wrong: {
      1: 'A snake has a head, a tail and a long body.',
      2: 'A comet has a nucleus and a tail, and is a body in orbit.',
      3: 'A kite has a frame and a body of fabric.'
    }
  },
  {
    id: 'r16', tag: 'Word', difficulty: 'easy', prompt: 'What is light as a feather but cannot be held for long?',
    options: ['A breath', 'A leaf', 'A shadow', 'Smoke'], answer: 0,
    why: 'You can hold your breath only briefly — weight is the decoy.',
    steps: ['"Light as a feather" points at weight, but the second half is the real clue.', 'Holding is literal: you hold your breath.', 'Nobody can hold a breath for long. The weight clue is the misdirection.'],
    wrong: {
      1: 'A leaf can be held as long as you like.',
      2: 'A shadow cannot be held at all — it fails the "cannot be held for long" test by failing it completely.',
      3: 'Smoke cannot be held either; the riddle implies something you do hold.'
    }
  }
]
