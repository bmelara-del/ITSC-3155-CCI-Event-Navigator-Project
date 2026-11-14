import { northwindAnalytics, sampleCompanies } from './companies.js'

const companiesById = new Map(
  [northwindAnalytics, ...sampleCompanies].map((company) => [
    company.id,
    company,
  ]),
)

const demoRecommendations = [
  { companyId: 'northwind-analytics', matchPercent: 92 },
  { companyId: 'company-a', matchPercent: 89 },
  { companyId: 'company-b', matchPercent: 85 },
  { companyId: 'company-e', matchPercent: 82 },
  { companyId: 'company-d', matchPercent: 78 },
  { companyId: 'company-c', matchPercent: 74 },
  { companyId: 'company-f', matchPercent: 71 },
  { companyId: 'company-g', matchPercent: 69 },
  { companyId: 'company-h', matchPercent: 66 },
  { companyId: 'company-i', matchPercent: 63 },
]

export const sampleRecommendations = demoRecommendations.map(
  ({ companyId, matchPercent }) => {
    const company = companiesById.get(companyId)

    if (!company) {
      throw new Error(`Missing sample company for recommendation "${companyId}".`)
    }

    return { ...company, matchPercent }
  },
)
