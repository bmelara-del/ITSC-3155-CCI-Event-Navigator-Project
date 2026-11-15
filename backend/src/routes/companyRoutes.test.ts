import assert from 'node:assert/strict'
import { once } from 'node:events'
import { test } from 'node:test'
import { createApp } from '../app.ts'
import type {
  CompanyDetails,
  CompanyRepository,
} from '../repositories/companyRepository.ts'

const companyId = 'c0ffee00-0000-4000-8000-000000000001'
const createdAt = new Date('2026-01-01T00:00:00.000Z')

const companySummary = {
  companyId,
  slug: 'example-company',
  name: 'Example Company',
  industry: 'Technology',
  description: 'Example description',
  website: 'https://example.com',
  isActive: true,
  createdAt,
  updatedAt: createdAt,
}

const companyDetails: CompanyDetails = {
  ...companySummary,
  roles: [
    {
      roleId: 'c0ffee00-0000-4000-8000-000000000002',
      companyId,
      slug: 'software-intern',
      title: 'Software Intern',
      description: 'Build software.',
      location: 'Charlotte, NC',
      employmentType: 'INTERNSHIP',
      workArrangement: 'HYBRID',
      term: 'Summer',
      minimumExperienceLevelId: 'c0ffee00-0000-4000-8000-000000000003',
      isActive: true,
      createdAt,
      updatedAt: createdAt,
      minimumExperienceLevel: {
        experienceLevelId: 'c0ffee00-0000-4000-8000-000000000003',
        code: 'beginner',
        label: 'Beginner',
        sortOrder: 1,
      },
      skills: [
        {
          skillId: 'c0ffee00-0000-4000-8000-000000000004',
          name: 'TypeScript',
          normalizedName: 'typescript',
        },
      ],
      coursework: [
        {
          courseworkId: 'c0ffee00-0000-4000-8000-000000000005',
          name: 'Data Structures',
          normalizedName: 'data structures',
        },
      ],
      careerInterests: [
        {
          careerInterestId: 'c0ffee00-0000-4000-8000-000000000006',
          code: 'software-engineering',
          label: 'Software Engineering',
        },
      ],
    },
  ],
}

async function startServer(repository: CompanyRepository) {
  const server = createApp(repository).listen(0, '127.0.0.1')
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
  overrides: Partial<CompanyRepository> = {},
): CompanyRepository {
  return {
    list: async () => [companySummary],
    findById: async (id) => (id === companyId ? companyDetails : null),
    ...overrides,
  }
}

test('GET /api/companies returns database company summaries as JSON', async () => {
  const server = await startServer(createRepository())

  try {
    const response = await fetch(`${server.url}/api/companies`)
    assert.equal(response.status, 200)
    assert.deepEqual(
      await response.json(),
      JSON.parse(JSON.stringify([companySummary])),
    )
  } finally {
    await server.close()
  }
})

test('GET /api/companies/:id returns company roles and requirements', async () => {
  const server = await startServer(createRepository())

  try {
    const response = await fetch(`${server.url}/api/companies/${companyId}`)
    assert.equal(response.status, 200)
    assert.deepEqual(
      await response.json(),
      JSON.parse(JSON.stringify(companyDetails)),
    )
  } finally {
    await server.close()
  }
})

test('GET /api/companies/:id returns 404 for a missing company', async () => {
  const server = await startServer(
    createRepository({ findById: async () => null }),
  )

  try {
    const response = await fetch(
      `${server.url}/api/companies/c0ffee00-0000-4000-8000-000000000099`,
    )
    assert.equal(response.status, 404)
    assert.deepEqual(await response.json(), { error: 'Company not found' })
  } finally {
    await server.close()
  }
})

test('database errors return a generic response without internal details', async () => {
  const server = await startServer(
    createRepository({
      list: async () => {
        throw new Error('test-only database connection detail')
      },
    }),
  )
  const originalConsoleError = console.error
  console.error = () => {}

  try {
    const response = await fetch(`${server.url}/api/companies`)
    const body = await response.json()

    assert.equal(response.status, 500)
    assert.deepEqual(body, { error: 'Internal server error' })
    assert.doesNotMatch(JSON.stringify(body), /test-only/)
  } finally {
    console.error = originalConsoleError
    await server.close()
  }
})
