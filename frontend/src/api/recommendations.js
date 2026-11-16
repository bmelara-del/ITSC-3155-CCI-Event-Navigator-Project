import { API_BASE_URL } from './config.js'

const FACTOR_NAMES = new Set([
  'skills',
  'careerInterest',
  'coursework',
  'experience',
])

function isStringList(value) {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isScoreFactor(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    FACTOR_NAMES.has(value.name) &&
    Number.isFinite(value.weight) &&
    Number.isFinite(value.earned) &&
    typeof value.detail === 'string'
  )
}

function isRecommendation(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    typeof value.roleId === 'string' &&
    typeof value.title === 'string' &&
    typeof value.companyId === 'string' &&
    typeof value.companyName === 'string' &&
    typeof value.companySlug === 'string' &&
    Number.isFinite(value.score) &&
    value.score >= 0 &&
    value.score <= 100 &&
    Array.isArray(value.factors) &&
    value.factors.every(isScoreFactor) &&
    isStringList(value.matchedSkills) &&
    isStringList(value.missingSkills) &&
    isStringList(value.missingCoursework) &&
    typeof value.note === 'string'
  )
}

export async function fetchRecommendations({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/recommendations`, { signal })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error('Your recommendations could not be loaded.')
  }

  const result = await response.json()

  if (
    result === null ||
    typeof result !== 'object' ||
    !Array.isArray(result.recommendations) ||
    !result.recommendations.every(isRecommendation)
  ) {
    throw new Error('The recommendations response was invalid.')
  }

  return result.recommendations
}
