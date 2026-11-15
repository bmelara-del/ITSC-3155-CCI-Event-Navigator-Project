import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { sampleRecommendations } from '../data/recommendations.js'
import { fetchMatchingProfile } from '../api/matchingProfiles.js'
import './Recommendations.css'

const INITIAL_RECOMMENDATION_COUNT = 6

function RecommendationCard({ recommendation, matchingProfile }) {
  const { id, name, industry, roles, skills } = recommendation
  const companySlug = recommendation.slug || id || recommendation.companyId

  return (
    <article
      className={`recommendation-card${id === 'northwind-analytics' ? ' is-featured' : ''}`}
    >
      <header className="recommendation-card__header">
        <div>
          <h2>{name}</h2>
          <p>{industry}</p>
        </div>
        <span className="recommendation-card__score" aria-label="Match score unavailable">
          Score unavailable
        </span>
      </header>
      <p className="recommendation-card__detail">Roles: {roles.join(', ')}</p>
      <p className="recommendation-card__detail">
        Skills: {skills.join(' | ')}
      </p>
      <Link
        className="recommendation-card__action"
        to={`/recommendations/${encodeURIComponent(companySlug)}/details`}
        state={{ recommendation, matchingProfile }}
        aria-label={`View Match Details for ${name}`}
      >
        View Match Details
      </Link>
    </article>
  )
}

function Recommendations() {
  const [profileState, setProfileState] = useState({
    status: 'loading',
    profile: null,
    error: '',
  })
  const [retryCount, setRetryCount] = useState(0)
  const [showAllRecommendations, setShowAllRecommendations] = useState(false)

  useEffect(() => {
    let active = true

    fetchMatchingProfile()
      .then((profile) => {
        if (active) {
          setProfileState({ status: 'loaded', profile, error: '' })
        }
      })
      .catch((error) => {
        if (active) {
          setProfileState({
            status: 'error',
            profile: null,
            error:
              error instanceof Error
                ? error.message
                : 'Your matching profile could not be loaded.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [retryCount])

  if (profileState.status === 'loading') {
    return (
      <main className="recommendations-page recommendations-page--empty">
        <section className="recommendations-empty" role="status">
          <h1>Loading your saved profile</h1>
          <p>Checking that your matching profile is ready for recommendations.</p>
        </section>
      </main>
    )
  }

  if (profileState.status === 'error') {
    return (
      <main className="recommendations-page recommendations-page--empty">
        <section className="recommendations-empty" role="alert">
          <h1>Your matching profile could not be checked</h1>
          <p>{profileState.error}</p>
          <button
            className="recommendations-empty__action"
            type="button"
            onClick={() => {
              setProfileState({ status: 'loading', profile: null, error: '' })
              setRetryCount((count) => count + 1)
            }}
          >
            Try again
          </button>
        </section>
      </main>
    )
  }

  const matchingProfile = profileState.profile

  if (!matchingProfile) {
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
            Match scores and explanations are not available yet.
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
            matchingProfile={matchingProfile}
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