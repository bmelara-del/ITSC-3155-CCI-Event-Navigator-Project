import { Link } from 'react-router'

const MAX_DESCRIPTION_LENGTH = 120

function truncate(text) {
  if (typeof text !== 'string') {
    return ''
  }

  return text.length > MAX_DESCRIPTION_LENGTH
    ? `${text.slice(0, MAX_DESCRIPTION_LENGTH).trimEnd()}…`
    : text
}

function CompanyCard({ company }) {
  const description = truncate(company.description)

  return (
    <Link
      className="company-card"
      to={`/companies/${company.slug}`}
      aria-label={`View ${company.name} company details`}
    >
      <h2 className="company-card__name">{company.name}</h2>
      <p className="company-card__industry">{company.industry}</p>
      {description && <p className="company-card__detail">{description}</p>}
      <span className="company-card__action">View Company</span>
    </Link>
  )
}

export default CompanyCard
