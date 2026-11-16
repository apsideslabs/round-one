import type { Mcq } from './types'

export const logic: Mcq[] = [
  {
    id: 'l01', tag: 'Odd one out', difficulty: 'easy', prompt: 'Which number does not belong?',
    options: ['17', '23', '29', '35'], answer: 3,
    why: 'Three of the four are prime. 35 is not.',
    steps: ['Test each number for factors other than 1 and itself.', '17, 23 and 29 have none — they are prime.', '35 = 5 × 7, so it is composite.'],
    wrong: {
      0: '17 is prime — only 1 × 17. It belongs with the majority.',
      1: '23 is prime. Nothing divides it except 1 and 23.',
      2: '29 is prime. It looks large, but size is not the test.'
    }
  },
  {
    id: 'l02', tag: 'Number series', difficulty: 'easy', prompt: 'What comes next: 3, 6, 11, 18, 27, ?',
    options: ['36', '38', '40', '42'], answer: 1,
    why: 'The gaps are 3, 5, 7, 9 — the next gap is 11, giving 38.',
    steps: ['Subtract consecutive terms: 6−3 = 3, 11−6 = 5, 18−11 = 7, 27−18 = 9.', 'The gaps form their own series: 3, 5, 7, 9 — odd numbers, +2 each time.', 'The next gap is 11, so 27 + 11 = 38.'],
    wrong: {
      0: '36 assumes a constant gap of 9, but the gaps are growing — they are not constant.',
      2: '40 comes from adding 13, which skips the gap of 11 the pattern requires.',
      3: '42 comes from doubling 21 or adding 15; neither follows from the gap sequence.'
    }
  },
  {
    id: 'l03', tag: 'Odd one out', difficulty: 'easy', prompt: 'Which one does not belong?',
    options: ['Copper', 'Iron', 'Zinc', 'Glass'], answer: 3,
    why: 'Three are metals; glass is not.',
    steps: ['Label each item by category: copper, iron and zinc are metals.', 'Glass is a non-metallic solid — an amorphous ceramic.', 'Three carry the label "metal", so the fourth is the odd one.'],
    wrong: {
      0: 'Copper is a metal, like the majority.',
      1: 'Iron is a metal — it bonds metallically and conducts, so it sits with the majority.',
      2: 'Zinc is a metal — it is an element with metallic bonding.'
    }
  },
  {
    id: 'l04', tag: 'Number series', difficulty: 'medium', prompt: 'What comes next: 2, 6, 12, 20, 30, ?',
    options: ['40', '42', '44', '36'], answer: 1,
    why: 'Each term is n(n+1): 1×2, 2×3, 3×4, 4×5, 5×6 — so 6×7 = 42.',
    steps: ['Check the gaps first: 4, 6, 8, 10 — they rise by 2 each time.', 'The next gap is 12, so 30 + 12 = 42.', 'Confirm with the product rule: the terms are n(n+1), so the sixth is 6 × 7 = 42. Both routes agree.'],
    wrong: {
      0: '40 assumes the gap stays at 10; the gaps are still increasing.',
      2: '44 comes from adding 14, skipping the gap of 12 the pattern requires.',
      3: '36 would go backwards — it is smaller than a plausible next step.'
    }
  },
  {
    id: 'l05', tag: 'Letter series', difficulty: 'medium', prompt: 'AZ, BY, CX, DW, ?',
    options: ['EV', 'EU', 'FV', 'DV'], answer: 0,
    why: 'The first letter moves forward while the second moves back — E then V.',
    steps: ['Write the alphabet positions: A=1, Z=26; B=2, Y=25; C=3, X=24.', 'The first letter increases by one each term; the second decreases by one.', 'Next: E (5) and V (22) — the pair EV.'],
    wrong: {
      1: 'EU has the right first letter but the wrong second — U is 21, which skips a step back.',
      2: 'FV skips a letter at the front: after D comes E, not F.',
      3: 'DV repeats the D from the previous term.'
    }
  },
  {
    id: 'l06', tag: 'Syllogism', difficulty: 'medium', prompt: 'All engineers are graduates. All graduates are literate. Which conclusion follows?',
    options: ['All literate people are engineers', 'All engineers are literate', 'Some engineers are not literate', 'No graduate is an engineer'], answer: 1,
    why: 'The chain runs engineers → graduates → literate. The reverse does not follow.',
    steps: ['Turn each statement into an arrow: engineers → graduates, and graduates → literate.', 'Chain the arrows: engineers → graduates → literate.', 'That yields "all engineers are literate". Any conclusion that runs against an arrow is invalid.'],
    wrong: {
      0: 'This reverses the chain. Being literate does not make someone an engineer — that would be literate → engineer.',
      2: 'It contradicts the chain: every engineer is a graduate, and every graduate is literate, so no engineer can fail to be literate.',
      3: 'It contradicts the first premise directly — all engineers are graduates, so at least some graduates are engineers.'
    }
  },
  {
    id: 'l07', tag: 'Odd one out', difficulty: 'easy', prompt: 'Which number does not belong?',
    options: ['121', '144', '169', '200'], answer: 3,
    why: '121, 144 and 169 are perfect squares; 200 is not.',
    steps: ['Take square roots: 11² = 121, 12² = 144, 13² = 169.', '200 falls between 14² = 196 and 15² = 225, so it has no whole-number root.', 'Three are perfect squares; 200 is the exception.'],
    wrong: {
      0: '121 = 11² — a perfect square, like the majority.',
      1: '144 = 12², also a perfect square.',
      2: '169 = 13². It looks unusual, but it fits the rule exactly.'
    }
  },
  {
    id: 'l08', tag: 'Data reasoning', difficulty: 'hard',
    prompt: '60% of employees who took a training were promoted within two years, against 40% of those who did not. Which conclusion is best supported?',
    options: ['The training guarantees promotion', 'Those who took the training were more likely to be promoted', '60% of all employees were promoted', 'The training was compulsory'],
    answer: 1,
    why: 'A difference in rates supports a likelihood, not a guarantee.',
    steps: ['Compare the two rates: 60% versus 40% — a 20-point gap in the same period.', 'A gap between rates is evidence of a difference in likelihood, and nothing stronger.', 'Check the other options against the passage: none of them can be established from two percentages alone.'],
    wrong: {
      0: '"Guarantees" is the overclaim. 40% of the trained group were not promoted, so the training cannot guarantee anything.',
      2: '60% is the promotion rate of the trained group only. The passage never gives the share across all employees.',
      3: 'Compulsion is not mentioned. Whether the training was optional or mandatory is exactly the kind of detail that would decide whether this is even causal.'
    }
  },
  {
    id: 'l09', tag: 'Odd one out', difficulty: 'hard', prompt: 'Which one does not belong?',
    options: ['Godavari', 'Ganga', 'Yamuna', 'Kosi'], answer: 0,
    why: 'The Ganga, Yamuna and Kosi rise in the Himalayas; the Godavari is peninsular.',
    steps: ['Test the obvious property — draining into the Bay of Bengal. Ganga and Godavari do; Yamuna and Kosi join the Ganga. That splits the set 2–2, so it cannot decide the answer.', 'Go one level deeper: origin. Ganga, Yamuna and Kosi all rise in the Himalayas.', 'The Godavari rises in the Western Ghats near Nashik — a peninsular river. That is a 3–1 split.'],
    wrong: {
      1: 'The Ganga rises in the Himalayas, like the majority of this set.',
      2: 'The Yamuna rises in the Himalayas (Yamunotri).',
      3: 'The Kosi rises in the Himalayas and is a Ganga tributary.'
    }
  },
  {
    id: 'l10', tag: 'Number series', difficulty: 'medium', prompt: 'What comes next: 5, 11, 23, 47, ?',
    options: ['95', '94', '93', '96'], answer: 0,
    why: 'Each term is doubled and one added: 5→11, 11→23, 23→47, 47→95.',
    steps: ['Check the ratio rather than the gap: 11 is about 2 × 5, 23 about 2 × 11, 47 about 2 × 23.', 'Test the exact rule: 2 × 5 + 1 = 11, 2 × 11 + 1 = 23, 2 × 23 + 1 = 47.', 'Apply it once more: 2 × 47 + 1 = 95.'],
    wrong: {
      1: '94 doubles 47 but forgets the +1.',
      2: '93 does not follow any consistent step from 47.',
      3: '96 is 2 × 48 — it drifts by one from the doubling of 47.'
    }
  },
  {
    id: 'l11', tag: 'Odd pair', difficulty: 'medium', prompt: 'Which pair does not match the others?',
    options: ['Tailor : Needle', 'Farmer : Field', 'Carpenter : Saw', 'Painter : Brush'], answer: 1,
    why: 'The others pair a worker with a tool; a field is a workplace.',
    steps: ['Put every pair into one fixed sentence: "the worker uses B as a tool".', 'A needle, a saw and a brush are all tools held and used.', 'A field is where a farmer works, not what they use. The matching pair would be Farmer : Plough.'],
    wrong: {
      0: 'A tailor uses a needle — the tool sentence holds.',
      2: 'A carpenter uses a saw — the tool sentence holds.',
      3: 'A painter uses a brush — the tool sentence holds.'
    }
  },
  {
    id: 'l12', tag: 'Aptitude', difficulty: 'medium', prompt: 'Eight people finish a job in 12 days. How long will six people take, at the same rate?',
    options: ['14 days', '15 days', '16 days', '18 days'], answer: 2,
    why: 'The work is 8 × 12 = 96 person-days, so six people need 96 ÷ 6 = 16 days.',
    steps: ['Convert the job into person-days: 8 people × 12 days = 96 person-days of work.', 'The work is fixed, so person-days stay at 96 whatever the crew size.', 'With 6 people: 96 ÷ 6 = 16 days.'],
    wrong: {
      0: '14 days would mean the work shrank — fewer people cannot take less time.',
      1: '15 days does not divide 96 evenly; it is a guess near the answer.',
      3: '18 days assumes the work scales linearly with a 6/8 ratio applied to 24 rather than 96.'
    }
  },
  {
    id: 'l13', tag: 'Number series', difficulty: 'easy', prompt: 'What comes next: 1, 4, 9, 16, 25, ?',
    options: ['30', '36', '42', '49'], answer: 1,
    why: 'Perfect squares: 1², 2², 3², 4², 5² — so 6² = 36.',
    steps: ['Take square roots: 1, 2, 3, 4, 5 — a simple count.', 'The next root is 6, so the next term is 6² = 36.', 'Check with gaps: 3, 5, 7, 9 — odd numbers, so the next gap is 11 and 25 + 11 = 36. Both routes agree.'],
    wrong: {
      0: '30 adds 5 rather than the next odd gap of 11.',
      2: '42 does not sit at any square.',
      3: '49 is 7², which skips 6² entirely.'
    }
  },
  {
    id: 'l14', tag: 'Number series', difficulty: 'medium', prompt: 'What comes next: 1, 1, 2, 3, 5, 8, ?',
    options: ['11', '12', '13', '15'], answer: 2,
    why: 'Fibonacci: each term is the sum of the two before it, so 5 + 8 = 13.',
    steps: ['Add adjacent pairs: 1+1 = 2, 1+2 = 3, 2+3 = 5, 3+5 = 8.', 'The rule holds without exception, so continue it.', '5 + 8 = 13.'],
    wrong: {
      0: '11 adds 3 to 8; the rule adds the two preceding terms, not a constant.',
      1: '12 is not the sum of 5 and 8.',
      3: '15 comes from adding 7 — again not the Fibonacci step.'
    }
  },
  {
    id: 'l15', tag: 'Number series', difficulty: 'hard', prompt: 'What comes next: 100, 96, 88, 72, ?',
    options: ['56', '48', '40', '64'], answer: 2,
    why: 'Subtract 4, 8, 16, then 32 — so 72 − 32 = 40.',
    steps: ['Take the gaps: 100−96 = 4, 96−88 = 8, 88−72 = 16.', 'The gaps double each time, so the next gap is 32.', '72 − 32 = 40.'],
    wrong: {
      0: '56 subtracts 16 again, freezing the gap instead of doubling it.',
      1: '48 subtracts 24, which fits no step in the doubling sequence.',
      3: '64 subtracts 8 — a step the series has already moved past.'
    }
  },
  {
    id: 'l16', tag: 'Odd one out', difficulty: 'easy', prompt: 'Which number does not belong?',
    options: ['2', '3', '5', '9'], answer: 3,
    why: '2, 3 and 5 are prime; 9 = 3 × 3 is not.',
    steps: ['Test for factors: 2, 3 and 5 have none besides 1 and themselves.', '9 = 3 × 3, so it is composite.', 'Three are prime; 9 breaks the rule.'],
    wrong: { 0: '2 is prime — the only even prime.', 1: '3 is prime — its only factors are 1 and 3.', 2: '5 is prime; it ends in 5 but has no factor besides 1 and itself.' }
  },
  {
    id: 'l17', tag: 'Letter series', difficulty: 'hard', prompt: 'A, C, F, J, O, ?',
    options: ['T', 'U', 'V', 'S'], answer: 1,
    why: 'The gaps grow by one: +2, +3, +4, +5, then +6 — O(15) + 6 = U(21).',
    steps: ['Write positions: A=1, C=3, F=6, J=10, O=15.', 'The gaps are 2, 3, 4, 5 — increasing by one each time.', 'The next gap is 6, so 15 + 6 = 21 = U.'],
    wrong: {
      0: 'T is 20 — a gap of 5, repeating the previous step instead of growing.',
      2: 'V is 22 — a gap of 7, skipping a step.',
      3: 'S is 19 — a gap of 4, going backwards.'
    }
  },
  {
    id: 'l18', tag: 'Odd one out', difficulty: 'easy', prompt: 'Which one does not belong?',
    options: ['Rectangle', 'Square', 'Rhombus', 'Cube'], answer: 3,
    why: 'The first three are flat shapes; a cube is solid.',
    steps: ['Ask what dimension each shape lives in.', 'Rectangle, square and rhombus are all plane figures with four sides.', 'A cube is a three-dimensional solid. Three are flat, so the cube is out.'],
    wrong: {
      0: 'A rectangle is a 2D quadrilateral.',
      1: 'A square is a 2D quadrilateral.',
      2: 'A rhombus is a 2D quadrilateral — slanted sides do not make it solid.'
    }
  },
  {
    id: 'l19', tag: 'Odd one out', difficulty: 'easy', prompt: 'Which one does not belong?',
    options: ['Cricket', 'Hockey', 'Football', 'Chess'], answer: 3,
    why: 'The first three are field games; chess is played on a board.',
    steps: ['Classify by setting: cricket, hockey and football are played on a field or pitch.', 'Chess is played on a board, indoors, between two players.', 'Three share the field setting; chess does not.'],
    wrong: {
      0: 'Cricket is played on a field, like the majority.',
      1: 'Hockey is played on a field, like the majority of this set.',
      2: 'Football is the archetypal field game.'
    }
  },
  {
    id: 'l20', tag: 'Odd one out', difficulty: 'medium', prompt: 'Which one does not belong?',
    options: ['Metre', 'Litre', 'Kilogram', 'Second'], answer: 1,
    why: 'Metre, kilogram and second are SI base units; the litre is derived.',
    steps: ['Ask which are base units of the SI system.', 'Metre (length), kilogram (mass) and second (time) are all base units.', 'The litre is a derived unit of volume, defined as a cubic decimetre. It is out.'],
    wrong: {
      0: 'Metre is an SI base unit of length.',
      2: 'Kilogram is the SI base unit of mass.',
      3: 'Second is the SI base unit of time.'
    }
  },
  {
    id: 'l21', tag: 'Odd pair', difficulty: 'medium', prompt: 'Which pair does not match the others?',
    options: ['Kolkata : West Bengal', 'Chennai : Tamil Nadu', 'Mumbai : Maharashtra', 'Kanpur : Uttar Pradesh'], answer: 3,
    why: 'The first three cities are state capitals; Kanpur is not.',
    steps: ['Fix one sentence for all pairs: "the city is the capital of the state".', 'Kolkata, Chennai and Mumbai are the capitals of their states.', 'Uttar Pradesh\'s capital is Lucknow, not Kanpur. The sentence breaks.'],
    wrong: {
      0: 'Kolkata is the capital of West Bengal — the sentence holds.',
      1: 'Chennai is the capital of Tamil Nadu.',
      2: 'Mumbai is the capital of Maharashtra.'
    }
  },
  {
    id: 'l22', tag: 'Odd pair', difficulty: 'hard', prompt: 'Which number pair does not match the others?',
    options: ['3 : 10', '4 : 17', '5 : 26', '6 : 35'], answer: 3,
    why: 'The rule is n : n² + 1, and 6 should pair with 37, not 35.',
    steps: ['Test the simplest rule on the first pair: 3² + 1 = 10. It holds.', 'Check the next two: 4² + 1 = 17, 5² + 1 = 26. Both hold.', 'Apply to 6: 6² + 1 = 37. The pair says 35, so it breaks the rule.'],
    wrong: {
      0: '3² + 1 = 10 — the rule holds.',
      1: '4² + 1 = 17 — the rule holds for this pair.',
      2: '5² + 1 = 26 — the rule holds here too.'
    }
  },
  {
    id: 'l23', tag: 'Aptitude', difficulty: 'easy', prompt: 'What is 60% of 250?',
    options: ['120', '140', '150', '160'], answer: 2,
    why: '10% of 250 is 25, so 60% is 6 × 25 = 150.',
    steps: ['Break the percentage into tens: 10% of 250 = 25.', '60% is six of those tens: 6 × 25 = 150.', 'Sanity check: 50% is 125, so 60% must sit a little above it — 150 does.'],
    wrong: {
      0: '120 is 48% of 250 — it treats 60% as roughly half.',
      1: '140 is 56%, one ten-percent step short.',
      3: '160 is 64%, one step over.'
    }
  },
  {
    id: 'l24', tag: 'Aptitude', difficulty: 'medium', prompt: 'Two numbers are in the ratio 3 : 5 and add to 64. What is the smaller number?',
    options: ['20', '24', '28', '32'], answer: 1,
    why: 'Eight parts make 64, so one part is 8 and the smaller is 3 × 8 = 24.',
    steps: ['Add the ratio parts: 3 + 5 = 8 parts in total.', 'Divide the total by the parts: 64 ÷ 8 = 8 per part.', 'The smaller number is 3 parts: 3 × 8 = 24. Check: 24 + 40 = 64.'],
    wrong: {
      0: '20 would be 2.5 parts — it does not fit a whole-part ratio.',
      2: '28 is 3.5 parts; the parts must be whole numbers here.',
      3: '32 is exactly half of 64, which ignores the ratio entirely.'
    }
  },
  {
    id: 'l25', tag: 'Aptitude', difficulty: 'hard', prompt: 'The average of five numbers is 20. One number is removed and the average of the rest is 18. What was removed?',
    options: ['24', '26', '28', '30'], answer: 2,
    why: 'Total is 100, the remaining four total 72, so the removed number is 28.',
    steps: ['Turn the first average into a total: 5 × 20 = 100.', 'Turn the second into a total: 4 × 18 = 72.', 'The difference is the removed number: 100 − 72 = 28.'],
    wrong: {
      0: '24 comes from subtracting the averages (20 − 18 = 2) and scaling wrongly.',
      1: '26 does not reconcile the two totals.',
      3: '30 would leave the remaining four averaging 17.5, not 18.'
    }
  },
  {
    id: 'l26', tag: 'Aptitude', difficulty: 'medium', prompt: 'A 120 m train runs at 20 m/s. How long does it take to pass a pole?',
    options: ['4 s', '6 s', '8 s', '10 s'], answer: 1,
    why: 'Time = distance ÷ speed = 120 ÷ 20 = 6 seconds.',
    steps: ['To pass a pole, the train must cover its own length — 120 m.', 'Time = distance ÷ speed = 120 ÷ 20.', 'That is 6 seconds.'],
    wrong: {
      0: '4 s would mean a speed of 30 m/s.',
      2: '8 s would mean a speed of 15 m/s.',
      3: '10 s would mean a speed of 12 m/s.'
    }
  },
  {
    id: 'l27', tag: 'Aptitude', difficulty: 'medium', prompt: 'Simple interest on ₹5,000 at 8% per year for 3 years is:',
    options: ['₹1,000', '₹1,200', '₹1,400', '₹1,600'], answer: 1,
    why: 'SI = P × R × T ÷ 100 = 5000 × 8 × 3 ÷ 100 = ₹1,200.',
    steps: ['Write the formula: SI = (P × R × T) ÷ 100.', 'Substitute: (5000 × 8 × 3) ÷ 100.', '5000 × 8 = 40,000; × 3 = 1,20,000; ÷ 100 = ₹1,200.'],
    wrong: {
      0: '₹1,000 is one year of a different principal, not three years at 8%.',
      2: '₹1,400 uses a rate of about 9.3%.',
      3: '₹1,600 compounds the interest instead of keeping it simple.'
    }
  },
  {
    id: 'l28', tag: 'Odd one out', difficulty: 'easy', prompt: 'Which bird does not belong?',
    options: ['Ostrich', 'Penguin', 'Kiwi', 'Eagle'], answer: 3,
    why: 'The first three cannot fly; the eagle can.',
    steps: ['Ask what the first three share: ostrich, penguin and kiwi are all flightless.', 'The eagle is a strong flier.', 'Three share the flightless trait, so the eagle is the exception.'],
    wrong: {
      0: 'The ostrich is flightless.',
      1: 'The penguin is flightless — it swims instead.',
      2: 'The kiwi is flightless — it has no keel on its sternum, like the ostrich and penguin.'
    }
  },
  {
    id: 'l29', tag: 'Odd one out', difficulty: 'medium', prompt: 'Which number does not belong?',
    options: ['8', '27', '64', '100'], answer: 3,
    why: '8, 27 and 64 are perfect cubes; 100 is not.',
    steps: ['Take cube roots: 2³ = 8, 3³ = 27, 4³ = 64.', '100 lies between 4³ = 64 and 5³ = 125, so it has no whole cube root.', '100 is a square (10²) but not a cube — so it is the odd one.'],
    wrong: {
      0: '8 = 2³ — a perfect cube, like the majority of this set.',
      1: '27 = 3³, which satisfies the cube rule exactly.',
      2: '64 = 4³, and also 8². It satisfies the cube rule.'
    }
  },
  {
    id: 'l30', tag: 'Syllogism', difficulty: 'medium', prompt: 'Some pens are red. All red things are colours. Which conclusion follows?',
    options: ['All pens are colours', 'Some pens are colours', 'No pen is a colour', 'All colours are pens'], answer: 1,
    why: 'Only the overlap is guaranteed: the pens that are red are colours.',
    steps: ['"Some pens are red" gives an overlap between pens and red things — not the whole set.', 'Those red pens fall inside "all red things are colours".', 'So the overlap survives: some pens are colours. Nothing more.'],
    wrong: {
      0: 'This upgrades "some" to "all". The premise never says every pen is red.',
      2: 'It contradicts the premises: the red pens are colours, so at least some pens are.',
      3: 'This reverses the arrow — colours are the wider category, pens the narrower one.'
    }
  }
]
