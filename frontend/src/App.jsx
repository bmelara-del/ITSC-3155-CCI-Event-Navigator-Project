import searchIcon from './assets/figma/search.svg'
import matchesIcon from './assets/figma/matches.svg'
import profileIcon from './assets/figma/profile.svg'
import './App.css'

const opportunities = [
  {
    title: 'Explore Companies',
    description:
      'Browse employees and learn about their industries, roles, and the skills they look for.',
    action: 'Explore Companies',
    icon: searchIcon,
    iconAlt: '',
  },
  {
    title: 'Find Your Matches',
    description:
      'Tell us about your career interests, skills, coursework, and experience to get personalized matches.',
    action: 'Get Matched',
    icon: matchesIcon,
    iconAlt: '',
  },
  {
    title: 'Create Your Profile',
    description: 'Make a profile with us!',
    action: 'Get Started',
    icon: profileIcon,
    iconAlt: '',
  },
]

function OpportunityCard({ title, description, action, icon, iconAlt }) {
  return (
    <article className="opportunity-card">
      <div className="opportunity-card__icon" aria-hidden="true">
        <img src={icon} alt={iconAlt} />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>
      <button className="primary-button" type="button">
        {action}
      </button>
    </article>
  )
}

function App() {

  return (
    <div className="page-shell">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="CCI Career Navigator home">
          CCI Career Navigator
        </a>
        <nav className="site-nav" aria-label="Main navigation">
          <button type="button">Explore Events</button>
          <button type="button">My Matching Profile</button>
          <button type="button">Recommendations</button>
        </nav>
      </header>

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
    </div>
  )
}

export default App
