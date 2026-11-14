import { useMemo, useState } from 'react'
import careerDataIcon from '../assets/figma/career-data.svg'
import careerLaptopIcon from '../assets/figma/career-laptop.svg'
import careerSettingsIcon from '../assets/figma/career-settings.svg'
import careerShieldIcon from '../assets/figma/career-shield.svg'
import checkmarkIcon from '../assets/figma/checkmark.svg'
import searchIcon from '../assets/figma/matching-search.svg'
import arrowRightIcon from '../assets/figma/arrow-right.svg'
import './MatchingProfile.css'

const careerInterests = [
  {
    name: 'Software Engineering',
    description: 'Build and develop software applications',
    icon: careerLaptopIcon,
  },
  {
    name: 'Cybersecurity',
    description: 'Protect systems and information',
    icon: careerShieldIcon,
  },
  {
    name: 'Data Science',
    description: 'Analyze data and build insights',
    icon: careerDataIcon,
  },
  {
    name: 'IT & Other',
    description: 'Explore other technology roles',
    icon: careerSettingsIcon,
  },
]

const initialSkills = [
  'Java',
  'Python',
  'Javascript',
  'SQL',
  'Git',
  'React',
  'AWS',
  'Linux',
  'C++',
]

const additionalSkills = [
  'TypeScript',
  'Docker',
  'Node.js',
  'HTML & CSS',
  'C#',
  'Azure',
]

const allSkills = [...initialSkills, ...additionalSkills]

const coursework = [
  'Introduction to Programming',
  'Data Structures',
  'Computer Networks',
  'Operating Systems',
  'Database Design',
  'Software Engineering',
  'Machine Learning',
  'Cybersecurity Fundamentals',
  'Cloud Computing',
]

const experienceLevels = [
  {
    name: 'Beginner / No internship',
    description: 'Coursework and personal projects',
  },
  {
    name: 'Some project or work experience',
    description: 'Relevant projects or part-time work',
  },
  {
    name: 'Previous internship experience',
    description: 'One or more internships or professional roles',
  },
]

function SectionHeading({ step, title, description, id }) {
  return (
    <div className="matching-profile__section-heading">
      <span className="matching-profile__step" aria-hidden="true">
        {step}
      </span>
      <div>
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  )
}

function SelectionIndicator({ checked }) {
  return (
    <span
      className={`matching-profile__indicator${checked ? ' is-checked' : ''}`}
      aria-hidden="true"
    >
      {checked && <img src={checkmarkIcon} alt="" />}
    </span>
  )
}

function CareerInterestOption({ interest, checked, onChange }) {
  return (
    <label className={`career-option${checked ? ' is-selected' : ''}`}>
      <input
        className="matching-profile__hidden-input"
        type="radio"
        name="career-interest"
        value={interest.name}
        checked={checked}
        onChange={onChange}
      />
      <span className="career-option__card">
        <span className="career-option__header">
          <img src={interest.icon} alt="" />
          <span>{interest.name}</span>
        </span>
        <span className="career-option__description">
          {interest.description}
        </span>
        <SelectionIndicator checked={checked} />
      </span>
    </label>
  )
}

function SkillOption({ skill, selected, onToggle }) {
  return (
    <button
      className={`skill-option${selected ? ' is-selected' : ''}`}
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
    >
      <SelectionIndicator checked={selected} />
      <span>{skill}</span>
    </button>
  )
}

function CourseworkOption({ course, checked, onChange }) {
  return (
    <label className="course-option">
      <input
        className="matching-profile__hidden-input"
        type="checkbox"
        name="coursework"
        value={course}
        checked={checked}
        onChange={onChange}
      />
      <SelectionIndicator checked={checked} />
      <span>{course}</span>
    </label>
  )
}

function ExperienceOption({ level, checked, onChange }) {
  return (
    <label className={`experience-option${checked ? ' is-selected' : ''}`}>
      <input
        className="matching-profile__hidden-input"
        type="radio"
        name="experience-level"
        value={level.name}
        checked={checked}
        onChange={onChange}
      />
      <SelectionIndicator checked={checked} />
      <span className="experience-option__copy">
        <span>{level.name}</span>
        <span>{level.description}</span>
      </span>
    </label>
  )
}

