import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CompanyDetails from './CompanyDetails.jsx'

afterEach(() => {
  vi.unstubAllGlobals()
})

const companyId = 'c0ffee00-0000-4000-8000-000000000001'

const listItem = {
  companyId,
  slug: 'company-b',
  name: 'Company B',
  industry: 'Financial Services',
}

const detailsRecord = {
  ...listItem,
  description: 'A sample financial services employer offering opportunities.',
  roles: [
    {
      roleId: 'r1',
      title: 'Software Development',
      skills: [{ name: 'Python' }, { name: 'SQL' }],
    },
    {
      roleId: 'r2',
      title: 'Data Analysis',
      skills: [{ name: 'SQL' }, { name: 'Cloud' }],
    },
  ],
}

function jsonResponse(body) {
  return { ok: true, status: 200, json: async () => body }
}

function mockFetch(...responses) {
  const queue = [...responses]
  const fetchMock = vi.fn(() => Promise.resolve(queue.shift()))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function renderCompanyDetails(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/companies/:companySlug" element={<CompanyDetails />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CompanyDetails', () => {
  it('renders the company profile from the API and the matching call to action', async () => {
    const fetchMock = mockFetch(jsonResponse([listItem]), jsonResponse(detailsRecord))
    renderCompanyDetails('/companies/company-b')

    expect(await screen.findByRole('heading', { name: 'Company B' })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining(`/companies/${companyId}`),
      expect.anything(),
    )
    expect(screen.getByText('Financial Services')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'About the Company' })).toBeInTheDocument()
    expect(
      screen.getByText(/sample financial services employer offering opportunities/),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Relevant Technical Roles' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Software Development | Data Analysis')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Relevant Skills' })).toBeInTheDocument()
    expect(screen.getByText('Python')).toBeInTheDocument()
    expect(screen.getByText('Cloud')).toBeInTheDocument()
    expect(screen.getAllByText('SQL')).toHaveLength(1)
    expect(screen.getByRole('link', { name: 'Check my match' })).toHaveAttribute(
      'href',
      '/matching-profile',
    )
  })

  it('shows a loading message while the company is requested', () => {
    mockFetch(new Promise(() => {}))
    renderCompanyDetails('/companies/company-b')

    expect(screen.getByRole('status')).toHaveTextContent('Loading company')
  })

  it('shows a useful recovery link for an unknown company slug', async () => {
    mockFetch(jsonResponse([listItem]))
    renderCompanyDetails('/companies/unknown-company')

    expect(
      await screen.findByText("We couldn't find a company with that ID."),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to Explore Companies' }),
    ).toHaveAttribute('href', '/companies')
  })

  it('shows an error message when the company cannot be loaded', async () => {
    mockFetch({ ok: false, status: 500 })
    renderCompanyDetails('/companies/company-b')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Something went wrong while loading this company.',
    )
    expect(
      screen.getByRole('link', { name: 'Back to Explore Companies' }),
    ).toBeInTheDocument()
  })
})
