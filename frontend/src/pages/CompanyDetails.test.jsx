import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import CompanyDetails from './CompanyDetails.jsx'

function renderCompanyDetails(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/companies/:companyId" element={<CompanyDetails />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CompanyDetails', () => {
  it('renders the selected company profile and matching call to action', () => {
    renderCompanyDetails('/companies/company-b')

    expect(screen.getByRole('heading', { name: 'Company B' })).toBeInTheDocument()
    expect(screen.getByText('Financial Services')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'About the Company' })).toBeInTheDocument()
    expect(
      screen.getByText(/sample financial services employer offering opportunities/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Relevant Technical Roles' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Software Development')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Relevant Skills' })).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('Cloud')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Check my match' })).toHaveAttribute(
      'href',
      '/matching-profile',
    )
  })

  it('shows a useful recovery link for an unknown company ID', () => {
    renderCompanyDetails('/companies/unknown-company')

    expect(screen.getByRole('status')).toHaveTextContent(
      "We couldn't find a company with that ID.",
    )
    expect(
      screen.getByRole('link', { name: 'Back to Explore Companies' }),
    ).toHaveAttribute('href', '/companies')
  })
})
