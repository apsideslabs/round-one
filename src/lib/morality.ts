import { dilemmas, type MoralOption, type Stage } from '@/data/morality'

export type SchemaId = 'personal' | 'norms' | 'post'

export const schemas: Record<SchemaId, { label: string; short: string; blurb: string; colour: string }> = {
  personal: {
    label: 'Personal interest',
    short: 'Personal',
    blurb: 'Stages 2–3: what this costs me, what I get back, and how the people around me will read it.',
    colour: '#f5b01b'
  },
  norms: {
    label: 'Maintaining norms',
    short: 'Norms',
    blurb: 'Stage 4: the rule, the policy, the fair procedure — the system is what makes an answer right.',
    colour: '#0e8c6a'
  },
  post: {
    label: 'Post-conventional',
    short: 'Principled',
    blurb: 'Stages 5–6: rights, consent and principles you would apply even when the rule or the room disagrees.',
    colour: '#2f5bff'
  }
}

/** Rest's DIT clusters stages 2–3 together as the personal-interest schema. */
export const schemaOf = (stage: Stage): SchemaId => (stage >= 5 ? 'post' : stage === 4 ? 'norms' : 'personal')

export interface MoralityResult {
  total: number
  bySchema: Record<SchemaId, number>
  share: Record<SchemaId, number>
  byStage: Record<Stage, number>
  care: number
  dominant: SchemaId
  mixed: boolean
  band: { title: string; line: string; practice: string }
}

export function rate(choices: MoralOption[]): MoralityResult {
  const bySchema: Record<SchemaId, number> = { personal: 0, norms: 0, post: 0 }
  const byStage: Record<Stage, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }
  let care = 0

  for (const choice of choices) {
    bySchema[schemaOf(choice.stage)] += 1
    byStage[choice.stage] += 1
    if (choice.care) care += 1
  }

  const total = choices.length || 1
  const share = {
    personal: Math.round((bySchema.personal / total) * 100),
    norms: Math.round((bySchema.norms / total) * 100),
    post: Math.round((bySchema.post / total) * 100)
  }

  const ranked = (Object.keys(bySchema) as SchemaId[]).sort((a, b) => bySchema[b] - bySchema[a])
  const dominant = ranked[0]
  const tie = bySchema[ranked[0]] === bySchema[ranked[1]]
  const thinPlurality = total > 0 && bySchema[ranked[0]] / total < 0.4
  const mixed = choices.length === 0 ? true : tie || thinPlurality

  const bands: Record<SchemaId, { title: string; line: string; practice: string }> = {
    personal: {
      title: 'Personal-interest voice',
      line: 'You reach first for what an answer costs you and the people closest to it. That is the most common pattern in a room of candidates, and it reads as cautious rather than wrong.',
      practice: 'Before you answer, ask one more question: who is not in this room and still affected?'
    },
    norms: {
      title: 'Maintaining-norms voice',
      line: 'You reach for the rule, the policy, the fair procedure. This is the voice interviewers find easiest to trust — and the easiest to hide behind.',
      practice: 'Try answering one dilemma a week without citing a rule at all. What is the reason under the rule?'
    },
    post: {
      title: 'Post-conventional voice',
      line: 'You reason from rights, consent and principles you would hold even when the room disagrees. It reads as principled — and it has to survive being inconvenient.',
      practice: 'Test it: name a case where your principle costs you something and you would still hold it.'
    }
  }

  return {
    total: choices.length,
    bySchema,
    share,
    byStage,
    care,
    dominant,
    mixed,
    band: mixed
      ? {
          title: 'Transitional',
          line: 'No single schema dominates — you moved between cost, rule and principle depending on the dilemma. That is normal, and often the most flexible place to be.',
          practice: 'Pick the two dilemmas where you hesitated and rewrite the answer you did not choose.'
        }
      : bands[dominant]
  }
}

export const dilemmaCount = dilemmas.length
