import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MatchingProfile from './MatchingProfile.jsx'

const savedProfile = {
  profileId: 'profile-1',
  careerInterest: 'Software Engineering',
  skills: ['Java', 'SQL'],
  coursework: ['Data Structures'],
  experienceLevel: 'Beginner / No internship',
  createdAt: '2026-11-14T20:00:00.000Z',
  updatedAt: '2026-11-14T21:00:00.000Z',
}

let profileStore
let saveCount

function installProfileApi({ getError = false } = {}) {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url, options = {}) => {
      if (options.method === 'PUT') {
        saveCount += 1
        profileStore = {
          ...profileStore,
          ...JSON.parse(options.body),
          profileId: profileStore?.profileId ?? savedProfile.profileId,
          createdAt: profileStore?.createdAt ?? savedProfile.createdAt,
          updatedAt: '2026-11-14T22:00:00.000Z',
        }
        return {
          ok: true,
          json: async () => profileStore,
        }
      }

      if (getError) {
        return { ok: false, status: 503 }
      }

      return profileStore
        ? { ok: true, json: async () => profileStore }
        : { ok: false, status: 404 }
    }),
  )
}

beforeEach(() => {
  profileStore = null
  saveCount = 0
  installProfileApi()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function renderMatchingProfile() {
  return render(
    <MemoryRouter>
      <MatchingProfile />
    </MemoryRouter>,
  )
}

describe('MatchingProfile', () => {
  it('renders the profile sections with the design defaults when no saved profile exists', async () => {
    renderMatchingProfile()

    expect(
      await screen.findByRole('heading', { name: 'Create My Matching Profile' }),
    ).toBeInTheDocument()
    expect(await screen.findByRole('radio', { name: /Software Engineering/ }))
      .toBeChecked()
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
    await screen.findByRole('heading', { name: 'Create My Matching Profile' })

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
    await screen.findByRole('heading', { name: 'Create My Matching Profile' })

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
    await screen.findByRole('heading', { name: 'Create My Matching Profile' })

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
    await screen.findByRole('heading', { name: 'Create My Matching Profile' })

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

  it('persists new questionnaire answers and displays the saved profile', async () => {
    const user = userEvent.setup()
    renderMatchingProfile()

    await screen.findByRole('heading', { name: 'Create My Matching Profile' })
    await user.click(screen.getByRole('radio', { name: /Cybersecurity/ }))
    await user.click(screen.getByRole('button', { name: 'Java' }))
    await user.click(
      screen.getByRole('checkbox', { name: 'Introduction to Programming' }),
    )
    await user.click(
      screen.getByRole('radio', { name: /Previous internship experience/ }),
    )
    await user.click(screen.getByRole('button', { name: 'Save My Profile' }))

    expect(
      await screen.findByRole('heading', { name: 'My Saved Matching Profile' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Cybersecurity')).toBeInTheDocument()
    expect(screen.getByText('Previous internship experience')).toBeInTheDocument()
    expect(saveCount).toBe(1)
  })

  it('opens the saved profile after a direct load and pre-fills editing', async () => {
    profileStore = savedProfile
    const user = userEvent.setup()
    renderMatchingProfile()

    expect(
      await screen.findByRole('heading', { name: 'My Saved Matching Profile' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Last saved/)).toHaveTextContent('2026')

    await user.click(screen.getByRole('button', { name: 'Edit My Profile' }))
    expect(
      await screen.findByRole('heading', { name: 'Edit My Matching Profile' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /Software Engineering/ }))
      .toBeChecked()
    expect(screen.getByRole('button', { name: 'Java' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('checkbox', { name: 'Data Structures' }))
      .toBeChecked()
    expect(
      screen.getByRole('radio', { name: /Beginner \/ No internship/ }),
    ).toBeChecked()

    await user.click(screen.getByRole('radio', { name: /Cybersecurity/ }))
    await user.click(screen.getByRole('button', { name: 'Save My Profile' }))

    expect(
      await screen.findByRole('heading', { name: 'My Saved Matching Profile' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Your matching profile was saved successfully.',
    )
    expect(profileStore.profileId).toBe(savedProfile.profileId)
    expect(profileStore.careerInterest).toBe('Cybersecurity')
    expect(saveCount).toBe(1)
  })

  it('shows a retryable error instead of the questionnaire when lookup fails', async () => {
    installProfileApi({ getError: true })
    renderMatchingProfile()

    expect(
      await screen.findByRole('heading', {
        name: 'Your matching profile could not be loaded',
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Create My Matching Profile' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})
