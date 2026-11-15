import { Router } from 'express'
import type { CompanyRepository } from '../repositories/companyRepository.ts'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function createCompanyRouter(repository: CompanyRepository): Router {
  const router = Router()

  router.get('/', async (_request, response) => {
    const companies = await repository.list()
    response.json(companies)
  })

  router.get('/:id', async (request, response) => {
    const { id } = request.params

    if (!UUID_PATTERN.test(id)) {
      response.status(404).json({ error: 'Company not found' })
      return
    }

    const company = await repository.findById(id)

    if (!company) {
      response.status(404).json({ error: 'Company not found' })
      return
    }

    response.json(company)
  })

  return router
}
