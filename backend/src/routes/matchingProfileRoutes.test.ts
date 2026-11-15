import assert from 'node:assert/strict'
import { once } from 'node:events'
import { test } from 'node:test'
import { createApp } from '../app.ts'
import type { CompanyRepository } from '../repositories/companyRepository.ts'
import {
  MatchingProfileValidationError,
  type MatchingProfileInput,
  type MatchingProfileRepository,
  type SavedMatchingProfile,
} from '../repositories/matchingProfileRepository.ts'

const createdAt = new Date('2026-11-14T20:00:00.000Z')
const updatedAt = new Date('2026-11-14T21:00:00.000Z')

const savedProfile: SavedMatchingProfile = {
  profileId: 'c0ffee00-0000-4000-8000-000000000010',
  careerInterest: 'Software Engineering',
  skills: ['Java', 'SQL'],
  coursework: ['Data Structures'],
  experienceLevel: 'Beginner / No internship',
  createdAt,
  updatedAt,
}

const input: MatchingProfileInput = {
  careerInterest: 'Software Engineering',
  skills: ['Java', 'SQL'],
  coursework: ['Data Structures'],
  experienceLevel: 'Beginner / No internship',
}

const companyRepository: CompanyRepository = {
  list: async () => [],
  findById: async () => null,
}

async function startServer(repository: MatchingProfileRepository) {
  const server = createApp(companyRepository, repository).listen(0, '127.0.0.1')
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

function createRepository(
  overrides: Partial<MatchingProfileRepository> = {},
): MatchingProfileRepository {
  return {
    findForStudent: async () => savedProfile,
    saveForStudent: async () => savedProfile,
    ...overrides,
  }
}

test('GET /api/matching-profile returns the saved profile', async () => {
  const server = await startServer(createRepository())

  try {
    const response = await fetch(`${server.url}/api/matching-profile`)

    assert.equal(response.status, 200)
    assert.deepEqual(await response.json(), {
      ...savedProfile,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    })
  } finally {
    await server.close()
  }
})

test('GET /api/matching-profile returns 404 when no profile exists', async () => {
  const server = await startServer(
    createRepository({ findForStudent: async () => null }),
  )

  try {
    const response = await fetch(`${server.url}/api/matching-profile`)

    assert.equal(response.status, 404)
    assert.deepEqual(await response.json(), {
      error: 'Matching profile not found',
    })
  } finally {
    await server.close()
  }
})

test('PUT /api/matching-profile creates or updates the current development profile', async () => {
  let receivedInput: MatchingProfileInput | undefined
  const server = await startServer(
    createRepository({
      saveForStudent: async (profileInput) => {
        receivedInput = profileInput
        return savedProfile
      },
    }),
  )

  try {
    const response = await fetch(`${server.url}/api/matching-profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    assert.equal(response.status, 200)
    assert.deepEqual(receivedInput, input)
    assert.deepEqual(await response.json(), {
      ...savedProfile,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    })
  } finally {
    await server.close()
  }
})

test('PUT /api/matching-profile rejects invalid payloads', async () => {
  let saveCalled = false
  const server = await startServer(
    createRepository({
      saveForStudent: async () => {
        saveCalled = true
        return savedProfile
      },
    }),
  )

  try {
    const response = await fetch(`${server.url}/api/matching-profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, skills: 'Java' }),
    })

    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), {
      error: 'Invalid matching profile',
    })
    assert.equal(saveCalled, false)
  } finally {
    await server.close()
  }
})

test('PUT /api/matching-profile rejects unknown catalog choices', async () => {
  const server = await startServer(
    createRepository({
      saveForStudent: async () => {
        throw new MatchingProfileValidationError(
          'The career interest or experience level is not recognized.',
        )
      },
    }),
  )

  try {
    const response = await fetch(`${server.url}/api/matching-profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })

    assert.equal(response.status, 400)
    assert.deepEqual(await response.json(), {
      error: 'The career interest or experience level is not recognized.',
    })
  } finally {
    await server.close()
  }
})

test('unexpected profile repository errors do not expose internal details', async () => {
  const server = await startServer(
    createRepository({
      findForStudent: async () => {
        throw new Error('test-only database connection detail')
      },
    }),
  )

  try {
    const response = await fetch(`${server.url}/api/matching-profile`)

    assert.equal(response.status, 500)
    assert.deepEqual(await response.json(), {
      error: 'Internal server error',
    })
  } finally {
    await server.close()
  }
})
