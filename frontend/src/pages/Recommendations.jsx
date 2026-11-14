import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { sampleRecommendations } from '../data/recommendations.js'
import './Recommendations.css'

const INITIAL_RECOMMENDATION_COUNT = 6

function isMatchingProfile(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.careerInterest === 'string' &&
    value.careerInterest.length > 0 &&
    Array.isArray(value.skills) &&
    value.skills.every((skill) => typeof skill === 'string') &&
    Array.isArray(value.coursework) &&
    value.coursework.every((course) => typeof course === 'string') &&
    typeof value.experienceLevel === 'string' &&
    value.experienceLevel.length > 0
  )
}

function RecommendationCard({ recommendation }) {
  const { id, name, industry, roles, skills, matchPercent } = recommendation

  return (
    <article
      className={`recommendation-card${id === 'northwind-analytics' ? ' is-featured' : ''}`}
    >
      <header className="recommendation-card__header">
        <div>
          <h2>{name}</h2>
          <p>{industry}</p>
        </div>
        <span
          className="recommendation-card__score"
          aria-label={`Illustrative demo score: ${matchPercent}%`}
        >
          {matchPercent}% demo score
        </span>
      </header>
      <p className="recommendation-card__detail">Roles: {roles.join(', ')}</p>
      <p className="recommendation-card__detail">
        Skills: {skills.join(' | ')}
      </p>
      <Link
        className="recommendation-card__action"
        to={`/companies/${id}`}
        aria-label={`View Match Details for ${name}`}
      >
        View Match Details
      </Link>
    </article>
  )
}

function Recommendations() {
  const { state } = useLocation()
  const matchingProfile = state?.matchingProfile
  const [showAllRecommendations, setShowAllRecommendations] = useState(false)

  if (!isMatchingProfile(matchingProfile)) {
    return (
      <main className="recommendations-page recommendations-page--empty">
        <section
          className="recommendations-empty"
          role="status"
          aria-labelledby="recommendations-empty-title"
        >
          <h1 id="recommendations-empty-title">
            Complete your Matching Profile first
          </h1>
          <p>
            Your profile helps us show the sample company recommendations for
            this demo.
          </p>
          <Link className="recommendations-empty__action" to="/matching-profile">
            Go to My Matching Profile
          </Link>
        </section>
      </main>
    )
  }

  const recommendations = showAllRecommendations
    ? sampleRecommendations
    : sampleRecommendations.slice(0, INITIAL_RECOMMENDATION_COUNT)
  const hasMoreRecommendations =
    sampleRecommendations.length > INITIAL_RECOMMENDATION_COUNT

  return (
    <main className="recommendations-page">
      <header className="recommendations-page__intro">
        <h1>Recommended Companies</h1>
        <p>
          Based on your interests, skills, and experience, here are companies
          and roles that match your profile
        </p>
        <p className="recommendations-page__profile-summary">
          Your profile: {matchingProfile.careerInterest} |{' '}
          {matchingProfile.skills.length > 0
            ? matchingProfile.skills.join(', ')
            : 'No skills selected'}{' '}
          | {matchingProfile.coursework.length} course
          {matchingProfile.coursework.length === 1 ? '' : 's'} |{' '}
          {matchingProfile.experienceLevel}.{' '}
          <span className="recommendations-page__demo-note">
            Demo scores are illustrative and are not calculated.
          </span>
        </p>
      </header>

      <section
        className="recommendation-grid"
        aria-label="Sample company recommendations"
      >
        {recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
          />
        ))}
      </section>

      {hasMoreRecommendations && (
        <button
          className="recommendations-page__show-more"
          type="button"
          aria-expanded={showAllRecommendations}
          onClick={() => setShowAllRecommendations((showing) => !showing)}
        >
          {showAllRecommendations
            ? 'Show Fewer Recommendations'
            : '+ Show More Recommendations'}
        </button>
      )}
    </main>
  )
}

export default Recommendations