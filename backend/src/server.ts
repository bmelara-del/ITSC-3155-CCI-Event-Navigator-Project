import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { createApp } from './app.ts'
import { createCompanyRepository } from './repositories/companyRepository.ts'
import { createMatchingProfileRepository } from './repositories/matchingProfileRepository.ts'
import { DEVELOPMENT_STUDENT_ID } from './config/developmentStudent.ts'
import { PrismaClient } from './generated/prisma/client.ts'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in backend/.env.')
}

const pool = new Pool({ connectionString: databaseUrl })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })
const app = createApp(
  createCompanyRepository(prisma),
  createMatchingProfileRepository(prisma, DEVELOPMENT_STUDENT_ID),
)

const port = Number(process.env.PORT ?? 3001)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.')
}

const server = app.listen(port, () => {
  console.info(`Backend API listening on port ${port}`)
})

server.on('error', (error: Error) => {
  console.error(`Backend server failed to start on port ${port}: ${error.message}`)
  process.exitCode = 1
})

function shutdown(signal: string): void {
  console.info(`Received ${signal}; shutting down.`)

  server.close(async (error) => {
    if (error) {
      console.error('Error while closing the HTTP server:', error)
      process.exitCode = 1
    }

    try {
      await prisma.$disconnect()
      await pool.end()
    } catch (shutdownError) {
      console.error('Error while closing the database connection:', shutdownError)
      process.exitCode = 1
    }
  })
}

process.once('SIGINT', () => shutdown('SIGINT'))
process.once('SIGTERM', () => shutdown('SIGTERM'))
