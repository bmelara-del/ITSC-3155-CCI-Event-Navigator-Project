import { northwindAnalytics, sampleCompanies } from './companies.js'

const companiesById = new Map(
  [northwindAnalytics, ...sampleCompanies].map((company) => [
    company.id,
    company,
  ]),
)

const demoRecommendations = [
  'northwind-analytics',
  'company-a',
  'company-b',
  'company-e',
  'company-d',
  'company-c',
  'company-f',
  'company-g',
  'company-h',
  'company-i',
]

export const sampleRecommendations = demoRecommendations.map(
  (companyId) => {
    const company = companiesById.get(companyId)

    if (!company) {
      throw new Error(`Missing sample company for recommendation "${companyId}".`)
    }

    return { ...company }
  },
)
