import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { fetchMatchingProfile } from '../api/matchingProfiles.js'
import { fetchRecommendations } from '../api/recommendations.js'
import './Recommendations.css'

const INITIAL_RECOMMENDATION_COUNT = 6

function RecommendationCard({ recommendation, matchingProfile, isFeatured }) {
  const {
    roleId,
    title,
    companyName,
    companySlug,
    score,
    matchedSkills,
    missingSkills,
  } = recommendation
  const hasScore = Number.isFinite(score)
  const detailsRecommendation = {
    ...recommendation,
    id: roleId,
    slug: companySlug,
    name: companyName,
    roleTitle: title,
    roles: [title],
  }

  return (
    <article
      className={`recommendation-card${isFeatured ? ' is-featured' : ''}`}
    >
      <header className="recommendation-card__header">
        <div>
          <h2>{companyName}</h2>
          <p>{title}</p>
        </div>
        <span
          className="recommendation-card__score"
          aria-label={
            hasScore ? `Match score: ${score}%` : 'Match score unavailable'
          }
        >
          {hasScore ? `${score}% Match` : 'Score unavailable'}
        </span>
      </header>
      {matchedSkills.length > 0 && (
        <p className="recommendation-card__detail">
          Matched skills: {matchedSkills.join(' | ')}
        </p>
      )}
      <p className="recommendation-card__detail">
        Skills to build:{' '}
        {missingSkills.length > 0 ? missingSkills.join(' | ') : 'None'}
      </p>
      <Link
        className="recommendation-card__action"
        to={
          `/recommendations/${encodeURIComponent(companySlug)}/details?roleId=${encodeURIComponent(roleId)}`
        }
        state={{ recommendation: detailsRecommendation, matchingProfile }}
        aria-label={`View Match Details for ${companyName} — ${title}`}
      >
        View Match Details
      </Link>
    </article>
  )
}

function Recommendations() {
  const [pageState, setPageState] = useState({
    status: 'loading-profile',
    profile: null,
    recommendations: [],
    error: '',
  })
  const [retryCount, setRetryCount] = useState(0)
  const [showAllRecommendations, setShowAllRecommendations] = useState(false)

  useEffect(() => {
    let active = true
    let savedProfile = null
    const controller = new AbortController()

    fetchMatchingProfile({ signal: controller.signal })
      .then(async (profile) => {
        if (!active) {
          return
        }

        if (!profile) {
          setPageState({
            status: 'no-profile',
            profile: null,
            recommendations: [],
            error: '',
          })
          return
        }

        savedProfile = profile
        setPageState({
          status: 'loading-recommendations',
          profile,
          recommendations: [],
          error: '',
        })

        const recommendations = await fetchRecommendations({
          signal: controller.signal,
        })

        if (!active) {
          return
        }

        if (recommendations === null) {
          setPageState({
            status: 'no-profile',
            profile: null,
            recommendations: [],
            error: '',
          })
          return
        }

        setPageState({
          status: recommendations.length === 0 ? 'empty' : 'success',
          profile,
          recommendations,
          error: '',
        })
      })
      .catch((error) => {
        if (!active || error?.name === 'AbortError') {
          return
        }

        setPageState({
          status: savedProfile ? 'recommendation-error' : 'profile-error',
          profile: savedProfile,
          recommendations: [],
          error:
            error instanceof Error
              ? error.message
              : savedProfile
                ? 'Your recommendations could not be loaded.'
                : 'Your matching profile could not be loaded.',
        })
      })

    return () => {
      active = false
      controller.abort()
    }
  }, [retryCount])

  if (pageState.status === 'loading-profile') {
    return (
      <main className="recommendations-page recommendations-page--empty">
        <section className="recommendations-empty" role="status">
          <h1>Loading your saved profile</h1>
          <p>Checking that your matching profile is ready for recommendations.</p>
        </section>
      </main>
    )
  }

  if (pageState.status === 'profile-error') {
    return (
      <main className="recommendations-page recommendations-page--empty">
        <section className="recommendations-empty" role="alert">
          <h1>Your matching profile could not be checked</h1>
          <p>{pageState.error}</p>
          <button
            className="recommendations-empty__action"
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Try again
          </button>
        </section>
      </main>
    )
  }

  const matchingProfile = pageState.profile

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
            Your profile helps us find company roles that fit your background.
          </p>
          <Link className="recommendations-empty__action" to="/matching-profile">
            Go to My Matching Profile
          </Link>
        </section>
      </main>
    )
  }

  const recommendations = pageState.recommendations
  const visibleRecommendations = showAllRecommendations
    ? recommendations
    : recommendations.slice(0, INITIAL_RECOMMENDATION_COUNT)
  const hasMoreRecommendations =
    recommendations.length > INITIAL_RECOMMENDATION_COUNT

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
          {matchingProfile.experienceLevel}.
        </p>
      </header>

      {pageState.status === 'loading-recommendations' && (
        <section
          className="recommendations-empty recommendations-page__result-state"
          role="status"
        >
          <h2>Loading recommendations</h2>
          <p>Finding active roles that match your saved profile.</p>
        </section>
      )}

      {pageState.status === 'recommendation-error' && (
        <section
          className="recommendations-empty recommendations-page__result-state"
          role="alert"
        >
          <h2>Your recommendations could not be loaded</h2>
          <p>{pageState.error}</p>
          <button
            className="recommendations-empty__action"
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Try again
          </button>
        </section>
      )}

      {pageState.status === 'empty' && (
        <section
          className="recommendations-empty recommendations-page__result-state"
          role="status"
        >
          <h2>No role recommendations are available yet</h2>
          <p>Check back later for active roles that match your profile.</p>
        </section>
      )}

      {pageState.status === 'success' && (
        <section
          className="recommendation-grid"
          aria-label="Personalized role recommendations"
        >
          {visibleRecommendations.map((recommendation, index) => (
            <RecommendationCard
              key={recommendation.roleId}
              recommendation={recommendation}
              matchingProfile={matchingProfile}
              isFeatured={index === 0}
            />
          ))}
        </section>
      )}

      {pageState.status === 'success' && hasMoreRecommendations && (
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