import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useNavigate } from 'react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import MatchDetails from './MatchDetails.jsx'

afterEach(() => {
  vi.unstubAllGlobals()
  localStorage.clear()
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
  roleId,
} = {}) {
  const entry = {
    pathname: `/recommendations/${id}/details`,
    ...(roleId ? { search: `?roleId=${encodeURIComponent(roleId)}` } : {}),
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

function CompanySwitcher() {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() =>
        navigate('/recommendations/company-c/details', {
          state: {
            recommendation: {
              id: 'company-c',
              name: 'Company C',
              roles: ['Cloud Engineer'],
            },
            matchingProfile,
          },
        })
      }
    >
      Open Company C
    </button>
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
    expect(localStorage.getItem('match-prep-company-b-uuid')).toBe(
      JSON.stringify([true, true, true, false]),
    )
  })

  it('restores saved task progress for the selected recommendation when switching companies', async () => {
    const user = userEvent.setup()
    const companyB = companyRecord()
    const companyC = companyRecord({
      companyId: 'company-c-uuid',
      slug: 'company-c',
      name: 'Company C',
      roles: [
        {
          roleId: 'role-c-uuid',
          slug: 'cloud-engineer',
          title: 'Cloud Engineer',
          description: 'Build cloud infrastructure.',
          location: 'Raleigh, NC',
          employmentType: 'INTERNSHIP',
          workArrangement: 'REMOTE',
          term: 'Summer 2027',
          minimumExperienceLevel: { label: 'Beginner / No internship' },
          isActive: true,
          skills: [{ name: 'AWS' }],
          coursework: [],
          careerInterests: [],
        },
      ],
    })
    const companies = [companyB, companyC]
    localStorage.setItem(
      'match-prep-company-b-uuid',
      JSON.stringify([false, true, false, false]),
    )
    localStorage.setItem(
      'match-prep-company-c-uuid',
      JSON.stringify([true, false, true, true]),
    )
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url) => {
        if (url.endsWith('/companies')) {
          return {
            ok: true,
            json: async () =>
              companies.map(({ companyId, slug, name }) => ({
                companyId,
                slug,
                name,
              })),
          }
        }

        const company = companies.find((item) =>
          url.endsWith(`/companies/${item.companyId}`),
        )
        return {
          ok: Boolean(company),
          status: company ? 200 : 404,
          json: async () => company,
        }
      }),
    )

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: '/recommendations/company-b/details',
            state: { recommendation, matchingProfile },
          },
        ]}
      >
        <CompanySwitcher />
        <Routes>
          <Route
            path="/recommendations/:companySlug/details"
            element={<MatchDetails />}
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('1 of 4 steps complete')).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Review your match summary' }),
    ).not.toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: 'Research Company B' }),
    ).toBeChecked()

    await user.click(screen.getByRole('button', { name: 'Open Company C' }))

    expect(await screen.findByText('3 of 4 steps complete')).toBeInTheDocument()
    expect(
      screen.getByRole('checkbox', { name: 'Review your match summary' }),
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: 'Research Company C' }),
    ).not.toBeChecked()
    expect(
      screen.getByRole('checkbox', { name: 'Tailor your resume for this role' }),
    ).toBeChecked()
    expect(
      screen.getByRole('checkbox', {
        name: 'Practice your top interview questions',
      }),
    ).toBeChecked()
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

  it('restores the selected role from the URL after a direct page load', async () => {
    const company = companyRecord({
      roles: [
        ...companyRecord().roles,
        {
          roleId: 'role-b-cloud',
          slug: 'cloud-engineer',
          title: 'Cloud Engineer',
          description: 'Build cloud infrastructure.',
          location: 'Raleigh, NC',
          employmentType: 'INTERNSHIP',
          workArrangement: 'REMOTE',
          term: 'Summer 2027',
          minimumExperienceLevel: { label: 'Some project or work experience' },
          isActive: true,
          skills: [{ name: 'AWS' }],
          coursework: [],
          careerInterests: [],
        },
      ],
    })
    mockCompanyApi(company)

    renderMatchDetails({
      id: 'company-b',
      includeState: false,
      roleId: 'role-b-cloud',
    })

    expect(
      await screen.findByText(
        'Cloud Engineer · Raleigh, NC · Internship · Remote · Summer 2027 · Some project or work experience',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Build cloud infrastructure.')).toBeInTheDocument()
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
