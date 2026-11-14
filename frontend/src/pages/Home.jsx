import searchIcon from '../assets/figma/search.svg'
import matchesIcon from '../assets/figma/matches.svg'
import profileIcon from '../assets/figma/profile.svg'
import { Link } from 'react-router'

const opportunities = [
  {
    title: 'Explore Companies',
    description:
      'Browse employees and learn about their industries, roles, and the skills they look for.',
    action: 'Explore Companies',
    to: '/companies',
    icon: searchIcon,
    iconAlt: '',
  },
  {
    title: 'Find Your Matches',
    description:
      'Tell us about your career interests, skills, coursework, and experience to get personalized matches.',
    action: 'Get Matched',
    to: '/matching-profile',
    icon: matchesIcon,
    iconAlt: '',
  },
  {
    title: 'Create Your Profile',
    description: 'Make a profile with us!',
    action: 'Get Started',
    to: '/student-profile',
    icon: profileIcon,
    iconAlt: '',
  },
]

function OpportunityCard({ title, description, action, to, icon, iconAlt }) {
  return (
    <article className="opportunity-card">
      <div className="opportunity-card__icon" aria-hidden="true">
        <img src={icon} alt={iconAlt} />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link className="primary-button" to={to}>
        {action}
      </Link>
    </article>
  )
}

function Home() {
  return (
    <main id="home">
      <section className="intro" aria-labelledby="page-title">
        <h1 id="page-title">
          Find your Next Opportunity
          <span>in CCI</span>
        </h1>
        <p>
          Explore companies, get personalized recommendations and learn how
          to prepare for your future career
        </p>
      </section>

      <section className="opportunities" aria-label="Explore career opportunities">
        {opportunities.map((opportunity) => (
          <OpportunityCard key={opportunity.title} {...opportunity} />
        ))}
      </section>
    </main>
  )
}

export default Home