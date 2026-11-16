import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CompanyDetails from './CompanyDetails.jsx'
import ExploreCompanies from './ExploreCompanies.jsx'

afterEach(() => {
  vi.unstubAllGlobals()
})

const COMPANY_IDS = [
  'a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8', 'i9',
].map((suffix, index) => `c0ffee00-0000-4000-8000-0000000000${index}${suffix}`)

function companySummary(index) {
  const letter = String.fromCharCode(65 + index)

  return {
    companyId: COMPANY_IDS[index],
    slug: `company-${letter.toLowerCase()}`,
    name: `Company ${letter}`,
    industry: index === 0 ? 'Technology' : 'Finance',
    description: `Sample description for Company ${letter}.`,
    website: null,
    isActive: true,
  }
}

const nineCompanies = Array.from({ length: 9 }, (_, index) => companySummary(index))

function companyDetailsRecord() {
  return {
    ...companySummary(0),
    roles: [
      {
        roleId: 'r1',
        slug: 'software-engineering',
        title: 'Software Engineering',
        isActive: true,
        skills: [
          { skillId: 's1', name: 'Java' },
          { skillId: 's2', name: 'SQL' },
          { skillId: 's3', name: 'Git' },
        ],
      },
    ],
  }
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

function renderExploreCompanies() {
  return render(
    <MemoryRouter initialEntries={['/companies']}>
      <Routes>
        <Route path="/companies" element={<ExploreCompanies />} />
        <Route path="/companies/:companySlug" element={<CompanyDetails />} />
      </Routes>
    </MemoryRouter>,
  )
}

async function findCompanyGrid() {
  return within(await screen.findByRole('region', { name: 'Companies' }))
}

describe('ExploreCompanies', () => {
  it('shows a loading message while companies are requested', () => {
    mockFetch(new Promise(() => {}))
    renderExploreCompanies()

    expect(screen.getByRole('status')).toHaveTextContent('Loading companies')
  })

  it('loads companies from the API and links each card to its slug', async () => {
    const fetchMock = mockFetch(jsonResponse(nineCompanies))
    renderExploreCompanies()

    const companyGrid = await findCompanyGrid()

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/companies$/),
      expect.anything(),
    )
    expect(companyGrid.getAllByRole('link')).toHaveLength(6)
    expect(
      companyGrid.getByRole('link', { name: 'View Company A company details' }),
    ).toHaveAttribute('href', '/companies/company-a')
    expect(
      within(
        companyGrid.getByRole('link', { name: 'View Company A company details' }),
      ).getByText('Sample description for Company A.'),
    ).toBeInTheDocument()
  })

  it('filters company cards by name without case sensitivity', async () => {
    const user = userEvent.setup()
    mockFetch(jsonResponse(nineCompanies))
    renderExploreCompanies()
    await findCompanyGrid()

    await user.type(
      screen.getByRole('searchbox', { name: 'Search companies by name' }),
      'company c',
    )

    const companyGrid = await findCompanyGrid()
    expect(companyGrid.getAllByRole('link')).toHaveLength(1)
    expect(
      companyGrid.getByRole('link', { name: 'View Company C company details' }),
    ).toBeInTheDocument()
  })

  it('shows a no-results message when no company name matches', async () => {
    const user = userEvent.setup()
    mockFetch(jsonResponse(nineCompanies))
    renderExploreCompanies()
    await findCompanyGrid()

    await user.type(
      screen.getByRole('searchbox', { name: 'Search companies by name' }),
      'unknown',
    )

    expect(screen.getByRole('status')).toHaveTextContent(
      'No companies found. Try another name.',
    )
  })

  it('shows the empty message when the API returns no companies', async () => {
    mockFetch(jsonResponse([]))
    renderExploreCompanies()

    expect(
      await screen.findByText('No companies found. Try another name.'),
    ).toBeInTheDocument()
  })

  it('shows an error and retries when the company list fails to load', async () => {
    const user = userEvent.setup()
    mockFetch({ ok: false, status: 500 }, jsonResponse(nineCompanies))
    renderExploreCompanies()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Companies could not be loaded.',
    )

    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect((await findCompanyGrid()).getAllByRole('link')).toHaveLength(6)
  })

  it('supports keyboard focus on search and company detail links', async () => {
    const user = userEvent.setup()
    mockFetch(jsonResponse(nineCompanies))
    renderExploreCompanies()
    await findCompanyGrid()

    await user.tab()
    expect(
      screen.getByRole('searchbox', { name: 'Search companies by name' }),
    ).toHaveFocus()

    await user.tab()
    expect(
      screen.getByRole('link', { name: 'View Company A company details' }),
    ).toHaveFocus()
  })

  it('navigates to the selected company details loaded from the API', async () => {
    const user = userEvent.setup()
    mockFetch(
      jsonResponse(nineCompanies),
      jsonResponse(nineCompanies),
      jsonResponse(companyDetailsRecord()),
    )
    renderExploreCompanies()
    await findCompanyGrid()

    await user.click(
      screen.getByRole('link', { name: 'View Company A company details' }),
    )

    expect(
      await screen.findByRole('heading', { name: 'Company A' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Software Engineering')).toBeInTheDocument()
    expect(screen.getByText('Java')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Check my match' })).toHaveAttribute(
      'href',
      '/matching-profile',
    )
  })

  it('reveals the remaining companies with the show-more control', async () => {
    const user = userEvent.setup()
    mockFetch(jsonResponse(nineCompanies))
    renderExploreCompanies()
    await findCompanyGrid()

    await user.click(screen.getByRole('button', { name: '+ Show More Companies' }))

    expect((await findCompanyGrid()).getAllByRole('link')).toHaveLength(9)
  })
})
