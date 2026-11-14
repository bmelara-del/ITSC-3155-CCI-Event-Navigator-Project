import { Link, useParams } from 'react-router'
import matchCallout from '../assets/figma/company-match-callout.svg'
import skillChip from '../assets/figma/company-skill-chip.svg'
import { northwindAnalytics, sampleCompanies } from '../data/companies.js'
import './CompanyDetails.css'

function CompanyDetails() {
  const { companyId } = useParams()
  const company = [northwindAnalytics, ...sampleCompanies].find(
    ({ id }) => id === companyId,
  )

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

  return (
    <main className="company-details">
      <h1>{company.name}</h1>
      <p className="company-details__industry">{company.industry}</p>
      <section className="company-details__section" aria-labelledby="company-about">
        <h2 id="company-about">About the Company</h2>
        <p>{company.description}</p>
      </section>

      {company.roles.length > 0 && (
        <section
          className="company-details__section company-details__roles"
          aria-labelledby="company-roles"
        >
          <h2 id="company-roles">Relevant Technical Roles</h2>
          <p>{company.roles.join(' | ')}</p>
        </section>
      )}

      {company.skills.length > 0 && (
        <section
          className="company-details__section company-details__skills"
          aria-labelledby="company-skills"
        >
          <h2 id="company-skills">Relevant Skills</h2>
          <ul className="company-details__skill-list">
            {company.skills.map((skill) => (
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
