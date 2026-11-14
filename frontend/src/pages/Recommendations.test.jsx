import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import CompanyDetails from './CompanyDetails.jsx'
import MatchingProfile from './MatchingProfile.jsx'
import Recommendations from './Recommendations.jsx'

const matchingProfile = {
  careerInterest: 'Software Engineering',
  skills: ['Java', 'SQL', 'Git'],
  coursework: ['Data Structures', 'Database Design'],
  experienceLevel: 'Beginner / No internship',
}

function renderRecommendations(state = { matchingProfile }) {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: '/recommendations', state }]}
    >
      <Routes>
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/companies/:companyId" element={<CompanyDetails />} />
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
    expect(screen.getByText(/scores are illustrative and are not calculated/))
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
      recommendations.getByLabelText('Illustrative demo score: 92%'),
    ).toHaveTextContent('92% demo score')
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

  it('opens the existing company details page for a recommendation', async () => {
    const user = userEvent.setup()
    renderRecommendations()

    await user.click(
      screen.getByRole('link', {
        name: 'View Match Details for Northwind Analytics',
      }),
    )

    expect(
      screen.getByRole('heading', { name: 'Northwind Analytics' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Data Analyst Intern')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Check my match' }),
    ).toHaveAttribute('href', '/matching-profile')
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
