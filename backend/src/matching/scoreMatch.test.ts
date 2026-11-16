import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  MatchingInputError,
  SCORE_NOTE,
  WEIGHTS,
  rankRoles,
  scoreMatch,
  type RoleInput,
  type StudentProfileInput,
} from './scoreMatch.ts'

const softwareRole: RoleInput = {
  roleId: 'role-software',
  title: 'Software Intern',
  careerInterests: ['Software Engineering'],
  skills: ['TypeScript', 'React', 'SQL'],
  coursework: ['Data Structures', 'Databases'],
  minimumExperienceLevel: { label: 'Beginner / No internship', sortOrder: 1 },
}

const securityRole: RoleInput = {
  roleId: 'role-security',
  title: 'Security Analyst Intern',
  careerInterests: ['Cybersecurity'],
  skills: ['Networking', 'Python'],
  coursework: ['Computer Security'],
  minimumExperienceLevel: {
    label: 'Previous internship experience',
    sortOrder: 3,
  },
}

const strongSoftware: StudentProfileInput = {
  careerInterest: 'Software Engineering',
  skills: ['typescript', 'React', 'sql'],
  coursework: ['Data Structures', 'Databases'],
  experienceLevel: 'Some project or work experience',
}

const beginnerSoftware: StudentProfileInput = {
  careerInterest: 'Software Engineering',
  skills: ['React'],
  coursework: [],
  experienceLevel: 'Beginner / No internship',
}

const securityStudent: StudentProfileInput = {
  careerInterest: 'Cybersecurity',
  skills: ['Networking', 'Python'],
  coursework: ['Computer Security'],
  experienceLevel: 'Previous internship experience',
}

const dataStudent: StudentProfileInput = {
  careerInterest: 'Data Science',
  skills: ['Excel'],
  coursework: ['Statistics'],
  experienceLevel: 'Beginner / No internship',
}

test('weights add up to 100', () => {
  const total = Object.values(WEIGHTS).reduce((sum, w) => sum + w, 0)
  assert.equal(total, 100)
})

test('a student who fits everything gets 100', () => {
  const result = scoreMatch(strongSoftware, softwareRole)
  assert.equal(result.score, 100)
  assert.deepEqual(result.missingSkills, [])
  assert.deepEqual(result.missingCoursework, [])
})

test('every result has four factors and the relevance note', () => {
  const result = scoreMatch(strongSoftware, softwareRole)
  assert.equal(result.factors.length, 4)
  assert.equal(result.note, SCORE_NOTE)
  assert.match(result.note, /not a hiring probability/)
})

test('a beginner with one skill gets a partial score and sees what is missing', () => {
  const result = scoreMatch(beginnerSoftware, softwareRole)
  assert.deepEqual(result.matchedSkills, ['react'])
  assert.deepEqual(result.missingSkills, ['typescript', 'sql'])
  assert.deepEqual(result.missingCoursework, ['data structures', 'databases'])
  // skills 40/3 = 13.3, interest 25, coursework 0, experience 15
  assert.equal(result.score, 53)
})

test('skill matching ignores case and extra spaces', () => {
  const result = scoreMatch(
    { ...strongSoftware, skills: ['  TYPESCRIPT ', 'react', 'Sql'] },
    softwareRole,
  )
  assert.deepEqual(result.missingSkills, [])
})

test('a different career interest loses the interest points', () => {
  const result = scoreMatch(
    { ...securityStudent, careerInterest: 'Data Science' },
    securityRole,
  )
  const interest = result.factors.find((f) => f.name === 'careerInterest')
  assert.equal(interest?.earned, 0)
  assert.equal(result.score, 75)
})

test('one level below the minimum gets half the experience points', () => {
  const result = scoreMatch(
    { ...securityStudent, experienceLevel: 'Some project or work experience' },
    securityRole,
  )
  const experience = result.factors.find((f) => f.name === 'experience')
  assert.equal(experience?.earned, WEIGHTS.experience / 2)
})

test('two levels below the minimum gets no experience points', () => {
  const result = scoreMatch(
    { ...securityStudent, experienceLevel: 'Beginner / No internship' },
    securityRole,
  )
  const experience = result.factors.find((f) => f.name === 'experience')
  assert.equal(experience?.earned, 0)
})

test('a role with no listed skills or courses does not punish the student', () => {
  const openRole: RoleInput = {
    ...softwareRole,
    skills: [],
    coursework: [],
  }
  const result = scoreMatch(dataStudent, openRole)
  const skills = result.factors.find((f) => f.name === 'skills')
  const coursework = result.factors.find((f) => f.name === 'coursework')
  assert.equal(skills?.earned, WEIGHTS.skills)
  assert.equal(coursework?.earned, WEIGHTS.coursework)
})

test('the same input always gives the same score', () => {
  const first = scoreMatch(beginnerSoftware, softwareRole)
  const second = scoreMatch(beginnerSoftware, softwareRole)
  assert.deepEqual(first, second)
})

test('rankRoles puts the best fit first for different students', () => {
  const roles = [securityRole, softwareRole]
  assert.equal(rankRoles(strongSoftware, roles)[0].roleId, 'role-software')
  assert.equal(rankRoles(securityStudent, roles)[0].roleId, 'role-security')
})

test('rankRoles breaks ties by title', () => {
  const twin: RoleInput = { ...softwareRole, roleId: 'role-a', title: 'A Intern' }
  const ranked = rankRoles(strongSoftware, [softwareRole, twin])
  assert.deepEqual(
    ranked.map((r) => r.title),
    ['A Intern', 'Software Intern'],
  )
})

test('an empty career interest is rejected', () => {
  assert.throws(
    () => scoreMatch({ ...strongSoftware, careerInterest: '   ' }, softwareRole),
    MatchingInputError,
  )
})

test('an unknown experience level is rejected', () => {
  assert.throws(
    () => scoreMatch({ ...strongSoftware, experienceLevel: 'Expert' }, softwareRole),
    MatchingInputError,
  )
})

test('skills that are not a list are rejected', () => {
  const bad = { ...strongSoftware, skills: 'React' } as unknown as StudentProfileInput
  assert.throws(() => scoreMatch(bad, softwareRole), MatchingInputError)
})
