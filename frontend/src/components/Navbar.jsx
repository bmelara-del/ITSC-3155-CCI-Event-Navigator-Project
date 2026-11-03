import { NavLink } from 'react-router'

const navigationLinks = [
  { label: 'Home', to: '/' },
  { label: 'Explore Companies', to: '/companies' },
  { label: 'My Matching Profile', to: '/matching-profile' },
  { label: 'Recommendations', to: '/recommendations' },
]

function Navbar() {
  return (
    <header className="site-header">
      <NavLink className="brand" to="/" end aria-label="CCI Career Navigator home">
        CCI Career Navigator
      </NavLink>
      <nav className="site-nav" aria-label="Main navigation">
        {navigationLinks.map(({ label, to }) => (
          <NavLink
            key={to}
            className={({ isActive }) =>
              isActive ? 'site-nav__link is-active' : 'site-nav__link'
            }
            to={to}
            end={to === '/'}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

export default Navbar