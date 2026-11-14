import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { describe, expect, it } from 'vitest'
import MatchingProfile from './MatchingProfile.jsx'

function renderMatchingProfile() {
  return render(
    <MemoryRouter>
      <MatchingProfile />
    </MemoryRouter>,
  )
}

function SubmittedProfile() {
  const { state } = useLocation()

  return <output>{JSON.stringify(state?.matchingProfile)}</output>
}

describe('MatchingProfile', () => {
  it('renders the profile sections with the design defaults', () => {
    renderMatchingProfile()

    expect(
      screen.getByRole('heading', { name: 'Create My Matching Profile' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('radio', { name: /Software Engineering/ }),
    ).toBeChecked()
    expect(screen.getByRole('button', { name: 'Java' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(
      screen.getByRole('checkbox', { name: 'Data Structures' }),
    ).toBeChecked()
    expect(
      screen.getByRole('radio', { name: /Beginner \/ No internship/ }),
    ).toBeChecked()
    expect(
      [...document.querySelectorAll('.matching-profile__step')].map(
        (step) => step.textContent,
      ),
    ).toEqual(['1', '2', '3', '4'])
  })

  it('allows selecting one career interest and experience level', async () => {
    const user = userEvent.setup()
    renderMatchingProfile()

    const cybersecurity = screen.getByRole('radio', { name: /Cybersecurity/ })
    await user.click(cybersecurity)

    expect(cybersecurity).toBeChecked()
    expect(
      screen.getByRole('radio', { name: /Software Engineering/ }),
    ).not.toBeChecked()

    const internship = screen.getByRole('radio', {
      name: /Previous internship experience/,
    })
    await user.click(internship)
    expect(internship).toBeChecked()
    expect(
      screen.getByRole('radio', { name: /Beginner \/ No internship/ }),
    ).not.toBeChecked()
  })

  it('filters skills and expands the additional sample skills', async () => {
    const user = userEvent.setup()
    renderMatchingProfile()

    await user.click(screen.getByRole('button', { name: '+ Show More skills' }))
    expect(screen.getByRole('button', { name: 'TypeScript' })).toBeInTheDocument()

    const search = screen.getByRole('searchbox', { name: 'Search skills' })
    await user.type(search, 'docker')

    const availableSkills = screen.getByRole('group', {
      name: 'Available skills',
    })
    expect(within(availableSkills).getByRole('button', { name: 'Docker' }))
      .toBeInTheDocument()
    expect(within(availableSkills).queryByRole('button', { name: 'Java' }))
      .not.toBeInTheDocument()

    await user.click(within(availableSkills).getByRole('button', { name: 'Docker' }))
    expect(
      within(availableSkills).getByRole('button', { name: 'Docker' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('toggles coursework selections', async () => {
    const user = userEvent.setup()
    renderMatchingProfile()

    const programming = screen.getByRole('checkbox', {
      name: 'Introduction to Programming',
    })
    await user.click(programming)
    expect(programming).toBeChecked()

    const dataStructures = screen.getByRole('checkbox', {
      name: 'Data Structures',
    })
    await user.click(dataStructures)
    expect(dataStructures).not.toBeChecked()
  })

  it('supports keyboard focus and activation for skill buttons', async () => {
    const user = userEvent.setup()
    renderMatchingProfile()

    await user.tab()
    expect(
      screen.getByRole('radio', { name: /Software Engineering/ }),
    ).toHaveFocus()

    await user.tab()
    expect(
      screen.getByRole('searchbox', { name: 'Search skills' }),
    ).toHaveFocus()

    await user.tab()
    const java = screen.getByRole('button', { name: 'Java' })
    expect(java).toHaveFocus()
    await user.keyboard(' ')
    expect(java).toHaveAttribute('aria-pressed', 'false')
  })

  it('navigates with the selected matching profile in route state', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/matching-profile']}>
        <Routes>
          <Route path="/matching-profile" element={<MatchingProfile />} />
          <Route path="/recommendations" element={<SubmittedProfile />} />
        </Routes>
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('radio', { name: /Cybersecurity/ }))
    await user.click(screen.getByRole('button', { name: 'Java' }))
    await user.click(
      screen.getByRole('checkbox', { name: 'Introduction to Programming' }),
    )
    await user.click(
      screen.getByRole('radio', { name: /Previous internship experience/ }),
    )
    await user.click(screen.getByRole('button', { name: 'Find My Matches' }))

    expect(screen.getByText(
      JSON.stringify({
        careerInterest: 'Cybersecurity',
        skills: ['Python', 'SQL', 'Git'],
        coursework: [
          'Data Structures',
          'Database Design',
          'Introduction to Programming',
        ],
        experienceLevel: 'Previous internship experience',
      }),
    )).toBeInTheDocument()
  })
})
