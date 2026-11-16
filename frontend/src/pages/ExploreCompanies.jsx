import { useEffect, useMemo, useState } from 'react'
import { fetchCompanies } from '../api/companies.js'
import CompanyCard from '../components/CompanyCard.jsx'
import './ExploreCompanies.css'

const INITIAL_COMPANY_COUNT = 6

function ExploreCompanies() {
  const [query, setQuery] = useState('')
  const [showAllCompanies, setShowAllCompanies] = useState(false)
  const [companies, setCompanies] = useState([])
  const [status, setStatus] = useState('loading')
  const [reloadCount, setReloadCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    fetchCompanies({ signal: controller.signal })
      .then((loadedCompanies) => {
        setCompanies(loadedCompanies)
        setStatus('ready')
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setStatus('error')
        }
      })

    return () => controller.abort()
  }, [reloadCount])

  function retryLoading() {
    setStatus('loading')
    setReloadCount((count) => count + 1)
  }

  const filteredCompanies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return companies.filter((company) =>
      company.name.toLowerCase().includes(normalizedQuery),
    )
  }, [companies, query])

  const visibleCompanies =
    query.trim() || showAllCompanies
      ? filteredCompanies
      : filteredCompanies.slice(0, INITIAL_COMPANY_COUNT)
  const canShowMore =
    status === 'ready' &&
    !query.trim() &&
    !showAllCompanies &&
    filteredCompanies.length > INITIAL_COMPANY_COUNT

  return (
    <main className="companies-page">
      <h1 className="companies-page__title">Explore Companies</h1>
      <div className="companies-page__intro">
        <p>Discover employers and career opportunities</p>
        <label className="companies-search">
          <span className="visually-hidden">Search companies by name</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search companies"
          />
        </label>
      </div>

      {status === 'loading' && (
        <p className="companies-page__empty" role="status">
          Loading companies…
        </p>
      )}

      {status === 'error' && (
        <div className="companies-page__empty" role="alert">
          <p>Companies could not be loaded.</p>
          <button type="button" onClick={retryLoading}>
            Try again
          </button>
        </div>
      )}

      {status === 'ready' && visibleCompanies.length > 0 && (
        <section className="company-grid" aria-label="Companies">
          {visibleCompanies.map((company) => (
            <CompanyCard key={company.companyId} company={company} />
          ))}
        </section>
      )}

      {status === 'ready' && visibleCompanies.length === 0 && (
        <p className="companies-page__empty" role="status">
          No companies found. Try another name.
        </p>
      )}

      {canShowMore && (
        <button
          className="companies-page__show-more"
          type="button"
          onClick={() => setShowAllCompanies(true)}
        >
          + Show More Companies
        </button>
      )}
    </main>
  )
}

export default ExploreCompanies
