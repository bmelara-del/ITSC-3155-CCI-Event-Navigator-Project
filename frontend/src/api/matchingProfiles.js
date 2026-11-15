import { API_BASE_URL } from './config.js'

function isMatchingProfile(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.careerInterest === 'string' &&
    Array.isArray(value.skills) &&
    value.skills.every((skill) => typeof skill === 'string') &&
    Array.isArray(value.coursework) &&
    value.coursework.every((course) => typeof course === 'string') &&
    typeof value.experienceLevel === 'string' &&
    typeof value.updatedAt === 'string'
  )
}

export async function fetchMatchingProfile({ signal } = {}) {
  const response = await fetch(`${API_BASE_URL}/matching-profile`, { signal })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error('Your matching profile could not be loaded.')
  }

  const profile = await response.json()

  if (!isMatchingProfile(profile)) {
    throw new Error('The matching profile response was invalid.')
  }

  return profile
}

export async function saveMatchingProfile(profile) {
  const response = await fetch(`${API_BASE_URL}/matching-profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })

  if (!response.ok) {
    if (response.status === 400) {
      const body = await response.json()
      throw new Error(
        typeof body.error === 'string'
          ? body.error
          : 'Please check your matching profile answers.',
      )
    }

    throw new Error('Your matching profile could not be saved.')
  }

  const savedProfile = await response.json()

  if (!isMatchingProfile(savedProfile)) {
    throw new Error('The saved matching profile response was invalid.')
  }

  return savedProfile
}
