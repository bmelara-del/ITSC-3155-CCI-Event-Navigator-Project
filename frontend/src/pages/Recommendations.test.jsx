import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MatchDetails from './MatchDetails.jsx'
import MatchingProfile from './MatchingProfile.jsx'
import Recommendations from './Recommendations.jsx'
import { sampleRecommendations } from '../data/recommendations.js'

afterEach(() => {
  vi.unstubAllGlobals()
})

const matchingProfile = {
  careerInterest: 'Software Engineering',
  skills: ['Java', 'SQL', 'Git'],
  coursework: ['Data Structures', 'Database Design'],
  experienceLevel: 'Beginner / No internship',
  updatedAt: '2026-11-14T21:00:00.000Z',
}

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok: true,
      json: async () => ({ ...matchingProfile, profileId: 'profile-1' }),
    })),
  )
})

function stubRecommendationApi() {
  const companies = sampleRecommendations.map((recommendation, index) => ({
    companyId: `test-company-${index}`,
    slug: recommendation.id,
    name: recommendation.name,
    industry: recommendation.industry,
    description: `${recommendation.name} description from PostgreSQL.`,
    roles: recommendation.roles.map((title, roleIndex) => ({
      roleId: `test-role-${index}-${roleIndex}`,
      slug: `role-${roleIndex}`,
      title,
      description: `${title} role description from PostgreSQL.`,
      location: recommendation.location,
      employmentType: null,
      workArrangement: recommendation.workArrangement,
      term: recommendation.term,
      isActive: true,
      skills: recommendation.skills.map((name) => ({ name })),
      coursework: [],
      careerInterests: [],
    })),
  }))

  vi.stubGlobal(
    'fetch',
    vi.fn((url) => {
      if (url.endsWith('/matching-profile')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ...matchingProfile, profileId: 'profile-1' }),
        })
      }

      if (url.endsWith('/companies')) {
        return Promise.resolve({
          ok: true,
          json: async () =>
            companies.map(({ companyId, slug, name }) => ({
              companyId,
              slug,
              name,
            })),
        })
      }

      const company = companies.find((item) =>
        url.endsWith(`/companies/${item.companyId}`),
      )

      return Promise.resolve({
        ok: Boolean(company),
        status: company ? 200 : 404,
        json: async () => company,
      })
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
  it('renders sample recommendations from the saved profile after a direct load', async () => {
    renderRecommendations()

    expect(
      await screen.findByRole('heading', { name: 'Recommended Companies' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Your profile:/)).toHaveTextContent(
      'Software Engineering | Java, SQL, Git | 2 courses | Beginner / No internship',
    )
    expect(screen.getByText(/Match scores and explanations are not available/))
      .toBeInTheDocument()

    const recommendations = within(
      screen.getByRole('region', { name: 'Sample company recommendations' }),
    )
    expect(recommendations.getAllByRole('article')).toHaveLength(6)
    expect(
      recommendations.getByRole('heading', { name: 'Northwind Analytics' }),
    ).toBeInTheDocument()
    expect(recommendations.getByText('Roles: Data Analyst Intern'))
      .toBeInTheDocument()
    expect(
      recommendations.getAllByLabelText('Match score unavailable')[0],
    ).toHaveTextContent('Score unavailable')
    expect(recommendations.getAllByRole('link', { name: /View Match Details/ }))
      .toHaveLength(6)
  })

  it('asks students without a saved profile to complete the questionnaire', async () => {
    const user = userEvent.setup()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 404 })),
    )
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
  })

  it('reveals the remaining demo recommendations', async () => {
    const user = userEvent.setup()
    renderRecommendations()
    await screen.findByRole('heading', { name: 'Recommended Companies' })

    const recommendations = within(
      screen.getByRole('region', { name: 'Sample company recommendations' }),
    )
    expect(recommendations.getAllByRole('article')).toHaveLength(6)

    await user.click(
      screen.getByRole('button', { name: '+ Show More Recommendations' }),
    )

    expect(recommendations.getAllByRole('article')).toHaveLength(10)
    expect(
      screen.getByRole('button', { name: 'Show Fewer Recommendations' }),
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it.each([
    {
      name: 'Northwind Analytics',
      roleText: 'Data Analyst Intern · Charlotte, NC · Hybrid · Spring 2027',
      href: '/recommendations/northwind-analytics/details',
    },
    {
      name: 'Company A',
      roleText: /Software Engineering · Location details coming soon/,
      href: '/recommendations/company-a/details',
    },
  ])('opens the selected company details for $name', async ({
    name,
    roleText,
    href,
  }) => {
    const user = userEvent.setup()
    stubRecommendationApi()
    renderRecommendations()

    await screen.findByRole('heading', { name: 'Recommended Companies' })
    const detailsLink = screen.getByRole('link', {
      name: `View Match Details for ${name}`,
    })
    expect(detailsLink).toHaveAttribute('href', href)
    await user.click(detailsLink)

    expect(
      screen.getByRole('heading', { name: 'Match Details and Prep' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name })).toBeInTheDocument()
    expect(screen.getByText(roleText)).toBeInTheDocument()
    expect(screen.getByText(/Skills selected: Java, SQL, Git/))
      .toBeInTheDocument()
  })

  it('uses the saved questionnaire responses after completing the questionnaire', async () => {
    const user = userEvent.setup()
    let savedProfile = null
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url, options = {}) => {
        if (options.method === 'PUT') {
          savedProfile = {
            ...JSON.parse(options.body),
            profileId: 'profile-1',
            updatedAt: '2026-11-14T21:00:00.000Z',
          }
          return { ok: true, json: async () => savedProfile }
        }

        return savedProfile
          ? { ok: true, json: async () => savedProfile }
          : { ok: false, status: 404 }
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

  it('shows an API error with retry instead of treating it as no profile', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 503 })),
    )
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
