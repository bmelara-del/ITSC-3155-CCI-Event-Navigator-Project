import { Link } from 'react-router'

function CompanyCard({ company }) {
  return (
    <Link
      className="company-card"
      to={`/companies/${company.id}`}
      aria-label={`View ${company.name} company details`}
    >
      <h2 className="company-card__name">{company.name}</h2>
      <p className="company-card__industry">{company.industry}</p>
      <p className="company-card__detail">Roles: {company.roles.join(', ')}</p>
      <p className="company-card__detail">
        Skills: {company.skills.join(' | ')}
      </p>
      <span className="company-card__action">View Company</span>
    </Link>
  )
}

export default CompanyCard
