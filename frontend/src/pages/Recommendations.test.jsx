import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MatchDetails from './MatchDetails.jsx'
import MatchingProfile from './MatchingProfile.jsx'
import Recommendations from './Recommendations.jsx'

afterEach(() => {
  vi.unstubAllGlobals()
})

const matchingProfile = {
  careerInterest: 'Software Engineering',
  skills: ['Python', 'SQL', 'Git'],
  coursework: ['Data Structures', 'Cloud Computing'],
  experienceLevel: 'Beginner / No internship',
  updatedAt: '2026-11-14T21:00:00.000Z',
}

const recommendationFixtures = [
  {
    roleId: 'role-cedar-data',
    companyId: 'company-cedar',
    companyName: 'Cedar Signal Labs',
    companySlug: 'cedar-signal-labs',
    title: 'Junior Data Platform Developer',
    score: 98,
    matchedSkills: ['Python', 'SQL'],
    location: 'Raleigh, NC',
    term: 'Fall 2027',
    description: 'Build fictional data pipelines for Cedar Signal Labs.',
  },
  {
    roleId: 'role-cedar-cloud',
    companyId: 'company-cedar',
    companyName: 'Cedar Signal Labs',
    companySlug: 'cedar-signal-labs',
    title: 'Cloud Reliability Associate',
    score: 94,
    matchedSkills: ['Python', 'Git'],
    location: 'Raleigh, NC',
    term: 'Fall 2027',
    description: 'Improve cloud reliability at Cedar Signal Labs.',
  },
  {
    roleId: 'role-lumen-interface',
    companyId: 'company-lumen',
    companyName: 'Lumen Harbor Systems',
    companySlug: 'lumen-harbor-systems',
    title: 'Interface Engineering Co-op',
    score: 91,
    matchedSkills: ['Python'],
    location: 'Durham, NC',
    term: 'Spring 2028',
    description: 'Create a fictional interface for Lumen Harbor Systems.',
  },
  {
    roleId: 'role-maple-analytics',
    companyId: 'company-maple',
    companyName: 'Maple Circuit Studio',
    companySlug: 'maple-circuit-studio',
    title: 'Analytics Tools Intern',
    score: 88,
    matchedSkills: ['SQL'],
    location: 'Chapel Hill, NC',
    term: 'Summer 2028',
    description: 'Prototype analytics tools at Maple Circuit Studio.',
  },
  {
    roleId: 'role-orbit-services',
    companyId: 'company-orbit',
    companyName: 'Orbit Pine Robotics',
    companySlug: 'orbit-pine-robotics',
    title: 'Backend Services Fellow',
    score: 84,
    matchedSkills: ['Git'],
    location: 'Remote',
    term: 'Summer 2028',
    description: 'Develop fictional services for Orbit Pine Robotics.',
  },
  {
    roleId: 'role-quartz-automation',
    companyId: 'company-quartz',
    companyName: 'Quartz Grove Software',
    companySlug: 'quartz-grove-software',
    title: 'Automation Quality Intern',
    score: 81,
    matchedSkills: ['Python', 'SQL'],
    location: 'Charlotte, NC',
    term: 'Fall 2028',
    description: 'Test software automation at Quartz Grove Software.',
  },
  {
    roleId: 'role-copper-release',
    companyId: 'company-copper',
    companyName: 'Copper Kite Digital',
    companySlug: 'copper-kite-digital',
    title: 'Release Engineering Assistant',
    score: 77,
    matchedSkills: ['Git'],
    location: 'Greensboro, NC',
    term: 'Fall 2028',
    description: 'Support fictional releases at Copper Kite Digital.',
  },
  {
    roleId: 'role-fable-network',
    companyId: 'company-fable',
    companyName: 'Fable Ridge Networks',
    companySlug: 'fable-ridge-networks',
    title: 'Network Reliability Trainee',
    score: 73,
    matchedSkills: ['Python'],
    location: 'Remote',
    term: 'Spring 2029',
    description: 'Monitor fictional systems at Fable Ridge Networks.',
  },
  {
    roleId: 'role-juniper-ml',
    companyId: 'company-juniper',
    companyName: 'Juniper Path AI',
    companySlug: 'juniper-path-ai',
    title: 'Machine Learning Operations Intern',
    score: 69,
    matchedSkills: ['Python', 'SQL'],
    location: 'Durham, NC',
    term: 'Spring 2029',
    description: 'Support fictional model operations at Juniper Path AI.',
  },
  {
    roleId: 'role-mosaic-product',
    companyId: 'company-mosaic',
    companyName: 'Mosaic Vale Tech',
    companySlug: 'mosaic-vale-tech',
    title: 'Technical Product Analyst',
    score: 65,
    matchedSkills: ['Git'],
    location: 'Raleigh, NC',
    term: 'Summer 2029',
    description: 'Research fictional product workflows at Mosaic Vale Tech.',
  },
]

