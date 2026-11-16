// Scores how well a student profile fits a company role.
// Pure functions only. No database or Express code in here, so it is easy to test.
// The result is a relevance estimate. It is not a hiring probability.

export const SCORE_NOTE = 'Relevance estimate, not a hiring probability.'

// Weights add up to 100. Documented in docs/matching-weights.md.
export const WEIGHTS = {
  skills: 40,
  careerInterest: 25,
  coursework: 20,
  experience: 15,
} as const

// Order matches sortOrder in the experience_levels seed data.
const EXPERIENCE_RANK: Record<string, number> = {
  'beginner / no internship': 1,
  'some project or work experience': 2,
  'previous internship experience': 3,
}

export interface StudentProfileInput {
  careerInterest: string
  skills: string[]
  coursework: string[]
  experienceLevel: string
}

export interface RoleInput {
  roleId: string
  title: string
  careerInterests: string[]
  skills: string[]
  coursework: string[]
  minimumExperienceLevel: { label: string; sortOrder: number } | null
}

export interface ScoreFactor {
  name: 'skills' | 'careerInterest' | 'coursework' | 'experience'
  weight: number
  earned: number
  detail: string
}

export interface MatchResult {
  roleId: string
  title: string
  score: number
  factors: ScoreFactor[]
  matchedSkills: string[]
  missingSkills: string[]
  missingCoursework: string[]
  note: string
}

export class MatchingInputError extends Error {}

function normalize(value: string): string {
  return value.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ')
}

function normalizeList(values: string[]): string[] {
  return [...new Set(values.map(normalize).filter((v) => v.length > 0))]
}

function validateStudent(student: StudentProfileInput): number {
  if (!student || typeof student.careerInterest !== 'string') {
    throw new MatchingInputError('Student profile needs a career interest.')
  }
  if (normalize(student.careerInterest) === '') {
    throw new MatchingInputError('Student profile needs a career interest.')
  }
  if (!Array.isArray(student.skills) || !Array.isArray(student.coursework)) {
    throw new MatchingInputError('Skills and coursework must be lists.')
  }
  const rank = EXPERIENCE_RANK[normalize(student.experienceLevel ?? '')]
  if (rank === undefined) {
    throw new MatchingInputError(
      `Unknown experience level: ${student.experienceLevel}`,
    )
  }
  return rank
}

// Share of the role's list that the student has, scaled to the weight.
function overlapPoints(
  required: string[],
  have: Set<string>,
  weight: number,
): { earned: number; missing: string[]; matched: string[] } {
  if (required.length === 0) {
    return { earned: weight, missing: [], matched: [] }
  }
  const matched = required.filter((item) => have.has(item))
  const missing = required.filter((item) => !have.has(item))
  return {
    earned: (matched.length / required.length) * weight,
    missing,
    matched,
  }
}

export function scoreMatch(
  student: StudentProfileInput,
  role: RoleInput,
): MatchResult {
  const studentRank = validateStudent(student)

  const studentSkills = new Set(normalizeList(student.skills))
  const studentCoursework = new Set(normalizeList(student.coursework))
  const roleSkills = normalizeList(role.skills)
  const roleCoursework = normalizeList(role.coursework)
  const roleInterests = normalizeList(role.careerInterests)

  const skills = overlapPoints(roleSkills, studentSkills, WEIGHTS.skills)
  const coursework = overlapPoints(
    roleCoursework,
    studentCoursework,
    WEIGHTS.coursework,
  )

  const interestMatch = roleInterests.includes(normalize(student.careerInterest))
  const interestEarned = interestMatch ? WEIGHTS.careerInterest : 0

  // Full credit if they meet the minimum, half credit if one level short.
  const minRank = role.minimumExperienceLevel?.sortOrder ?? 0
  const gap = Math.max(0, minRank - studentRank)
  const experienceEarned =
    gap === 0 ? WEIGHTS.experience : gap === 1 ? WEIGHTS.experience / 2 : 0

  const factors: ScoreFactor[] = [
    {
      name: 'skills',
      weight: WEIGHTS.skills,
      earned: round1(skills.earned),
      detail:
        roleSkills.length === 0
          ? 'Role lists no required skills.'
          : `${skills.matched.length} of ${roleSkills.length} skills matched.`,
    },
    {
      name: 'careerInterest',
      weight: WEIGHTS.careerInterest,
      earned: interestEarned,
      detail: interestMatch
        ? 'Role fits the chosen career interest.'
        : 'Role does not list the chosen career interest.',
    },
    {
      name: 'coursework',
      weight: WEIGHTS.coursework,
      earned: round1(coursework.earned),
      detail:
        roleCoursework.length === 0
          ? 'Role lists no related coursework.'
          : `${coursework.matched.length} of ${roleCoursework.length} courses matched.`,
    },
    {
      name: 'experience',
      weight: WEIGHTS.experience,
      earned: experienceEarned,
      detail:
        gap === 0
          ? 'Meets the minimum experience level.'
          : `Below the minimum experience level by ${gap}.`,
    },
  ]

  const total = factors.reduce((sum, factor) => sum + factor.earned, 0)

  return {
    roleId: role.roleId,
    title: role.title,
    score: Math.round(total),
    factors,
    matchedSkills: skills.matched,
    missingSkills: skills.missing,
    missingCoursework: coursework.missing,
    note: SCORE_NOTE,
  }
}

// Highest score first. Ties go to the title so the order stays the same every time.
export function rankRoles(
  student: StudentProfileInput,
  roles: RoleInput[],
): MatchResult[] {
  return roles
    .map((role) => scoreMatch(student, role))
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
}

function round1(value: number): number {
  return Math.round(value * 10) / 10
}
