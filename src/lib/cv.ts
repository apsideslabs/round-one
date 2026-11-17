/** Reads a pasted CV and pulls out what an interviewer would notice. */
const SKILLS = [
  'python', 'java', 'javascript', 'typescript', 'react', 'node', 'express', 'django', 'flask',
  'spring', 'sql', 'mysql', 'postgres', 'mongodb', 'redis', 'docker', 'kubernetes', 'aws', 'azure',
  'git', 'linux', 'c++', 'c', 'html', 'css', 'tailwind', 'next', 'vue', 'angular', 'flask', 'fastapi',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'pandas', 'numpy', 'opencv', 'nlp',
  'android', 'flutter', 'kotlin', 'swift', 'php', 'laravel', 'firebase', 'graphql', 'rest', 'kafka',
  'spark', 'hadoop', 'tableau', 'power bi', 'excel', 'figma', 'selenium', 'jest', 'pytest', 'ci/cd'
]

const PRETTY: Record<string, string> = {
  'c++': 'C++', 'c': 'C', 'sql': 'SQL', 'aws': 'AWS', 'nlp': 'NLP', 'css': 'CSS', 'html': 'HTML',
  'ci/cd': 'CI/CD', 'rest': 'REST', 'graphql': 'GraphQL', 'power bi': 'Power BI', 'opencv': 'OpenCV',
  'pytorch': 'PyTorch', 'tensorflow': 'TensorFlow', 'fastapi': 'FastAPI', 'next': 'Next.js'
}

export interface Profile {
  skills: string[]
  hasInternship: boolean
  projectCount: number
  cgpa: number | null
  graduationYear: number | null
  empty: boolean
}

export function readCV(text: string): Profile {
  const lower = text.toLowerCase()
  const skills = SKILLS.filter((s) => new RegExp(`(^|[^a-z0-9+#])${s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9+#]|$)`, 'i').test(lower))
  const pretty = skills.map((s) => PRETTY[s] ?? s.replace(/\b\w/g, (c) => c.toUpperCase()))
  const cgpaMatch = lower.match(/(?:cgpa|gpa)\s*[:\-–]?\s*(\d(?:\.\d{1,2})?)/)
  const yearMatch = lower.match(/\b(20[2-3]\d)\b/)
  return {
    skills: pretty,
    hasInternship: /intern(ship)?\b|interned/.test(lower),
    projectCount: Math.max(1, (lower.match(/project/g) ?? []).length ? Math.min(4, (lower.match(/project/g) ?? []).length) : 1),
    cgpa: cgpaMatch ? Number(cgpaMatch[1]) : null,
    graduationYear: yearMatch ? Number(yearMatch[1]) : null,
    empty: text.trim().length < 40
  }
}

export const saveCV = (text: string) => {
  try { localStorage.setItem('ro.cv', text) } catch { /* private mode */ }
}
export const loadCV = () => {
  try { return localStorage.getItem('ro.cv') ?? '' } catch { return '' }
}
