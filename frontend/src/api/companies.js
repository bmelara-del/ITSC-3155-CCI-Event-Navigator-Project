import { API_BASE_URL } from './config.js'

export async function fetchCompanyBySlug(slug, { signal } = {}) {
  const listResponse = await fetch(`${API_BASE_URL}/companies`, { signal })

  if (!listResponse.ok) {
    throw new Error('The company list could not be loaded.')
  }

  const companies = await listResponse.json()

  if (!Array.isArray(companies)) {
    throw new Error('The company list response was invalid.')
  }

  const company = companies.find(
    (item) => item && typeof item.slug === 'string' && item.slug === slug,
  )

  if (!company) {
    return null
  }

  if (typeof company.companyId !== 'string') {
    throw new Error('The company record did not include an ID.')
  }

  const detailsResponse = await fetch(
    `${API_BASE_URL}/companies/${encodeURIComponent(company.companyId)}`,
    { signal },
  )

  if (detailsResponse.status === 404) {
    return null
  }

  if (!detailsResponse.ok) {
    throw new Error('The company details could not be loaded.')
  }

  return detailsResponse.json()
}
