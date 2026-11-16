import assert from 'node:assert/strict'
import { once } from 'node:events'
import express, { type ErrorRequestHandler, type Express } from 'express'
import { test } from 'node:test'
import { createApp } from '../app.ts'
import type { CompanyRepository } from '../repositories/companyRepository.ts'
import type {
  MatchingProfileRepository,
  SavedMatchingProfile,
} from '../repositories/matchingProfileRepository.ts'
import type {
  RecommendationRepository,
  RecommendationRole,
} from '../repositories/recommendationRepository.ts'
import { createRecommendationService } from '../services/recommendationService.ts'
import type {
  RecommendationService,
  RecommendedRole,
} from '../services/recommendationService.ts'
import { createRecommendationRouter } from './recommendationRoutes.ts'

const savedProfile: SavedMatchingProfile = {
  profileId: 'c0ffee00-0000-4000-8000-000000000003',
  careerInterest: 'Software Engineering',
  skills: ['TypeScript'],
  coursework: ['Data Structures'],
  experienceLevel: 'Beginner / No internship',
  createdAt: new Date('2026-11-14T20:00:00.000Z'),
  updatedAt: new Date('2026-11-14T21:00:00.000Z'),
}

const role: RecommendationRole = {
  roleId: 'c0ffee00-0000-4000-8000-000000000001',
  companyId: 'c0ffee00-0000-4000-8000-000000000002',
  slug: 'software-intern',
  title: 'Software Intern',
  description: 'Build software.',
  location: 'Charlotte, NC',
  employmentType: 'INTERNSHIP',
  workArrangement: 'HYBRID',
  term: 'Summer',
  company: {
    companyId: 'c0ffee00-0000-4000-8000-000000000002',
    name: 'Example Company',
    slug: 'example-company',
  },
  minimumExperienceLevel: { label: 'Beginner / No internship', sortOrder: 1 },
  skills: ['TypeScript'],
  coursework: ['Data Structures'],
  careerInterests: ['Software Engineering'],
}

const recommendation: RecommendedRole = {
  roleId: role.roleId,
  title: role.title,
  companyId: role.company.companyId,
  companyName: role.company.name,
  companySlug: role.company.slug,
  score: 100,
  factors: [
    { name: 'skills', weight: 40, earned: 40, detail: '1 of 1 skills matched.' },
    {
      name: 'careerInterest',
      weight: 25,
      earned: 25,
      detail: 'Role fits the chosen career interest.',
    },
    {
      name: 'coursework',
      weight: 20,
      earned: 20,
      detail: '1 of 1 courses matched.',
    },
    {
      name: 'experience',
      weight: 15,
      earned: 15,
      detail: 'Meets the minimum experience level.',
    },
  ],
  matchedSkills: ['typescript'],
  missingSkills: [],
  missingCoursework: [],
  note: 'Relevance estimate, not a hiring probability.',
}

async function startServer(app: Express) {
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')

  const address = server.address()

  if (!address || typeof address === 'string') {
    throw new Error('The test server did not bind to a TCP address.')
  }

  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()))
      }),
  }
}

function createRouteTestApp(service: RecommendationService) {
  const app = express()
  app.use('/api/recommendations', createRecommendationRouter(service))

  const errorHandler: ErrorRequestHandler = (
    _error,
    _request,
    response,
    _next,
  ) => {
    response.status(500).json({ error: 'Internal server error' })
  }
  app.use(errorHandler)

  return app
}

function createService(
  profile: SavedMatchingProfile | null,
  listActiveRoles: RecommendationRepository['listActiveRoles'],
): RecommendationService {
  const matchingProfileRepository: MatchingProfileRepository = {
    findForStudent: async () => profile,
    saveForStudent: async () => {
      if (!profile) {
        throw new Error('No matching profile is available in this test.')
      }
      return profile
    },
  }
  const recommendationRepository: RecommendationRepository = {
    listActiveRoles,
  }

  return createRecommendationService(
    matchingProfileRepository,
    recommendationRepository,
  )
}

test('GET / returns recommendations when a saved profile exists', async () => {
  const server = await startServer(
    createRouteTestApp(
      createService(savedProfile, async () => [role]),
    ),
  )

  try {
    const response = await fetch(`${server.url}/api/recommendations`)

    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), {
      recommendations: [recommendation],
    })
  } finally {
    await server.close()
  }
})

test('GET / returns 404 when no matching profile exists', async () => {
  const server = await startServer(
    createRouteTestApp(createService(null, async () => [role])),
  )

  try {
    const response = await fetch(`${server.url}/api/recommendations`)

    assert.equal(response.status, 404)
    assert.deepEqual(await response.json(), {
      error: 'Matching profile not found',
    })
  } finally {
    await server.close()
  }
})

test('GET / returns an empty list when no recommendations are available', async () => {
  const server = await startServer(
    createRouteTestApp(
      createService(savedProfile, async () => []),
    ),
  )

  try {
    const response = await fetch(`${server.url}/api/recommendations`)

    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), { recommendations: [] })
  } finally {
    await server.close()
  }
})

test('GET / passes unexpected errors to the Express error handler', async () => {
  const server = await startServer(
    createRouteTestApp(
      createService(savedProfile, async () => {
        throw new Error('test-only database connection detail')
      }),
    ),
  )

  try {
    const response = await fetch(`${server.url}/api/recommendations`)
    const body = await response.json()

    assert.equal(response.status, 500)
    assert.deepEqual(body, { error: 'Internal server error' })
    assert.doesNotMatch(JSON.stringify(body), /database/)
  } finally {
    await server.close()
  }
})

test('createApp mounts the injected recommendations router', async () => {
  const companyRepository: CompanyRepository = {
    list: async () => [],
    findById: async () => null,
  }
  const matchingProfileRepository: MatchingProfileRepository = {
    findForStudent: async () => null,
    saveForStudent: async () => {
      throw new Error('Saving a profile is not used in this test.')
    },
  }
  const app = createApp(
    companyRepository,
    matchingProfileRepository,
    createService(savedProfile, async () => [role]),
  )
  const server = await startServer(app)

  try {
    const response = await fetch(`${server.url}/api/recommendations`)

    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), {
      recommendations: [recommendation],
    })
  } finally {
    await server.close()
  }
})