const apiRecommendations = recommendationFixtures.map((fixture) => ({
  roleId: fixture.roleId,
  title: fixture.title,
  companyId: fixture.companyId,
  companyName: fixture.companyName,
  companySlug: fixture.companySlug,
  score: fixture.score,
  factors: [
    {
      name: 'skills',
      weight: 40,
      earned: 40,
      detail: `${fixture.matchedSkills.length} fictional skills matched.`,
    },
    {
      name: 'careerInterest',
      weight: 25,
      earned: 25,
      detail: 'Role fits the fictional profile interest.',
    },
    {
      name: 'coursework',
      weight: 20,
      earned: 20,
      detail: 'Role fits the fictional profile coursework.',
    },
    {
      name: 'experience',
      weight: 15,
      earned: 15,
      detail: 'Role meets the fictional profile experience level.',
    },
  ],
  matchedSkills: fixture.matchedSkills,
  missingSkills: ['Kubernetes'],
  missingCoursework: [],
  note: 'Fictional test match, not a hiring probability.',
}))

function jsonResponse(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url) => {
      if (url.endsWith('/matching-profile')) {
        return jsonResponse({ ...matchingProfile, profileId: 'profile-1' })
      }

      if (url.endsWith('/recommendations')) {
        return jsonResponse({ recommendations: apiRecommendations })
      }

      return jsonResponse({}, 404)
    }),
  )
})

function stubRecommendationApi() {
  const companiesById = new Map()
  recommendationFixtures.forEach((fixture) => {
    const company = companiesById.get(fixture.companyId) ?? {
      companyId: fixture.companyId,
      slug: fixture.companySlug,
      name: fixture.companyName,
      description: `${fixture.companyName} is a fictional test company.`,
      roles: [],
    }

    company.roles.push({
      roleId: fixture.roleId,
      slug: fixture.roleId,
      title: fixture.title,
      description: fixture.description,
      location: fixture.location,
      employmentType: 'INTERNSHIP',
      workArrangement: 'HYBRID',
      term: fixture.term,
      minimumExperienceLevel: { label: 'Beginner / No internship' },
      isActive: true,
      skills: fixture.matchedSkills.map((name) => ({ name })),
      coursework: [],
      careerInterests: [],
    })
    companiesById.set(fixture.companyId, company)
  })
  const companies = [...companiesById.values()]

  vi.stubGlobal(
    'fetch',
    vi.fn((url) => {
      if (url.endsWith('/matching-profile')) {
        return Promise.resolve(
          jsonResponse({ ...matchingProfile, profileId: 'profile-1' }),
        )
      }

      if (url.endsWith('/recommendations')) {
        return Promise.resolve(
          jsonResponse({ recommendations: apiRecommendations }),
        )
      }

      if (url.endsWith('/companies')) {
        return Promise.resolve(
          jsonResponse(
            companies.map(({ companyId, slug, name }) => ({
              companyId,
              slug,
              name,
            })),
          ),
        )
      }

      const company = companies.find((item) =>
        url.endsWith(`/companies/${item.companyId}`),
      )

      return Promise.resolve(jsonResponse(company ?? {}, company ? 200 : 404))
    }),
  )
}

