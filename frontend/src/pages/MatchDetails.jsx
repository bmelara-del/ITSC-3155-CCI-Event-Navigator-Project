import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import scoreRing from '../assets/figma/match-score-ring.svg'
import scoreRingInner from '../assets/figma/match-score-ring-inner.svg'
import comparisonRowDivider from '../assets/figma/match-comparison-row-divider.svg'
import comparisonColumnDivider from '../assets/figma/match-comparison-column-divider.svg'
import prepCheck from '../assets/figma/match-prep-check.svg'
import questionNumber from '../assets/figma/match-question-number.svg'
import { fetchCompanyBySlug } from '../api/companies.js'
import './MatchDetails.css'

const INITIAL_COMPLETED_TASKS = [true, true, false, false]

const UNAVAILABLE_METRICS = [
  'Skills alignment',
  'Career interests',
  'Work style and culture',
  'Location and schedule',
]

const DEFAULT_QUESTIONS = [
  'Tell us about a project where you used your skills to solve a problem.',
  'How would you explain a technical result to someone outside your field?',
  'Describe a time you worked with others to solve a challenge.',
  'What do you hope to learn in this role?',
]

function isRecommendation(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    (typeof value.slug === 'string' ||
      typeof value.id === 'string' ||
      typeof value.companyId === 'string') &&
    typeof value.name === 'string'
  )
}

function getCompanySlug(value) {
  return value?.slug || value?.id || value?.companyId
}

function getStringList(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string' && item.length > 0)
    : []
}

function getRecordNames(records, property) {
  return Array.isArray(records)
    ? records
        .map((record) => record?.[property])
        .filter((value) => typeof value === 'string' && value.length > 0)
    : []
}

function getApiRecommendation(company, preferredRoleName) {
  if (
    !company ||
    typeof company.companyId !== 'string' ||
    typeof company.slug !== 'string' ||
    typeof company.name !== 'string'
  ) {
    throw new Error('The company details response was invalid.')
  }

  const roles = Array.isArray(company.roles)
    ? company.roles.filter((role) => role && typeof role === 'object')
    : []
  const primaryRole =
    roles.find(
      (role) =>
        role.title === preferredRoleName || role.slug === preferredRoleName,
    ) ||
    roles.find((role) => role.isActive) ||
    roles[0] ||
    {}

  return {
    id: company.companyId,
    slug: company.slug,
    name: company.name,
    industry: company.industry,
    description: company.description,
    roles: roles
      .map((role) => role?.title)
      .filter((title) => typeof title === 'string' && title.length > 0),
    roleTitle: primaryRole.title,
    roleDescription: primaryRole.description,
    location: primaryRole.location,
    employmentType: primaryRole.employmentType,
    workArrangement: primaryRole.workArrangement,
    term: primaryRole.term,
    minimumExperienceLevel: primaryRole.minimumExperienceLevel?.label,
    skills: getRecordNames(primaryRole.skills, 'name'),
    coursework: getRecordNames(primaryRole.coursework, 'name'),
    careerInterests: getRecordNames(primaryRole.careerInterests, 'label'),
  }
}

