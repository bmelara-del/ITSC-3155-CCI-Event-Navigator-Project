import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { fetchCompanyBySlug } from '../api/companies.js'
import matchCallout from '../assets/figma/company-match-callout.svg'
import skillChip from '../assets/figma/company-skill-chip.svg'
import './CompanyDetails.css'

function getRoleTitles(company) {
  return (company.roles ?? []).map((role) => role.title).filter(Boolean)
}

function getSkillNames(company) {
  const names = (company.roles ?? []).flatMap((role) =>
    (role.skills ?? []).map((skill) => skill.name),
  )

  return [...new Set(names.filter(Boolean))]
}

function CompanyDetails() {
  const { companySlug } = useParams()
  const [loaded, setLoaded] = useState({ slug: null, company: null, error: false })

  useEffect(() => {
    const controller = new AbortController()

    fetchCompanyBySlug(companySlug, { signal: controller.signal })
      .then((company) => setLoaded({ slug: companySlug, company, error: false }))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setLoaded({ slug: companySlug, company: null, error: true })
        }
      })

    return () => controller.abort()
  }, [companySlug])

  if (loaded.slug !== companySlug) {
    return (
      <main className="company-details">
        <p role="status">Loading company…</p>
      </main>
    )
  }

  if (loaded.error) {
    return (
      <main className="company-details">
        <section className="company-details__not-found" role="alert">
          <h1>Company could not be loaded</h1>
          <p>Something went wrong while loading this company. Please try again.</p>
        </section>
        <Link className="company-details__back" to="/companies">
          Back to Explore Companies
        </Link>
      </main>
    )
  }

  const { company } = loaded

  if (!company) {
    return (
      <main className="company-details">
        <section className="company-details__not-found" role="status">
          <h1>Company not found</h1>
          <p>We couldn&apos;t find a company with that ID.</p>
        </section>
        <Link className="company-details__back" to="/companies">
          Back to Explore Companies
        </Link>
      </main>
    )
  }

  const roleTitles = getRoleTitles(company)
  const skillNames = getSkillNames(company)

  return (
    <main className="company-details">
      <h1>{company.name}</h1>
      <p className="company-details__industry">{company.industry}</p>
      <section className="company-details__section" aria-labelledby="company-about">
        <h2 id="company-about">About the Company</h2>
        <p>{company.description}</p>
      </section>

      {roleTitles.length > 0 && (
        <section
          className="company-details__section company-details__roles"
          aria-labelledby="company-roles"
        >
          <h2 id="company-roles">Relevant Technical Roles</h2>
          <p>{roleTitles.join(' | ')}</p>
        </section>
      )}

      {skillNames.length > 0 && (
        <section
          className="company-details__section company-details__skills"
          aria-labelledby="company-skills"
        >
          <h2 id="company-skills">Relevant Skills</h2>
          <ul className="company-details__skill-list">
            {skillNames.map((skill) => (
              <li className="company-details__skill" key={skill}>
                <img src={skillChip} alt="" />
                <span>{skill}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="company-details__match" aria-labelledby="company-match">
        <img
          className="company-details__match-background"
          src={matchCallout}
          alt=""
        />
        <div className="company-details__match-content">
          <h2 id="company-match">Interested in this Company?</h2>
          <p>
            See how your background and career interests compare with this
            employer
          </p>
          <Link className="company-details__match-link" to="/matching-profile">
            Check my match
          </Link>
        </div>
      </section>
    </main>
  )
}

export default CompanyDetails
