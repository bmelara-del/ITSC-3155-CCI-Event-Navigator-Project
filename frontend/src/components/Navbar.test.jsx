import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import Navbar from './Navbar.jsx'

describe('Navbar', () => {
  it('renders links for each primary route', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    )

    const navigation = screen.getByRole('navigation', { name: 'Main navigation' })

    expect(navigation).toHaveAccessibleName('Main navigation')
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
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
  })

  it('marks the current route and updates it when a link is activated', async () => {
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

    await user.click(screen.getByRole('link', { name: 'Home' }))

    expect(screen.getByRole('heading', { name: 'Home page' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it.each([
    { path: '/', label: 'Home' },
    { path: '/companies', label: 'Explore Companies' },
    { path: '/matching-profile', label: 'My Matching Profile' },
    { path: '/recommendations', label: 'Recommendations' },
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

  it('supports keyboard navigation and activation', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
        <Routes>
          <Route path="/" element={<h1>Home page</h1>} />
          <Route path="/companies" element={<h1>Companies page</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.tab()
    expect(screen.getByRole('link', { name: 'CCI Career Navigator home' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('link', { name: 'Home' })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole('link', { name: 'Explore Companies' })).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(screen.getByRole('heading', { name: 'Companies page' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Explore Companies' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })
})