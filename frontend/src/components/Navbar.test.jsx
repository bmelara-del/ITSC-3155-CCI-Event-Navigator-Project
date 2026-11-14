import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import Navbar from './Navbar.jsx'

describe('Navbar', () => {
  it('renders the brand home link and links for each primary route without a Home tab', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    )

    const navigation = screen.getByRole('navigation', { name: 'Main navigation' })

    expect(navigation).toHaveAccessibleName('Main navigation')
    expect(
      screen.getByRole('link', { name: 'CCI Career Navigator home' }),
    ).toHaveAttribute('href', '/')
    expect(
      within(navigation).queryByRole('link', { name: 'Home' }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explore Companies' })).toHaveAttribute(
      'href',
      '/companies',
    )
    expect(screen.getByRole('link', { name: 'My Matching Profile' })).toHaveAttribute(
      'href',
      '/matching-profile',
    )
    expect(screen.getByRole('link', { name: 'Recommendations' })).toHaveAttribute(
      'href',
      '/recommendations',
    )
    expect(screen.getByRole('link', { name: 'My Profile' })).toHaveAttribute(
      'href',
      '/student-profile',
    )
  })

  it('navigates home when the brand is activated from another route', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/companies']}>
        <Navbar />
        <Routes>
          <Route path="/" element={<h1>Home page</h1>} />
          <Route path="/companies" element={<h1>Companies page</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Explore Companies' })).toHaveAttribute(
      'aria-current',
      'page',
    )

    await user.click(
      screen.getByRole('link', { name: 'CCI Career Navigator home' }),
    )

    expect(screen.getByRole('heading', { name: 'Home page' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'CCI Career Navigator home' }),
    ).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it.each([
    { path: '/companies', label: 'Explore Companies' },
    { path: '/matching-profile', label: 'My Matching Profile' },
    { path: '/recommendations', label: 'Recommendations' },
    { path: '/student-profile', label: 'My Profile' },
  ])('marks $label as current at $path', ({ path, label }) => {
    render(
      <MemoryRouter initialEntries={[path]}>
        <Navbar />
      </MemoryRouter>,
    )

    const navigation = within(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    )
    const currentLinks = navigation
      .getAllByRole('link')
      .filter((link) => link.getAttribute('aria-current') === 'page')

    expect(currentLinks).toHaveLength(1)
    expect(navigation.getByRole('link', { name: label })).toHaveClass('is-active')
  })

  it('marks the brand as the current home link without adding a Home tab', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('link', { name: 'CCI Career Navigator home' }),
    ).toHaveAttribute('aria-current', 'page')
    expect(
      within(
        screen.getByRole('navigation', { name: 'Main navigation' }),
      ).queryByRole('link', { name: 'Home' }),
    ).not.toBeInTheDocument()
  })

  it('supports keyboard navigation and activation', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
        <Routes>
          <Route path="/" element={<h1>Home page</h1>} />
          <Route path="/companies" element={<h1>Companies page</h1>} />
          <Route path="/student-profile" element={<h1>Student Profile</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.tab()
    expect(screen.getByRole('link', { name: 'CCI Career Navigator home' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('link', { name: 'Explore Companies' })).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('heading', { name: 'Companies page' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explore Companies' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('supports keyboard navigation to My Profile', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
        <Routes>
          <Route path="/" element={<h1>Home page</h1>} />
          <Route path="/student-profile" element={<h1>Student Profile</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.tab()
    await user.tab()
    await user.tab()
    await user.tab()
    await user.tab()
    expect(screen.getByRole('link', { name: 'My Profile' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { name: 'Student Profile' })).toBeInTheDocument()
  })
})