function MatchingProfile() {
  const [careerInterest, setCareerInterest] = useState('Software Engineering')
  const [selectedSkills, setSelectedSkills] = useState([
    'Java',
    'Python',
    'SQL',
    'Git',
  ])
  const [selectedCourses, setSelectedCourses] = useState([
    'Data Structures',
    'Database Design',
  ])
  const [experienceLevel, setExperienceLevel] = useState(
    'Beginner / No internship',
  )
  const [skillQuery, setSkillQuery] = useState('')
  const [showAllSkills, setShowAllSkills] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const visibleSkills = useMemo(() => {
    const normalizedQuery = skillQuery.trim().toLowerCase()
    const skills = normalizedQuery || showAllSkills ? allSkills : initialSkills

    return skills.filter((skill) =>
      skill.toLowerCase().includes(normalizedQuery),
    )
  }, [showAllSkills, skillQuery])

  function toggleSkill(skill) {
    setSelectedSkills((currentSkills) =>
      currentSkills.includes(skill)
        ? currentSkills.filter((selectedSkill) => selectedSkill !== skill)
        : [...currentSkills, skill],
    )
  }

  function toggleCourse(course) {
    setSelectedCourses((currentCourses) =>
      currentCourses.includes(course)
        ? currentCourses.filter((selectedCourse) => selectedCourse !== course)
        : [...currentCourses, course],
    )
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="matching-profile">
      <header className="matching-profile__intro">
        <h1>Create My Matching Profile</h1>
        <p>
          Tell us about your background and interest so we can recommend
          companies that align with your goals
        </p>
      </header>

      <form className="matching-profile__form" onSubmit={handleSubmit}>
        <div className="matching-profile__top-grid">
          <section
            className="profile-panel profile-panel--career"
            aria-labelledby="career-interest-heading"
          >
            <SectionHeading
              step="1"
              title="Career Interest"
              description="What type of roles are you most interested in?"
              id="career-interest-heading"
            />
            <div
              className="career-options"
              role="radiogroup"
              aria-labelledby="career-interest-heading"
            >
              {careerInterests.map((interest) => (
                <CareerInterestOption
                  key={interest.name}
                  interest={interest}
                  checked={careerInterest === interest.name}
                  onChange={() => setCareerInterest(interest.name)}
                />
              ))}
            </div>
          </section>

          <section
            className="profile-panel profile-panel--skills"
            aria-labelledby="technical-skills-heading"
          >
            <SectionHeading
              step="2"
              title="Technical Skills"
              description="Select the skills you have or are familiar with"
              id="technical-skills-heading"
            />
            <label className="skills-search">
              <span className="matching-profile__visually-hidden">
                Search skills
              </span>
              <img src={searchIcon} alt="" />
              <input
                type="search"
                value={skillQuery}
                onChange={(event) => setSkillQuery(event.target.value)}
                placeholder="Search Skills..."
              />
            </label>
            <div
              className="skill-options"
              role="group"
              aria-label="Available skills"
            >
              {visibleSkills.map((skill) => (
                <SkillOption
                  key={skill}
                  skill={skill}
                  selected={selectedSkills.includes(skill)}
                  onToggle={() => toggleSkill(skill)}
                />
              ))}
            </div>
            {visibleSkills.length === 0 && (
              <p className="matching-profile__empty" role="status">
                No skills found. Try another search.
              </p>
            )}
            {!skillQuery.trim() && (
              <button
                className="matching-profile__show-skills"
                type="button"
                aria-expanded={showAllSkills}
                onClick={() => setShowAllSkills((showing) => !showing)}
              >
                {showAllSkills ? 'Show Fewer skills' : '+ Show More skills'}
              </button>
            )}
          </section>
        </div>

        <div className="matching-profile__bottom-grid">
          <section
            className="profile-panel profile-panel--coursework"
            aria-labelledby="coursework-heading"
          >
            <SectionHeading
              step="3"
              title="Relevant Coursework"
              description="Select the courses you have completed or are currently taking"
              id="coursework-heading"
            />
            <div
              className="course-options"
              role="group"
              aria-label="Relevant coursework"
            >
              {coursework.map((course) => (
                <CourseworkOption
                  key={course}
                  course={course}
                  checked={selectedCourses.includes(course)}
                  onChange={() => toggleCourse(course)}
                />
              ))}
            </div>
          </section>

          <section
            className="profile-panel profile-panel--experience"
            aria-labelledby="experience-heading"
          >
            <SectionHeading
              step="3"
              title="Experience Level"
              description="What best describes your experience?"
              id="experience-heading"
            />
            <div
              className="experience-options"
              role="radiogroup"
              aria-labelledby="experience-heading"
            >
              {experienceLevels.map((level) => (
                <ExperienceOption
                  key={level.name}
                  level={level}
                  checked={experienceLevel === level.name}
                  onChange={() => setExperienceLevel(level.name)}
                />
              ))}
            </div>
          </section>
        </div>

        <button className="matching-profile__submit" type="submit">
          <span>Find My Matches</span>
          <img src={arrowRightIcon} alt="" />
        </button>
        {submitted && (
          <p className="matching-profile__status" role="status">
            Your sample profile is ready. This prototype does not calculate
            real match scores.
          </p>
        )}
      </form>
    </main>
  )
}

export default MatchingProfile