function renderRecommendations() {
  return render(
    <MemoryRouter initialEntries={['/recommendations']}>
      <Routes>
        <Route path="/recommendations" element={<Recommendations />} />
        <Route
          path="/recommendations/:companySlug/details"
          element={<MatchDetails />}
        />
        <Route path="/matching-profile" element={<h1>Matching Profile</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Recommendations', () => {
  it('loads the saved profile and displays fictional API recommendations', async () => {
    renderRecommendations()

    expect(
      await screen.findByRole('heading', { name: 'Recommended Companies' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Your profile:/)).toHaveTextContent(
      'Software Engineering | Python, SQL, Git | 2 courses | Beginner / No internship',
    )
    const recommendations = within(
      screen.getByRole('region', { name: 'Personalized role recommendations' }),
    )
    expect(recommendations.getAllByRole('article')).toHaveLength(6)
    expect(
      within(recommendations.getAllByRole('article')[0]).getByRole(
        'heading',
        { name: 'Cedar Signal Labs' },
      ),
    ).toBeInTheDocument()
    expect(
      recommendations.getByText('Junior Data Platform Developer'),
    ).toBeInTheDocument()
    expect(recommendations.getByText('98% Match')).toBeInTheDocument()
    expect(recommendations.getAllByRole('link', { name: /View Match Details/ }))
      .toHaveLength(6)
  })

  it('preserves the ranking order returned by the recommendations API', async () => {
    renderRecommendations()

    const articles = within(
      await screen.findByRole('region', {
        name: 'Personalized role recommendations',
      }),
    ).getAllByRole('article')

    recommendationFixtures.slice(0, 6).forEach((fixture, index) => {
      const article = within(articles[index])
      expect(
        article.getByRole('heading', { name: fixture.companyName }),
      ).toBeInTheDocument()
      expect(article.getByText(fixture.title)).toBeInTheDocument()
      expect(article.getByText(`${fixture.score}% Match`)).toBeInTheDocument()
    })
  })

  it('shows loading states while profile and recommendations requests are pending', async () => {
    let resolveProfile
    let resolveRecommendations
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => {
        if (url.endsWith('/matching-profile')) {
          return new Promise((resolve) => {
            resolveProfile = resolve
          })
        }

        return new Promise((resolve) => {
          resolveRecommendations = resolve
        })
      }),
    )
    renderRecommendations()

    expect(
      screen.getByRole('heading', { name: 'Loading your saved profile' }),
    ).toBeInTheDocument()

    await act(async () => {
      resolveProfile(
        jsonResponse({ ...matchingProfile, profileId: 'profile-1' }),
      )
    })
    expect(
      await screen.findByRole('heading', { name: 'Loading recommendations' }),
    ).toBeInTheDocument()

    await act(async () => {
      resolveRecommendations(
        jsonResponse({ recommendations: apiRecommendations }),
      )
    })
    expect(
      await screen.findByRole('region', {
        name: 'Personalized role recommendations',
      }),
    ).toBeInTheDocument()
  })

  it('asks students without a saved profile to complete the questionnaire', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn(async () => ({ ok: false, status: 404 }))
    vi.stubGlobal('fetch', fetchMock)
    renderRecommendations()

    expect(
      await screen.findByRole('heading', {
        name: 'Complete your Matching Profile first',
      }),
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('link', { name: 'Go to My Matching Profile' }),
    )
    expect(
      screen.getByRole('heading', { name: 'Matching Profile' }),
    ).toBeInTheDocument()
    expect(
      fetchMock.mock.calls.some(([url]) => url.endsWith('/recommendations')),
    ).toBe(false)
  })

  it('shows the first six roles and supports Show More and Show Fewer', async () => {
    const user = userEvent.setup()
    renderRecommendations()
    await screen.findByRole('heading', { name: 'Recommended Companies' })

    const recommendations = within(
      screen.getByRole('region', { name: 'Personalized role recommendations' }),
    )
    expect(recommendations.getAllByRole('article')).toHaveLength(6)

    await user.click(
      screen.getByRole('button', { name: '+ Show More Recommendations' }),
    )
    expect(recommendations.getAllByRole('article')).toHaveLength(10)
    const showFewerButton = screen.getByRole('button', {
      name: 'Show Fewer Recommendations',
    })
    expect(showFewerButton).toHaveAttribute('aria-expanded', 'true')

    await user.click(showFewerButton)
    expect(recommendations.getAllByRole('article')).toHaveLength(6)
    expect(
      screen.getByRole('button', { name: '+ Show More Recommendations' }),
    ).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows an empty state when the API returns no recommendations', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url) => {
        if (url.endsWith('/matching-profile')) {
          return jsonResponse({ ...matchingProfile, profileId: 'profile-1' })
        }

        return jsonResponse({ recommendations: [] })
      }),
    )
    renderRecommendations()

    expect(
      await screen.findByRole('heading', {
        name: 'No role recommendations are available yet',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('region', {
        name: 'Personalized role recommendations',
      }),
    ).not.toBeInTheDocument()
  })

  it('shows API errors without sample fallback and retries the recommendation request', async () => {
    const user = userEvent.setup()
    let recommendationCalls = 0
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url) => {
        if (url.endsWith('/matching-profile')) {
          return jsonResponse({ ...matchingProfile, profileId: 'profile-1' })
        }

        recommendationCalls += 1
        if (recommendationCalls === 1) {
          return jsonResponse({}, 503)
        }

        return jsonResponse({ recommendations: apiRecommendations })
      }),
    )
    renderRecommendations()

    expect(
      await screen.findByRole('heading', {
        name: 'Your recommendations could not be loaded',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Your profile:/)).toHaveTextContent(
      'Software Engineering | Python, SQL, Git | 2 courses | Beginner / No internship',
    )
    expect(
      screen.queryByRole('region', {
        name: 'Personalized role recommendations',
      }),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Junior Data Platform Developer'),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(
      await screen.findByRole('region', {
        name: 'Personalized role recommendations',
      }),
    ).toBeInTheDocument()
    expect(recommendationCalls).toBe(2)
  })

  it('navigates to the selected company and exact role', async () => {
    const user = userEvent.setup()
    stubRecommendationApi()
    renderRecommendations()

    await screen.findByRole('heading', { name: 'Recommended Companies' })
    const detailsLink = screen.getByRole('link', {
      name: 'View Match Details for Cedar Signal Labs — Cloud Reliability Associate',
    })
    expect(detailsLink).toHaveAttribute(
      'href',
      '/recommendations/cedar-signal-labs/details?roleId=role-cedar-cloud',
    )
    await user.click(detailsLink)

    expect(
      screen.getByRole('heading', { name: 'Match Details and Prep' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Cedar Signal Labs' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Cloud Reliability Associate · Raleigh, NC · Internship · Hybrid · Fall 2027 · Beginner / No internship',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Improve cloud reliability at Cedar Signal Labs.'),
    ).toBeInTheDocument()
    expect(screen.getByText(/Skills selected: Python, SQL, Git/))
      .toBeInTheDocument()
  })

  it('uses the saved questionnaire responses after completing the questionnaire', async () => {
    const user = userEvent.setup()
    let savedProfile = null
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url, options = {}) => {
        if (options.method === 'PUT') {
          savedProfile = {
            ...JSON.parse(options.body),
            profileId: 'profile-1',
            updatedAt: '2026-11-14T21:00:00.000Z',
          }
          return jsonResponse(savedProfile)
        }

        if (url.endsWith('/recommendations')) {
          return jsonResponse({ recommendations: apiRecommendations })
        }

        return savedProfile ? jsonResponse(savedProfile) : jsonResponse({}, 404)
      }),
    )

    render(
      <MemoryRouter initialEntries={['/matching-profile']}>
        <Routes>
          <Route path="/matching-profile" element={<MatchingProfile />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Routes>
      </MemoryRouter>,
    )

    await screen.findByRole('heading', { name: 'Create My Matching Profile' })
    await user.click(screen.getByRole('radio', { name: /Data Science/ }))
    await user.click(
      screen.getByRole('checkbox', { name: 'Computer Networks' }),
    )
    await user.click(
      screen.getByRole('radio', { name: /Some project or work experience/ }),
    )
    await user.click(screen.getByRole('button', { name: 'Save My Profile' }))

    expect(
      await screen.findByRole('heading', { name: 'My Saved Matching Profile' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'View Recommendations' }))
    expect(
      await screen.findByRole('heading', { name: 'Recommended Companies' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Your profile:/)).toHaveTextContent(
      'Data Science | Java, Python, SQL, Git | 3 courses | Some project or work experience',
    )
  })

  it('shows a matching-profile API error with a retry action', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({}, 503)))
    renderRecommendations()

    expect(
      await screen.findByRole('heading', {
        name: 'Your matching profile could not be checked',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', {
        name: 'Complete your Matching Profile first',
      }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
