import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, vi } from 'vitest'
import { describe, expect, it } from 'vitest'
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
}

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

function renderRecommendations(state = { matchingProfile }) {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: '/recommendations', state }]}
    >
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
  it('renders the Figma sample recommendations and submitted profile summary', () => {
    renderRecommendations()

    expect(
      screen.getByRole('heading', { name: 'Recommended Companies' }),
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

  it('asks students without a submitted profile to complete the questionnaire', async () => {
    const user = userEvent.setup()
    renderRecommendations(null)

    expect(
      screen.getByRole('heading', {
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

  it('renders recommendations after navigating from the questionnaire with selected values', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/matching-profile']}>
        <Routes>
          <Route path="/matching-profile" element={<MatchingProfile />} />
          <Route path="/recommendations" element={<Recommendations />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('radio', { name: /Data Science/ }))
    await user.click(
      screen.getByRole('checkbox', { name: 'Computer Networks' }),
    )
    await user.click(
      screen.getByRole('radio', { name: /Some project or work experience/ }),
    )
    await user.click(screen.getByRole('button', { name: 'Find My Matches' }))

    expect(
      screen.getByRole('heading', { name: 'Recommended Companies' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Your profile:/)).toHaveTextContent(
      'Data Science | Java, Python, SQL, Git | 3 courses | Some project or work experience',
    )
  })
})
