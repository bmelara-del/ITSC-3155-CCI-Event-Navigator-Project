import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { Prisma, PrismaClient } from '../generated/prisma/client.ts'
import { createRecommendationRepository } from './recommendationRepository.ts'

test('listActiveRoles queries active roles at active companies in one call', async () => {
  let query: Prisma.RoleFindManyArgs | undefined
  let queryCount = 0
  const prisma = {
    role: {
      async findMany(args: Prisma.RoleFindManyArgs) {
        query = args
        queryCount += 1
        return []
      },
    },
  } as unknown as PrismaClient

  const repository = createRecommendationRepository(prisma)
  assert.deepEqual(await repository.listActiveRoles(), [])

  assert.equal(queryCount, 1)
  assert.deepEqual(query?.where, {
    isActive: true,
    company: { is: { isActive: true } },
  })
})
