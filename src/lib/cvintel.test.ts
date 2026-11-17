import { describe, expect, it } from 'vitest'
import { parseCV, unusedSkills } from './cvintel'
import { buildPersonalQuestions } from '@/data/personal'

const CV = `
Ritika Sharma
Education
B.Tech Computer Science, CGPA: 6.4, 2026
Experience
Internship at Zeta Systems
Projects
Campus Timetable Tool
Built a Flask app used by 300 students across three departments
Invoice Reconciliation
Reduced manual checks from 4 hours to 20 minutes using Python and SQL
Skills
Python, React, SQL, Docker, Kafka
`

describe('cv intel', () => {
  const intel = parseCV(CV)

  it('reads the numbers, skills and internship', () => {
    expect(intel.cgpa).toBeCloseTo(6.4)
    expect(intel.hasInternship).toBe(true)
    expect(intel.skills).toContain('Python')
    expect(intel.metrics.join(' ')).toMatch(/300 students|20 minutes/)
  })

  it('finds projects by structure', () => {
    expect(intel.projects.join(' ').toLowerCase()).toContain('timetable')
  })

  it('finds a skill that no bullet ever shows', () => {
    expect(unusedSkills(intel)).toContain('Kafka')
  })

  it('writes questions that quote the candidate back at them', () => {
    const qs = buildPersonalQuestions(intel)
    expect(qs.length).toBeGreaterThanOrEqual(4)
    const text = qs.map((q) => q.ask).join(' | ')
    expect(text).toMatch(/timetable/i)
    expect(text).toMatch(/React|Docker|Kafka/)
    expect(text).toMatch(/300 students|4 hours|20 minutes/)
    expect(qs.every((q) => q.opts.length === 4 && q.model.length > 40)).toBe(true)
  })

  it('says so plainly when the CV has no numbers', () => {
    const noNumbers = parseCV('Skills\nPython, React\nProjects\nA small website built for a club')
    expect(buildPersonalQuestions(noNumbers).some((q) => /not one line/i.test(q.ask))).toBe(true)
  })
})
