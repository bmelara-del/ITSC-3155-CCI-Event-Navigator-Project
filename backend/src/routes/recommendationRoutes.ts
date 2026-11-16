import { Router } from 'express'
import type { RecommendationService } from '../services/recommendationService.ts'

export function createRecommendationRouter(
  service: RecommendationService,
): Router {
  const router = Router()

  router.get('/', async (_request, response) => {
    const result = await service.getRecommendations()

    if (result.status === 'missing-profile') {
      response.status(404).json({ error: 'Matching profile not found' })
      return
    }

    response.status(200).json({ recommendations: result.recommendations })
  })

  return router
}
