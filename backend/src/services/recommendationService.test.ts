import assert from 'node:assert/strict'
import { test } from 'node:test'
import { rankRoles, type StudentProfileInput } from '../matching/scoreMatch.ts'
import type {
  MatchingProfileRepository,
  SavedMatchingProfile,
} from '../repositories/matchingProfileRepository.ts'
import type {
  RecommendationRepository,
  RecommendationRole,
} from '../repositories/recommendationRepository.ts'
import { createRecommendationService } from './recommendationService.ts'

const profile: SavedMatchingProfile = {
  profileId: 'c0ffee00-0000-4000-8000-000000000010',
  careerInterest: 'Software Engineering',
  skills: ['TypeScript'],
  coursework: ['Data Structures'],
  experienceLevel: 'Beginner / No internship',
  createdAt: new Date('2026-11-14T20:00:00.000Z'),
  updatedAt: new Date('2026-11-14T21:00:00.000Z'),
}

const roles: RecommendationRole[] = [
  {
    roleId: 'role-weak',
    companyId: 'company-weak',
    slug: 'analyst',
    title: 'Analyst Intern',
    description: null,
    location: null,
    employmentType: 'INTERNSHIP',
    workArrangement: null,
    term: null,
    company: {
      companyId: 'company-weak',
      name: 'Example Analytics',
      slug: 'example-analytics',
    },
    minimumExperienceLevel: { label: 'Beginner / No internship', sortOrder: 1 },
    skills: ['Python'],
    coursework: ['Statistics'],
    careerInterests: ['Data Science'],
  },
  {
    roleId: 'role-strong',
    companyId: 'company-strong',
    slug: 'software-engineer',
    title: 'Software Engineer Intern',
    description: null,
    location: 'Charlotte, NC',
    employmentType: 'INTERNSHIP',
    workArrangement: 'HYBRID',
    term: 'Summer',
    company: {
      companyId: 'company-strong',
      name: 'Example Software',
      slug: 'example-software',
    },
    minimumExperienceLevel: { label: 'Beginner / No internship', sortOrder: 1 },
    skills: ['TypeScript'],
    coursework: ['Data Structures'],
    careerInterests: ['Software Engineering'],
  },
]

function createRepositories(
  options: {
    savedProfile?: SavedMatchingProfile | null
    availableRoles?: RecommendationRole[]
  } = {},
): {
  matchingProfileRepository: MatchingProfileRepository
  recommendationRepository: RecommendationRepository
} {
  return {
    matchingProfileRepository: {
      findForStudent: async () =>
        options.savedProfile === undefined ? profile : options.savedProfile,
      saveForStudent: async () => profile,
    },
    recommendationRepository: {
      listActiveRoles: async () => options.availableRoles ?? roles,
    },
  }
}

test('returns a missing-profile outcome without querying roles', async () => {
  const repositories = createRepositories({ savedProfile: null })
  let rolesQueried = false
  repositories.recommendationRepository.listActiveRoles = async () => {
    rolesQueried = true
    return roles
  }

  const service = createRecommendationService(
    repositories.matchingProfileRepository,
    repositories.recommendationRepository,
  )

  assert.deepEqual(await service.getRecommendations(), {
    status: 'missing-profile',
  })
  assert.equal(rolesQueried, false)
})

test('ranks roles and preserves each role company association', async () => {
  const repositories = createRepositories()
  const service = createRecommendationService(
    repositories.matchingProfileRepository,
    repositories.recommendationRepository,
  )

  const result = await service.getRecommendations()

  assert.equal(result.status, 'found')
  if (result.status !== 'found') {
    return
  }

  assert.deepEqual(
    result.recommendations.map(
      ({ roleId, title, companyId, companyName, companySlug }) => ({
        roleId,
        title,
        companyId,
        companyName,
        companySlug,
      }),
    ),
    [
      {
        roleId: 'role-strong',
        title: 'Software Engineer Intern',
        companyId: 'company-strong',
        companyName: 'Example Software',
        companySlug: 'example-software',
      },
      {
        roleId: 'role-weak',
        title: 'Analyst Intern',
        companyId: 'company-weak',
        companyName: 'Example Analytics',
        companySlug: 'example-analytics',
      },
    ],
  )
  const scores = result.recommendations.map(({ score }) => score)
  assert.deepEqual(scores, [100, 15])
  assert.ok(scores.every((score, index) => index === 0 || scores[index - 1] >= score))

  const student: StudentProfileInput = {
    careerInterest: profile.careerInterest,
    skills: profile.skills,
    coursework: profile.coursework,
    experienceLevel: profile.experienceLevel,
  }
  const rankedByMatcher = rankRoles(student, roles)
  assert.deepEqual(
    result.recommendations.map(
      ({
        roleId,
        title,
        score,
        factors,
        matchedSkills,
        missingSkills,
        missingCoursework,
        note,
      }) => ({
        roleId,
        title,
        score,
        factors,
        matchedSkills,
        missingSkills,
        missingCoursework,
        note,
      }),
    ),
    rankedByMatcher,
  )

  assert.deepEqual(result.recommendations[0].matchedSkills, ['typescript'])
  assert.deepEqual(result.recommendations[0].missingSkills, [])
  assert.deepEqual(result.recommendations[0].missingCoursework, [])
  assert.deepEqual(
    result.recommendations[0].factors.map(({ detail }) => detail),
    [
      '1 of 1 skills matched.',
      'Role fits the chosen career interest.',
      '1 of 1 courses matched.',
      'Meets the minimum experience level.',
    ],
  )
  assert.match(result.recommendations[0].note, /not a hiring probability/)
  assert.deepEqual(result.recommendations[1].missingSkills, ['python'])
  assert.deepEqual(result.recommendations[1].missingCoursework, ['statistics'])
})

test('returns an empty recommendation list when no roles are eligible', async () => {
  const repositories = createRepositories({ availableRoles: [] })
  const service = createRecommendationService(
    repositories.matchingProfileRepository,
    repositories.recommendationRepository,
  )

  assert.deepEqual(await service.getRecommendations(), {
    status: 'found',
    recommendations: [],
  })
})
