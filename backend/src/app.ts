import cors from 'cors'
import express, { type ErrorRequestHandler } from 'express'
import { createCompanyRouter } from './routes/companyRoutes.ts'
import type { CompanyRepository } from './repositories/companyRepository.ts'
import { createMatchingProfileRouter } from './routes/matchingProfileRoutes.ts'
import type { MatchingProfileRepository } from './repositories/matchingProfileRepository.ts'

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
])

export function createApp(
  companyRepository: CompanyRepository,
  matchingProfileRepository?: MatchingProfileRepository,
) {
  const app = express()

  app.use(
    cors({
      origin(origin, callback) {
        callback(null, origin === undefined || allowedOrigins.has(origin))
      },
    }),
  )
  app.use(express.json())

  app.get('/api/health', (_request, response) => {
    response.status(200).json({ status: 'ok', message: 'Server is running' })
  })

  app.use('/api/companies', createCompanyRouter(companyRepository))
  if (matchingProfileRepository) {
    app.use(
      '/api/matching-profile',
      createMatchingProfileRouter(matchingProfileRepository),
    )
  }

  const errorHandler: ErrorRequestHandler = (
    error,
    _request,
    response,
    next,
  ) => {
    if (response.headersSent) {
      next(error)
      return
    }

    console.error('Unhandled API error:', error)
    response.status(500).json({ error: 'Internal server error' })
  }

  app.use(errorHandler)

  return app
}
