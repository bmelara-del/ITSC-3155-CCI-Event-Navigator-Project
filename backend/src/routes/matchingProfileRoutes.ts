import { Router } from 'express'
import {
  MatchingProfileValidationError,
  type MatchingProfileInput,
  type MatchingProfileRepository,
} from '../repositories/matchingProfileRepository.ts'

function isStringList(value: unknown, maximumLength: number): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'string' &&
        item.trim().length > 0 &&
        item.length <= maximumLength,
    )
  )
}

function isMatchingProfileInput(value: unknown): value is MatchingProfileInput {
  if (!value || typeof value !== 'object') {
    return false
  }

  const profile = value as Record<string, unknown>

  return (
    typeof profile.careerInterest === 'string' &&
    profile.careerInterest.trim().length > 0 &&
    profile.careerInterest.length <= 120 &&
    isStringList(profile.skills, 120) &&
    isStringList(profile.coursework, 180) &&
    typeof profile.experienceLevel === 'string' &&
    profile.experienceLevel.trim().length > 0 &&
    profile.experienceLevel.length <= 160
  )
}

export function createMatchingProfileRouter(
  repository: MatchingProfileRepository,
): Router {
  const router = Router()

  router.get('/', async (_request, response) => {
    const profile = await repository.findForStudent()

    if (!profile) {
      response.status(404).json({ error: 'Matching profile not found' })
      return
    }

    response.json(profile)
  })

  router.put('/', async (request, response) => {
    if (!isMatchingProfileInput(request.body)) {
      response.status(400).json({ error: 'Invalid matching profile' })
      return
    }

    try {
      response.json(await repository.saveForStudent(request.body))
    } catch (error) {
      if (error instanceof MatchingProfileValidationError) {
        response.status(400).json({ error: error.message })
        return
      }
      throw error
    }
  })

  return router
}
