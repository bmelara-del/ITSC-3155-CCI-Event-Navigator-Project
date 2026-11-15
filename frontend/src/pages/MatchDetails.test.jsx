import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MatchDetails from './MatchDetails.jsx'

afterEach(() => {
  vi.unstubAllGlobals()
})

const recommendation = {
  id: 'company-b',
  name: 'Company B',
  industry: 'Financial Services',
  roles: ['Software Development'],
  skills: ['Python', 'SQL', 'Cloud'],
  location: 'Charlotte, NC',
  workArrangement: 'HYBRID',
  term: 'Spring 2027',
}

const matchingProfile = {
  careerInterest: 'Software Engineering',
  skills: ['Java', 'SQL', 'Git'],
  coursework: ['Data Structures', 'Database Design'],
  experienceLevel: 'Beginner / No internship',
}

function companyRecord(overrides = {}) {
  return {
    companyId: 'company-b-uuid',
    slug: 'company-b',
    name: 'Company B',
    industry: 'Financial Services',
    description: 'PostgreSQL company description.',
    roles: [
      {
        roleId: 'role-b-uuid',
        slug: 'software-development',
        title: 'Software Development',
        description: 'Build and maintain financial software.',
        location: 'Charlotte, NC',
        employmentType: 'INTERNSHIP',
        workArrangement: 'HYBRID',
        term: 'Spring 2027',
        minimumExperienceLevel: { label: 'Beginner / No internship' },
        isActive: true,
        skills: [{ name: 'Python' }, { name: 'SQL' }, { name: 'Cloud' }],
        coursework: [{ name: 'Database Design' }, { name: 'Machine Learning' }],
        careerInterests: [{ label: 'Software Engineering' }],
      },
    ],
    ...overrides,
  }
}