function formatWorkArrangement(value) {
  if (typeof value !== 'string' || value.length === 0) {
    return 'Work arrangement details coming soon'
  }

  return value
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function MetricBar({ metric }) {
  return (
    <div className="match-details__metric">
      <div className="match-details__metric-heading">
        <h3>{metric}</h3>
        <span>Unavailable</span>
      </div>
      <div className="match-details__metric-track" aria-hidden="true">
        <span style={{ width: '0%' }} />
      </div>
      <p>Not provided by the matching service.</p>
    </div>
  )
}

function MatchDetails({
  recommendation: providedRecommendation,
  matchingProfile: providedMatchingProfile,
} = {}) {
  const { companySlug } = useParams()
  const { state } = useLocation()
  const routeRecommendation = isRecommendation(state?.recommendation)
    ? state.recommendation
    : null
  const providedMatch =
    isRecommendation(providedRecommendation) &&
    getCompanySlug(providedRecommendation) === companySlug
      ? providedRecommendation
      : null
  const routeMatch =
    routeRecommendation &&
    getCompanySlug(routeRecommendation) === companySlug
      ? routeRecommendation
      : null
  const selectedRecommendation = providedMatch || routeMatch
  const preferredRoleName =
    selectedRecommendation?.roleTitle ||
    selectedRecommendation?.role?.title ||
    getStringList(selectedRecommendation?.roles)[0]
  const matchingProfile =
    providedMatchingProfile ?? state?.matchingProfile ?? {}
  const [apiState, setApiState] = useState({
    slug: null,
    status: 'loading',
    recommendation: null,
  })
  const [retryCount, setRetryCount] = useState(0)
  const [taskState, setTaskState] = useState({
    recommendationId: null,
    completedTasks: INITIAL_COMPLETED_TASKS,
  })
  const apiStatus =
    apiState.slug === companySlug ? apiState.status : 'loading'
  const recommendation =
    apiStatus === 'loaded' ? apiState.recommendation : null
  const loadStatus = apiStatus
  const completedTasks =
    taskState.recommendationId === recommendation?.id
      ? taskState.completedTasks
      : INITIAL_COMPLETED_TASKS

        useEffect(() => {
    if (!recommendation?.id) return

    try {
      const savedTasks = localStorage.getItem(
        `match-prep-${recommendation.id}`,
      )

      if (savedTasks) {
        const parsedTasks = JSON.parse(savedTasks)

        if (
          Array.isArray(parsedTasks) &&
          parsedTasks.length === INITIAL_COMPLETED_TASKS.length &&
          parsedTasks.every((task) => typeof task === 'boolean')
        ) {
          setTaskState({
            recommendationId: recommendation.id,
            completedTasks: parsedTasks,
          })
        }
      }
    } catch {
      // Continue using the default checklist if saved data is unavailable.
    }
  }, [recommendation?.id])

  useEffect(() => {
    if (taskState.recommendationId !== recommendation?.id) return

    try {
      localStorage.setItem(
        `match-prep-${recommendation.id}`,
        JSON.stringify(taskState.completedTasks),
      )
    } catch {
      // Checklist progress will remain available for the current session.
    }
  }, [recommendation?.id, taskState])

  useEffect(() => {
    let active = true

    fetchCompanyBySlug(companySlug)
      .then((company) => {
        if (active) {
          setApiState({
            slug: companySlug,
            status: company ? 'loaded' : 'not-found',
            recommendation: company
              ? getApiRecommendation(company, preferredRoleName)
              : null,
          })
        }
      })
      .catch(() => {
        if (active) {
          setApiState({ slug: companySlug, status: 'error', recommendation: null })
        }
      })

    return () => {
      active = false
    }
  }, [companySlug, preferredRoleName, retryCount])

  if (!recommendation) {
    const isLoading = loadStatus === 'loading'
    const hasError = loadStatus === 'error'

    return (
      <main className="match-details-page">
        <section
          className="match-details__not-found"
          role={hasError ? 'alert' : 'status'}
        >
          <h1>
            {isLoading
              ? 'Loading company details'
              : hasError
                ? 'Company details are unavailable'
                : 'Company not found'}
          </h1>
          <p>
            {isLoading
              ? 'Looking up this company in the company directory.'
              : hasError
                ? 'We could not reach the company service. Check that the backend is running, then try again.'
                : 'We could not find a company with that identifier. Check the URL or choose a recommendation.'}
          </p>
          {hasError ? (
            <button
              type="button"
              onClick={() => {
                setApiState({
                  slug: companySlug,
                  status: 'loading',
                  recommendation: null,
                })
                setRetryCount((count) => count + 1)
              }}
            >
              Try again
            </button>
          ) : (
            !isLoading && <Link to="/recommendations">Back to Recommendations</Link>
          )}
        </section>
      </main>
    )
  }

  const companyName = recommendation.name
  const roleTitle =
    recommendation.roleTitle ||
    recommendation.role?.title ||
    getStringList(recommendation.roles)[0] ||
    'Role details coming soon'
  const location =
    recommendation.location ||
    recommendation.role?.location ||
    'Location details coming soon'
  const workArrangement = formatWorkArrangement(
    recommendation.workArrangement || recommendation.role?.workArrangement,
  )
  const employmentType = recommendation.employmentType
    ? formatWorkArrangement(recommendation.employmentType)
    : null
  const term = recommendation.term || recommendation.role?.term
  const score =
    Number.isFinite(recommendation.matchPercent) &&
    recommendation.matchPercent >= 0 &&
    recommendation.matchPercent <= 100
      ? recommendation.matchPercent
      : null
  const profileSkills = getStringList(matchingProfile.skills)
  const roleSkills = getStringList(
    recommendation.skillsToBuild ?? recommendation.skills,
  )
  const coursework = getStringList(matchingProfile.coursework)
  const roleCoursework = getStringList(recommendation.coursework)
  const roleCareerInterests = getStringList(recommendation.careerInterests)
  const questions = getStringList(
    recommendation.questionsToBeReadyFor,
  )
  const prepQuestions =
    questions.length > 0 ? questions : DEFAULT_QUESTIONS
  const roleTitlePhrase = roleTitle.toLowerCase()
  const companyInitial = companyName.trim().charAt(0).toUpperCase() || 'C'
  const tasks = [
    {
      title: 'Review your match summary',
      description:
        'Read through the company and role details and note the information that matters most to you.',
      hint: 'Done when you check it off',
    },
    {
      title: `Research ${companyName}`,
      description:
        'Skim the company mission, recent projects, and team page. Write down one thing that excites you.',
      hint: 'Suggested prep task',
    },
    {
      title: 'Tailor your resume for this role',
      description: `Highlight relevant skills and projects for ${roleTitlePhrase}.`,
      hint: 'Suggested prep task',
    },
    {
      title: 'Practice your top interview questions',
      description:
        'Review the prompts below and prepare examples from your experience.',
      hint: 'Suggested prep task',
    },
  ]
  const completedCount = completedTasks.filter(Boolean).length
  const comparisons = [
    {
      student: `Career interest: ${matchingProfile.careerInterest || 'Not provided'}`,
      company: [
        `Industry: ${recommendation.industry || 'Not provided'}`,
        `Role interests: ${roleCareerInterests.join(', ') || 'Not specified'}`,
      ].join(' · '),
    },
    {
      student: `Skills selected: ${profileSkills.join(', ') || 'None selected'}`,
      company: `Skills listed: ${getStringList(recommendation.skills).join(', ') || 'Not provided'}`,
    },
    {
      student: `Coursework: ${coursework.join(', ') || 'None selected'}`,
      company: [
        `Required coursework: ${roleCoursework.join(', ') || 'Not specified'}`,
        `Minimum experience: ${recommendation.minimumExperienceLevel || 'Not specified'}`,
      ].join(' · '),
    },
  ]

  function toggleTask(index) {
    setTaskState((currentState) => {
      const currentTasks =
        currentState.recommendationId === recommendation.id
          ? currentState.completedTasks
          : INITIAL_COMPLETED_TASKS

      return {
        recommendationId: recommendation.id,
        completedTasks: currentTasks.map((isComplete, taskIndex) =>
          taskIndex === index ? !isComplete : isComplete,
        ),
      }
    })
  }

  return (
    <main className="match-details-page">
      <div className="match-details__layout">
        <div className="match-details__primary">
          <header className="match-details__intro">
            <h1>Match Details and Prep</h1>
            <p>
              Review this company&apos;s details and get ready for your first
              conversation.
            </p>
          </header>

          <section
            className="match-details__company"
            aria-label="Selected recommendation"
          >
            <span className="match-details__company-initial" aria-hidden="true">
              {companyInitial}
            </span>
            <div className="match-details__company-copy">
              <h2>{companyName}</h2>
              <p>
                {[
                  roleTitle,
                  location,
                  employmentType,
                  workArrangement,
                  term,
                  recommendation.minimumExperienceLevel,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
            <div
              className="match-details__score"
              role="img"
              aria-label={
                score === null
                  ? 'Match score unavailable; no matching score is available yet'
                  : `Match score: ${score}%`
              }
            >
              <img src={scoreRing} alt="" />
              <img src={scoreRingInner} alt="" />
              <span>{score === null ? 'N/A' : `${score}%`}</span>
            </div>
          </section>

          <section
            className="match-details__record-descriptions"
            aria-label="Company and role descriptions"
          >
            <div>
              <h3>About {companyName}</h3>
              <p>
                {recommendation.description ||
                  'Company description is not available.'}
              </p>
            </div>
            <div>
              <h3>About this role</h3>
              <p>
                {recommendation.roleDescription ||
                  'Role description is not available.'}
              </p>
            </div>
          </section>

          <section
            className="match-details__why"
            aria-labelledby="match-details-why-heading"
          >
            <header className="match-details__section-heading">
              <h2 id="match-details-why-heading">Why you matched</h2>
              <p>
                Match scores and explanations are not available yet. Company
                and role details are shown below when available.
              </p>
              <p className="match-details__prototype-note">
                Matching results are not provided by the current backend.
              </p>
            </header>
            <div className="match-details__metrics">
              {UNAVAILABLE_METRICS.map((metric) => (
                <MetricBar key={metric} metric={metric} />
              ))}
            </div>
          </section>

          <section
            className="match-details__comparison"
            aria-label="What you told us versus what the company needs"
          >
            <table>
              <thead>
                <tr>
                  <th scope="col">What you told us</th>
                  <th scope="col">What {companyName} needs</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map(({ student, company }) => (
                  <tr key={student}>
                    <td>{student}</td>
                    <td>{company}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <img
              className="match-details__comparison-row-divider"
              src={comparisonRowDivider}
              alt=""
              aria-hidden="true"
            />
            <span
              className="match-details__comparison-column-divider"
              aria-hidden="true"
            >
              <img src={comparisonColumnDivider} alt="" />
            </span>
          </section>
        </div>

        <aside className="match-details__secondary">
          <header className="match-details__prep-heading">
            <h2>Your prep plan</h2>
            <p>Steps to take before your intro call</p>
          </header>

          <section
            className="match-details__prep-card"
            aria-label="Your prep checklist"
          >
            <p className="match-details__prep-progress-copy">
              {completedCount} of {tasks.length} steps complete
            </p>
            <div
              className="match-details__prep-progress"
              role="progressbar"
              aria-label="Prep plan progress"
              aria-valuemin="0"
              aria-valuemax={tasks.length}
              aria-valuenow={completedCount}
              aria-valuetext={`${completedCount} of ${tasks.length} steps complete`}
            >
              <span
                style={{
                  width: `${(completedCount / tasks.length) * 100}%`,
                }}
              />
            </div>
            <div className="match-details__task-list">
              {tasks.map((task, index) => {
                const taskId = `prep-${recommendation.id}-${index}`
                const isComplete = completedTasks[index]

                return (
                  <div className="match-details__task" key={task.title}>
                    <input
                      id={taskId}
                      type="checkbox"
                      checked={isComplete}
                      onChange={() => toggleTask(index)}
                      aria-label={task.title}
                      aria-describedby={`${taskId}-description ${taskId}-hint`}
                    />
                    <label htmlFor={taskId}>
                      <span
                        className="match-details__checkbox"
                        aria-hidden="true"
                      >
                        {isComplete && <img src={prepCheck} alt="" />}
                      </span>
                      <span className="match-details__task-copy">
                        <span
                          className={
                            isComplete
                              ? 'match-details__task-title is-complete'
                              : 'match-details__task-title'
                          }
                        >
                          {task.title}
                        </span>
                        <span
                          className="match-details__task-description"
                          id={`${taskId}-description`}
                        >
                          {task.description}
                        </span>
                        <span
                          className="match-details__task-hint"
                          id={`${taskId}-hint`}
                        >
                          {task.hint}
                        </span>
                      </span>
                    </label>
                  </div>
                )
              })}
            </div>
          </section>

          <section
            className="match-details__questions"
            aria-labelledby="match-details-questions-heading"
          >
            <h2 id="match-details-questions-heading">
              Questions to be ready for
            </h2>
            <p className="match-details__questions-note">
              General prep prompts; not generated from company match data.
            </p>
            <ol>
              {prepQuestions.map((question, index) => (
                <li key={question}>
                  <span
                    className="match-details__question-number"
                    aria-hidden="true"
                  >
                    <img src={questionNumber} alt="" />
                    <span>{index + 1}</span>
                  </span>
                  <span>{question}</span>
                </li>
              ))}
            </ol>
          </section>

          <section
            className="match-details__skills"
            aria-label="Skills to prepare"
          >
            <div>
              <h2>Skills you already have</h2>
              <ul>
                {profileSkills.length > 0 ? (
                  profileSkills.map((skill) => (
                    <li className="is-current" key={skill}>
                      {skill}
                    </li>
                  ))
                ) : (
                  <li className="match-details__skill-empty">
                    No skills selected
                  </li>
                )}
              </ul>
            </div>
            <div>
              <h2>Worth building before you apply</h2>
              <p className="match-details__skills-note">
                Role-listed skills; gaps are not calculated.
              </p>
              <ul>
                {roleSkills.length > 0 ? (
                  roleSkills.map((skill) => (
                    <li className="is-future" key={skill}>
                      {skill}
                    </li>
                  ))
                ) : (
                  <li className="match-details__skill-empty">
                    No role skills listed
                  </li>
                )}
              </ul>
            </div>
          </section>
        </aside>
      </div>
    </main>
  )
}

export default MatchDetails
