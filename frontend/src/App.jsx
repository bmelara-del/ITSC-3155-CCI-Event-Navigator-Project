import { Route, Routes } from 'react-router'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import ExploreCompanies from './pages/ExploreCompanies.jsx'
import MatchingProfile from './pages/MatchingProfile.jsx'
import Recommendations from './pages/Recommendations.jsx'
import './App.css'

function App() {
  return (
    <div className="page-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/companies" element={<ExploreCompanies />} />
        <Route path="/matching-profile" element={<MatchingProfile />} />
        <Route path="/recommendations" element={<Recommendations />} />
      </Routes>
    </div>
  )
}

export default App
