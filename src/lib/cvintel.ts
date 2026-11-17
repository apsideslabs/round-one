/**
 * A CV reader with no model behind it: sections, bullets, projects, numbers,
 * verbs and skill-to-project links, all from structure and word lists. It is
 * deliberately dumb about meaning and deliberately good at quotation — quoting
 * the candidate's own line is what makes a question feel personal.
 */
const SKILLS = [
  'python', 'java', 'javascript', 'typescript', 'react', 'node', 'express', 'django', 'flask',
  'spring', 'sql', 'mysql', 'postgres', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'azure',
  'git', 'linux', 'c++', 'html', 'css', 'tailwind', 'next', 'vue', 'angular', 'fastapi',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'opencv', 'nlp',
  'android', 'flutter', 'kotlin', 'swift', 'php', 'laravel', 'firebase', 'graphql', 'rest', 'kafka',
  'spark', 'hadoop', 'tableau', 'power bi', 'excel', 'figma', 'selenium', 'jest', 'pytest', 'ci/cd'
]

const VERBS = ['led', 'built', 'designed', 'developed', 'implemented', 'migrated', 'optimised', 'optimized',
  'automated', 'deployed', 'shipped', 'launched', 'mentored', 'managed', 'reduced', 'improved', 'created']

const PRETTY: Record<string, string> = {
  'c++': 'C++', 'sql': 'SQL', 'aws': 'AWS', 'nlp': 'NLP', 'css': 'CSS', 'html': 'HTML',
  'ci/cd': 'CI/CD', 'rest': 'REST', 'graphql': 'GraphQL', 'power bi': 'Power BI', 'opencv': 'OpenCV',
  'pytorch': 'PyTorch', 'tensorflow': 'TensorFlow', 'fastapi': 'FastAPI', 'next': 'Next.js'
}

const SECTION_WORDS: Record<string, string[]> = {
  education: ['education', 'academic', 'qualification'],
  experience: ['experience', 'internship', 'employment', 'work history'],
  projects: ['project', 'projects'],
  skills: ['skills', 'technologies', 'tech stack'],
  achievements: ['achievement', 'award', 'certification', 'extra']
}

export interface CVIntel {
  skills: string[]
  projects: string[]
  bullets: string[]
  metrics: string[]
  verbs: string[]
  companies: string[]
  hasInternship: boolean
  cgpa: number | null
  year: number | null
  empty: boolean
}

const clean = (l: string) => l.replace(/^[\s•\-*·–—>|]+/, '').replace(/\s+/g, ' ').trim()

export function parseCV(text: string): CVIntel {
  const rawLines = text.split(/\r?\n/).map(clean).filter(Boolean)
  const lower = text.toLowerCase()

  const skills = SKILLS.filter((s) =>
    new RegExp(`(^|[^a-z0-9+#])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9+#]|$)`, 'i').test(lower)
  ).map((s) => PRETTY[s] ?? s.replace(/\b\w/g, (c) => c.toUpperCase()))

  // sections by heading line
  let section = ''
  const bullets: string[] = []
  const projects: string[] = []
  const companies: string[] = []

  for (const line of rawLines) {
    const low = line.toLowerCase().replace(/[^a-z ]/g, '')
    const heading = Object.entries(SECTION_WORDS).find(([, words]) => words.some((w) => low.trim() === w || low.startsWith(w)))
    if (heading && line.length < 40) { section = heading[0]; continue }

    // bullets are achievement lines, not the skills list — a comma-separated
    // list of technologies is not evidence of using them
    const looksLikeList = (line.match(/,/g) ?? []).length >= 3 && line.split(/\s+/).length < 12
    if (!looksLikeList && section !== 'skills' && line.split(/\s+/).length >= 5) bullets.push(line)

    if (section === 'projects') {
      // a short title line: no verb, no full stop, few words
      const words = line.split(/\s+/).length
      const hasVerb = /\b(built|developed|created|made|designed|implemented|using|with)\b/i.test(line)
      if (line.length <= 60 && words <= 6 && !hasVerb && !/[.;]$/.test(line)) {
        projects.push(line.split(/[–—|:]/)[0].trim())
      }
    }
    if (section === 'experience') {
      const m = line.match(/(?:at|@)\s+([A-Z][\w&.]+(?:\s+[A-Z][\w&.]+){0,2})/)
      if (m) companies.push(m[1])
    }
  }

  const metrics = [...new Set((text.match(/\b\d{1,4}(?:\.\d+)?\s?(?:%|percent|hours?|hrs?|minutes?|mins?|days?|weeks?|months?|users?|students?|people|k\b|lakh|crore)/gi) ?? []).map((s) => s.trim()))]
  const verbs = [...new Set(VERBS.filter((v) => new RegExp(`\\b${v}\\b`, 'i').test(lower)))]
  const cgpaMatch = lower.match(/(?:cgpa|gpa)\s*[:\-–]?\s*(\d(?:\.\d{1,2})?)/)
  const yearMatch = text.match(/\b(20[2-3]\d)\b/)

  return {
    skills,
    projects: [...new Set(projects)].slice(0, 4),
    bullets: bullets.slice(0, 12),
    metrics,
    verbs,
    companies: [...new Set(companies)].slice(0, 3),
    hasInternship: /intern(ship)?\b|interned/.test(lower),
    cgpa: cgpaMatch ? Number(cgpaMatch[1]) : null,
    year: yearMatch ? Number(yearMatch[1]) : null,
    empty: text.trim().length < 40
  }
}

/** Which skills appear in the same line as a given project — a crude but useful link. */
export function skillsForProject(intel: CVIntel, project: string): string[] {
  const line = intel.bullets.find((b) => b.toLowerCase().includes(project.toLowerCase().slice(0, 18)))
  if (!line) return intel.skills.slice(0, 2)
  const low = line.toLowerCase()
  return intel.skills.filter((s) => low.includes(s.toLowerCase())).slice(0, 3)
}

/** Skills the CV claims but no bullet ever shows being used. */
export function unusedSkills(intel: CVIntel): string[] {
  const shown = new Set<string>()
  for (const b of intel.bullets) {
    const low = b.toLowerCase()
    for (const s of intel.skills) if (low.includes(s.toLowerCase())) shown.add(s)
  }
  return intel.skills.filter((s) => !shown.has(s))
}
