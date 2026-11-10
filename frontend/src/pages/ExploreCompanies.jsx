import { useMemo, useState } from 'react'
import CompanyCard from '../components/CompanyCard.jsx'
import { sampleCompanies } from '../data/companies.js'
import './ExploreCompanies.css'

const INITIAL_COMPANY_COUNT = 6

function ExploreCompanies() {
  const [query, setQuery] = useState('')
  const [showAllCompanies, setShowAllCompanies] = useState(false)

  const filteredCompanies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return sampleCompanies.filter((company) =>
      company.name.toLowerCase().includes(normalizedQuery),
    )
  }, [query])

  const visibleCompanies =
    query.trim() || showAllCompanies
      ? filteredCompanies
      : filteredCompanies.slice(0, INITIAL_COMPANY_COUNT)
  const canShowMore =
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

      {visibleCompanies.length > 0 ? (
        <section className="company-grid" aria-label="Companies">
          {visibleCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </section>
      ) : (
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
