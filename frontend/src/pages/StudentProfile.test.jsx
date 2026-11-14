import { beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import StudentProfile from './StudentProfile.jsx'

const STORAGE_KEY = 'cci-career-navigator-student-profile'

function renderStudentProfile() {
  return render(<StudentProfile />)
}

async function fillRequiredFields(user, fullName = 'Jordan Student') {
  await user.type(screen.getByLabelText('Full Name'), fullName)
  await user.selectOptions(screen.getByLabelText('Year in School'), 'Junior')
  await user.selectOptions(
    screen.getByLabelText('Concentration'),
    'Computer Science',
  )
}

describe('StudentProfile', () => {
  beforeEach(() => {
    cleanup()
    window.localStorage.clear()
  })

  it('shows the create profile form when no saved profile exists', () => {
    renderStudentProfile()

    expect(
      screen.getByRole('heading', { name: 'Create My Profile' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Full Name')).toBeRequired()
    expect(
      screen.getByRole('button', { name: 'Create Profile' }),
    ).toBeInTheDocument()
  })

  it('validates required fields, email, and LinkedIn URL', async () => {
    const user = userEvent.setup()
    renderStudentProfile()

    await user.click(screen.getByRole('button', { name: 'Create Profile' }))
    expect(screen.getByText('Enter your full name.')).toBeInTheDocument()
    expect(screen.getByText('Select your year in school.')).toBeInTheDocument()
    expect(screen.getByText('Select your concentration.')).toBeInTheDocument()

    await fillRequiredFields(user)
    await user.type(screen.getByLabelText('Email (optional)'), 'not-an-email')
    await user.type(
      screen.getByLabelText('LinkedIn (optional)'),
      'https://example.com/profile',
    )
    await user.click(screen.getByRole('button', { name: 'Create Profile' }))

    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument()
    expect(screen.getByText('Enter a valid LinkedIn URL.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Create My Profile' }))
      .toBeInTheDocument()
  })

  it('creates a profile from entered values without storing or showing a password', async () => {
    const user = userEvent.setup()
    renderStudentProfile()

    await fillRequiredFields(user)
    await user.type(
      screen.getByLabelText('Email (optional)'),
      'jordan@example.edu',
    )
    await user.type(
      screen.getByLabelText('LinkedIn (optional)'),
      'https://www.linkedin.com/in/jordan-student',
    )
    await user.type(
      screen.getByLabelText('About Me (optional)'),
      'I enjoy building accessible web applications.',
    )
    expect(screen.getByLabelText('Password (demo only)')).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Create Profile' }))

    expect(screen.getByRole('heading', { name: 'My Profile' }))
      .toBeInTheDocument()
    expect(screen.getByText('Jordan Student')).toBeInTheDocument()
    expect(screen.getByText('jordan@example.edu')).toBeInTheDocument()
    expect(screen.getByText('Junior')).toBeInTheDocument()
    expect(screen.getByText('Computer Science')).toBeInTheDocument()
    expect(
      screen.getByRole('link', {
        name: 'https://www.linkedin.com/in/jordan-student',
      }),
    ).toHaveAttribute('href', 'https://www.linkedin.com/in/jordan-student')
    expect(
      screen.getByText('I enjoy building accessible web applications.'),
    ).toBeInTheDocument()

    const savedProfile = window.localStorage.getItem(STORAGE_KEY)
    expect(savedProfile).toContain('Jordan Student')
    expect(savedProfile).not.toContain('password')
    expect(screen.queryByText(/14 characters/i)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/Password/)).not.toBeInTheDocument()
  })

  it('omits empty optional fields from the completed profile', async () => {
    const user = userEvent.setup()
    renderStudentProfile()

    await fillRequiredFields(user, 'Casey Student')
    await user.click(screen.getByRole('button', { name: 'Create Profile' }))

    expect(screen.getByRole('heading', { name: 'My Profile' }))
      .toBeInTheDocument()
    expect(screen.queryByText('Email (optional)')).not.toBeInTheDocument()
    expect(screen.queryByText('LinkedIn (optional)')).not.toBeInTheDocument()
    expect(screen.queryByText('About Me (optional)')).not.toBeInTheDocument()
  })

  it('prefills saved information when editing and persists updates', async () => {
    const user = userEvent.setup()
    renderStudentProfile()

    await fillRequiredFields(user, 'Taylor Student')
    await user.click(screen.getByRole('button', { name: 'Create Profile' }))
    await user.click(screen.getByRole('button', { name: 'Edit Profile' }))

    expect(screen.getByLabelText('Full Name')).toHaveValue('Taylor Student')
    await user.clear(screen.getByLabelText('Full Name'))
    await user.type(screen.getByLabelText('Full Name'), 'Taylor Updated')
    await user.click(screen.getByRole('button', { name: 'Save Profile' }))

    expect(screen.getByText('Taylor Updated')).toBeInTheDocument()
    expect(window.localStorage.getItem(STORAGE_KEY)).toContain('Taylor Updated')
  })

  it('loads the completed profile again from localStorage', async () => {
    const user = userEvent.setup()
    const { unmount } = renderStudentProfile()

    await fillRequiredFields(user, 'Morgan Student')
    await user.click(screen.getByRole('button', { name: 'Create Profile' }))
    unmount()

    renderStudentProfile()
    expect(screen.getByRole('heading', { name: 'My Profile' }))
      .toBeInTheDocument()
    expect(screen.getByText('Morgan Student')).toBeInTheDocument()
  })
})
