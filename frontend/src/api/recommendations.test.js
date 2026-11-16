import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchRecommendations } from './recommendations.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

const recommendation = {
  roleId: 'role-1',
  title: 'Software Intern',
  companyId: 'company-1',
  companyName: 'Example Company',
  companySlug: 'example-company',
  score: 85,
  factors: [
    { name: 'skills', weight: 40, earned: 30, detail: '3 of 4 skills matched.' },
    {
      name: 'careerInterest',
      weight: 25,
      earned: 25,
      detail: 'Role fits the chosen career interest.',
    },
    {
      name: 'coursework',
      weight: 20,
      earned: 15,
      detail: '3 of 4 courses matched.',
    },
    {
      name: 'experience',
      weight: 15,
      earned: 15,
      detail: 'Meets the minimum experience level.',
    },
  ],
  matchedSkills: ['typescript'],
  missingSkills: ['sql'],
  missingCoursework: ['databases'],
  note: 'Relevance estimate, not a hiring probability.',
}

describe('fetchRecommendations', () => {
  it('fetches and returns the backend recommendations without dropping match details', async () => {
    const controller = new AbortController()
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ recommendations: [recommendation] }),
    }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await fetchRecommendations({ signal: controller.signal })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/recommendations',
      { signal: controller.signal },
    )
    expect(result).toEqual([recommendation])
  })

  it('returns null when the backend reports that no matching profile exists', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 404 })),
    )

    await expect(fetchRecommendations()).resolves.toBeNull()
  })

  it('returns an empty array when the profile has no eligible roles', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ recommendations: [] }),
      })),
    )

    await expect(fetchRecommendations()).resolves.toEqual([])
  })

  it('throws a useful error when the request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 503 })),
    )

    await expect(fetchRecommendations()).rejects.toThrow(
      'Your recommendations could not be loaded.',
    )
  })

  it('rejects an invalid backend response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ recommendations: [{ ...recommendation, score: '85' }] }),
      })),
    )

    await expect(fetchRecommendations()).rejects.toThrow(
      'The recommendations response was invalid.',
    )
  })
})
