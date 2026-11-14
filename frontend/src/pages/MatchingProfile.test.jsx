import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import MatchingProfile from './MatchingProfile.jsx'

describe('MatchingProfile', () => {
  it('renders the profile sections with the design defaults', () => {
    render(<MatchingProfile />)

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
  })

  it('allows selecting one career interest and experience level', async () => {
    const user = userEvent.setup()
    render(<MatchingProfile />)

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
    render(<MatchingProfile />)

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
    render(<MatchingProfile />)

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
    render(<MatchingProfile />)

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

  it('shows a prototype-only confirmation without calculating match scores', async () => {
    const user = userEvent.setup()
    render(<MatchingProfile />)

    await user.click(screen.getByRole('button', { name: 'Find My Matches' }))

    expect(screen.getByRole('status')).toHaveTextContent(
      'This prototype does not calculate real match scores.',
    )
  })
})