function mockCompanyApi(...companies) {
  const responses = companies.flatMap((company) => [
    {
      ok: true,
      json: async () =>
        company
          ? [
              {
                companyId: company.companyId,
                slug: company.slug,
                name: company.name,
              },
            ]
          : [],
    },
    ...(company
      ? [
          {
            ok: true,
            status: 200,
            json: async () => company,
          },
        ]
      : []),
  ])
  const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(responses.shift()))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function renderMatchDetails({
  id = recommendation.id,
  selectedRecommendation = recommendation,
  profile = matchingProfile,
  includeState = true,
} = {}) {
  const entry = {
    pathname: `/recommendations/${id}/details`,
    ...(includeState
      ? { state: { recommendation: selectedRecommendation, matchingProfile: profile } }
      : {}),
  }

  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route
          path="/recommendations/:companySlug/details"
          element={<MatchDetails />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('MatchDetails', () => {
  it('renders company and role information from the company API', async () => {
    mockCompanyApi(companyRecord())
    renderMatchDetails()

    expect(
      await screen.findByRole('heading', { name: 'Match Details and Prep' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: 'Company B' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Software Development · Charlotte, NC · Internship · Hybrid · Spring 2027 · Beginner / No internship',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('PostgreSQL company description.')).toBeInTheDocument()
    expect(
      screen.getByText('Build and maintain financial software.'),
    ).toBeInTheDocument()
    expect(screen.getByText(/Role interests: Software Engineering/))
      .toBeInTheDocument()
    expect(screen.getByText(/Required coursework: Database Design, Machine Learning/))
      .toBeInTheDocument()
    expect(screen.getByText('N/A')).toBeInTheDocument()
    expect(
      screen.getByText(/Matching results are not provided by the current backend/),
    ).toBeInTheDocument()
    expect(screen.getAllByText('Unavailable')).toHaveLength(4)
    expect(
      screen.getByRole('region', {
        name: 'What you told us versus what the company needs',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Skills selected: Java, SQL, Git/))
      .toBeInTheDocument()
    expect(screen.getByText(/Skills listed: Python, SQL, Cloud/))
      .toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Questions to be ready for' }),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(10)
  })

  it('updates prep checklist completion and progress when tasks are checked', async () => {
    const user = userEvent.setup()
    mockCompanyApi(companyRecord())
    renderMatchDetails()

    expect(
      await screen.findByText('2 of 4 steps complete'),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('checkbox', { name: 'Review your match summary' }),
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: 'Tailor your resume for this role' }),
    ).not.toBeChecked()

    await user.click(
      screen.getByRole('checkbox', { name: 'Tailor your resume for this role' }),
    )

    expect(screen.getByText('3 of 4 steps complete')).toBeInTheDocument()
    expect(
      screen.getByRole('progressbar', { name: 'Prep plan progress' }),
    ).toHaveAttribute('aria-valuenow', '3')
  })

  it('loads the selected company directly from PostgreSQL data', async () => {
    mockCompanyApi(
      companyRecord({
        companyId: 'company-c-uuid',
        slug: 'company-c',
        name: 'Company C',
        roles: [
          {
            title: 'Security Analyst',
            location: null,
            workArrangement: null,
            isActive: true,
            skills: [{ name: 'Linux' }, { name: 'Networking' }],
          },
        ],
      }),
    )

    renderMatchDetails({ id: 'company-c', includeState: false })

    expect(
      await screen.findByRole('heading', { name: 'Company C' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Security Analyst · Location details coming soon/))
      .toBeInTheDocument()
  })

  it('loads API company details when directly opening a company slug', async () => {
    const fetchMock = mockCompanyApi(
      companyRecord({
        name: 'API Company B',
        industry: 'Technology',
        roles: [
          {
            title: 'Backend Engineer',
            description: 'Build API services.',
            location: 'Raleigh, NC',
            workArrangement: 'REMOTE',
            term: 'Fall 2027',
            isActive: true,
            skills: [{ name: 'Kubernetes' }],
          },
        ],
      }),
    )

    renderMatchDetails({ id: 'company-b', includeState: false })

    expect(
      await screen.findByRole('heading', { name: 'API Company B' }),
    ).toBeInTheDocument()
    expect(screen.getByText(/Backend Engineer · Raleigh, NC · Remote · Fall 2027/))
      .toBeInTheDocument()
    expect(screen.getByText('Build API services.')).toBeInTheDocument()
    expect(screen.getByText('Skills listed: Kubernetes')).toBeInTheDocument()
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3001/api/companies',
      { signal: undefined },
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3001/api/companies/company-b-uuid',
      { signal: undefined },
    )
  })

  it('shows a useful not-found state for an invalid company slug', async () => {
    mockCompanyApi(null)

    renderMatchDetails({ id: 'unknown-company', includeState: false })

    expect(
      await screen.findByRole('heading', { name: 'Company not found' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Back to Recommendations' }),
    ).toHaveAttribute('href', '/recommendations')
  })

  it('shows a loading state while the company API responds', async () => {
    let resolveCompanyList
    const companyListResponse = new Promise((resolve) => {
      resolveCompanyList = resolve
    })
    vi.stubGlobal('fetch', vi.fn(() => companyListResponse))

    renderMatchDetails({ id: 'unknown-company', includeState: false })

    expect(
      screen.getByRole('heading', { name: 'Loading company details' }),
    ).toBeInTheDocument()

    resolveCompanyList({
      ok: true,
      json: async () => [],
    })
    expect(
      await screen.findByRole('heading', { name: 'Company not found' }),
    ).toBeInTheDocument()
  })

  it('shows updated company data after a fresh API lookup', async () => {
    mockCompanyApi(
      companyRecord({
        name: 'Company B, First Version',
        description: 'First database version.',
      }),
      companyRecord({
        name: 'Company B, Updated Version',
        description: 'Updated database version.',
      }),
    )

    const firstRender = renderMatchDetails()
    expect(
      await screen.findByRole('heading', {
        name: 'Company B, First Version',
      }),
    ).toBeInTheDocument()
    firstRender.unmount()

    renderMatchDetails({ includeState: false })
    expect(
      await screen.findByRole('heading', {
        name: 'Company B, Updated Version',
      }),
    ).toBeInTheDocument()
    expect(screen.getByText('Updated database version.')).toBeInTheDocument()
  })

  it('shows an error state when the company API is unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 500 }),
    )

    renderMatchDetails({ includeState: false })

    expect(
      await screen.findByRole('heading', {
        name: 'Company details are unavailable',
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' }))
      .toBeInTheDocument()
  })
})
