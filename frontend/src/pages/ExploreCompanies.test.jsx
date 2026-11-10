import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import CompanyDetails from './CompanyDetails.jsx'
import ExploreCompanies from './ExploreCompanies.jsx'

function renderExploreCompanies() {
  return render(
    <MemoryRouter initialEntries={['/companies']}>
      <Routes>
        <Route path="/companies" element={<ExploreCompanies />} />
        <Route path="/companies/:companyId" element={<CompanyDetails />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ExploreCompanies', () => {
  it('shows the six companies from the design and links to company details', () => {
    renderExploreCompanies()

    const companyGrid = within(screen.getByRole('region', { name: 'Companies' }))

    expect(companyGrid.getAllByRole('link')).toHaveLength(6)
    expect(
      companyGrid.getByRole('link', { name: 'View Company A company details' }),
    ).toHaveAttribute('href', '/companies/company-a')
    expect(
      within(
        companyGrid.getByRole('link', { name: 'View Company A company details' }),
      ).getByText('Skills: Java | SQL | Git'),
    ).toBeInTheDocument()
  })

  it('filters company cards by name without case sensitivity', async () => {
    const user = userEvent.setup()
    renderExploreCompanies()

    await user.type(
      screen.getByRole('searchbox', { name: 'Search companies by name' }),
      'company c',
    )

    const companyGrid = within(screen.getByRole('region', { name: 'Companies' }))
    expect(companyGrid.getAllByRole('link')).toHaveLength(1)
    expect(companyGrid.getByRole('link', { name: 'View Company C company details' }))
      .toBeInTheDocument()
  })

  it('shows a no-results message when no company name matches', async () => {
    const user = userEvent.setup()
    renderExploreCompanies()

    await user.type(
      screen.getByRole('searchbox', { name: 'Search companies by name' }),
      'unknown',
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'No companies found. Try another name.',
    )
  })

  it('supports keyboard focus on search and company detail links', async () => {
    const user = userEvent.setup()
    renderExploreCompanies()

    await user.tab()
    expect(
      screen.getByRole('searchbox', { name: 'Search companies by name' }),
    ).toHaveFocus()

    await user.tab()
    expect(
      screen.getByRole('link', { name: 'View Company A company details' }),
    ).toHaveFocus()
  })

  it('navigates to the selected company details', async () => {
    const user = userEvent.setup()
    renderExploreCompanies()

    await user.click(
      screen.getByRole('link', { name: 'View Company A company details' }),
    )

    expect(screen.getByRole('heading', { name: 'Company A' })).toBeInTheDocument()
    expect(screen.getByText(/sample technology employer developing software products/))
      .toBeInTheDocument()
    expect(screen.getByText('Software Engineering')).toBeInTheDocument()
    expect(screen.getByText('Java')).toBeInTheDocument()
    expect(screen.getByText('SQL')).toBeInTheDocument()
    expect(screen.getByText('Git')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Check my match' })).toHaveAttribute(
      'href',
      '/matching-profile',
    )
  })

  it('reveals the remaining sample companies with the show-more control', async () => {
    const user = userEvent.setup()
    renderExploreCompanies()

    await user.click(screen.getByRole('button', { name: '+ Show More Companies' }))

    expect(
      within(screen.getByRole('region', { name: 'Companies' })).getAllByRole('link'),
    ).toHaveLength(9)
  })
})
