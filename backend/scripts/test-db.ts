import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { PrismaClient } from '../src/generated/prisma/client.ts'

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null || !('code' in error)) {
    return undefined
  }

  const { code } = error
  return typeof code === 'string' ? code : undefined
}

function explainFailure(error: unknown): string {
  const code = getErrorCode(error)

  switch (code) {
    case 'P1000':
    case '28P01':
      return 'PostgreSQL rejected the credentials. Check the username and password in backend/.env.'
    case 'P1001':
    case 'ECONNREFUSED':
    case 'ENOTFOUND':
    case 'ETIMEDOUT':
      return 'PostgreSQL could not be reached. Check that the server is running and the host and port in backend/.env are correct.'
    case 'P1003':
      return 'The configured PostgreSQL database does not exist. Check the database name in backend/.env.'
    case 'P2021':
      return 'The companies table is missing. Apply the existing Prisma migrations to this development database.'
    default:
      return 'The database query failed. Check the PostgreSQL server, backend/.env, and migration status.'
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in backend/.env.')
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    const company = await prisma.company.findFirst({
      select: {
        companyId: true,
        name: true,
        industry: true,
      },
      orderBy: { name: 'asc' },
    })

    if (!company) {
      console.error(
        'Database connection succeeded, but no companies were found. Apply the existing migrations and run the approved development seed.',
      )
      process.exitCode = 1
      return
    }

    console.info('Company query succeeded:')
    console.info(`ID: ${company.companyId}`)
    console.info(`Name: ${company.name}`)
    console.info(`Industry: ${company.industry}`)
    console.info('Database connectivity test passed.')
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch((error: unknown) => {
  console.error(`Database connectivity test failed. ${explainFailure(error)}`)
  process.exitCode = 1
})
