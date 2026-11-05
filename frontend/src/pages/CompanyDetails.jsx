import { Link, useParams } from 'react-router'
import { sampleCompanies } from '../data/companies.js'

function CompanyDetails() {
  const { companyId } = useParams()
  const company = sampleCompanies.find(({ id }) => id === companyId)

  if (!company) {
    return (
      <main className="company-details">
        <h1>Company not found</h1>
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
      <section className="company-details__section" aria-labelledby="company-roles">
        <h2 id="company-roles">Roles</h2>
        <p>{company.roles.join(', ')}</p>
      </section>
      <section
        className="company-details__section"
        aria-labelledby="company-skills"
      >
        <h2 id="company-skills">Skills</h2>
        <p>{company.skills.join(' | ')}</p>
      </section>
      <Link className="company-details__back" to="/companies">
        Back to Explore Companies
      </Link>
    </main>
  )
}

export default CompanyDetails
