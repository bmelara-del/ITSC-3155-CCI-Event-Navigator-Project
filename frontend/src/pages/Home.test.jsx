import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import ExploreCompanies from './ExploreCompanies.jsx'
import Home from './Home.jsx'
import MatchingProfile from './MatchingProfile.jsx'
import StudentProfile from './StudentProfile.jsx'

function renderHome() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/companies" element={<ExploreCompanies />} />
        <Route path="/matching-profile" element={<MatchingProfile />} />
        <Route path="/student-profile" element={<StudentProfile />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Home opportunity cards', () => {
  it('links Explore Companies to the existing companies page', async () => {
    const user = userEvent.setup()
    renderHome()

    await user.click(screen.getByRole('link', { name: 'Explore Companies' }))

    expect(
      screen.getByRole('heading', { name: 'Explore Companies' }),
    ).toBeInTheDocument()
  })

  it('links Get Matched to the questionnaire, not recommendations', async () => {
    const user = userEvent.setup()
    renderHome()

    const getMatched = screen.getByRole('link', { name: 'Get Matched' })
    expect(getMatched).toHaveAttribute('href', '/matching-profile')
    await user.click(getMatched)

    expect(
      screen.getByRole('heading', { name: 'Create My Matching Profile' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Recommended Companies' }),
    ).not.toBeInTheDocument()
  })

  it('links Get Started to the separate Student Profile page', async () => {
    const user = userEvent.setup()
    renderHome()

    await user.click(screen.getByRole('link', { name: 'Get Started' }))

    expect(screen.getByRole('heading', { name: 'Student Profile' }))
      .toBeInTheDocument()
    expect(
      screen.getByText(/separate from your Matching Profile questionnaire/),
    ).toBeInTheDocument()
  })
})
