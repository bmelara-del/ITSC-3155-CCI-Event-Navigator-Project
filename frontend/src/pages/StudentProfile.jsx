import { useState } from 'react'
import './StudentProfile.css'

const STORAGE_KEY = 'cci-career-navigator-student-profile'

const emptyProfile = {
  fullName: '',
  email: '',
  year: '',
  concentration: '',
  linkedIn: '',
  aboutMe: '',
}

const schoolYears = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate']
const concentrations = [
  'Computer Science',
  'Cybersecurity',
  'Data Science',
  'Information Technology',
  'Software Engineering',
  'Other',
]

const profileFields = [
  { key: 'fullName', label: 'Full Name', icon: '👤' },
  { key: 'email', label: 'Email', optional: true, icon: '✉️' },
  { key: 'year', label: 'Year in School' },
  { key: 'concentration', label: 'Concentration' },
  { key: 'linkedIn', label: 'LinkedIn', optional: true, icon: '🔗' },
]

function isProfile(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    typeof value.fullName === 'string' &&
    typeof value.email === 'string' &&
    typeof value.year === 'string' &&
    typeof value.concentration === 'string' &&
    typeof value.linkedIn === 'string' &&
    typeof value.aboutMe === 'string'
  )
}

function loadProfile() {
  try {
    const storedProfile = window.localStorage.getItem(STORAGE_KEY)
    if (!storedProfile) {
      return { profile: null, error: '' }
    }

    const parsedProfile = JSON.parse(storedProfile)
    if (!isProfile(parsedProfile)) {
      return {
        profile: null,
        error: 'Your saved profile could not be read. Please create it again.',
      }
    }

    return {
      profile: {
        fullName: parsedProfile.fullName,
        email: parsedProfile.email,
        year: parsedProfile.year,
        concentration: parsedProfile.concentration,
        linkedIn: parsedProfile.linkedIn,
        aboutMe: parsedProfile.aboutMe,
      },
      error: '',
    }
  } catch {
    return {
      profile: null,
      error: 'Your saved profile could not be read. Please create it again.',
    }
  }
}

function validateProfile(profile) {
  const errors = {}
  if (!profile.fullName.trim()) {
    errors.fullName = 'Enter your full name.'
  }
  if (!profile.year) {
    errors.year = 'Select your year in school.'
  }
  if (!profile.concentration) {
    errors.concentration = 'Select your concentration.'
  }
  if (
    profile.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email.trim())
  ) {
    errors.email = 'Enter a valid email address.'
  }
  if (profile.linkedIn) {
    try {
      const linkedInUrl = new URL(profile.linkedIn.trim())
      if (
        !['http:', 'https:'].includes(linkedInUrl.protocol) ||
        !/(^|\.)linkedin\.com$/i.test(linkedInUrl.hostname)
      ) {
        errors.linkedIn = 'Enter a valid LinkedIn URL.'
      }
    } catch {
      errors.linkedIn = 'Enter a valid LinkedIn URL.'
    }
  }

  return errors
}

function ProfileField({ field, value, error, onChange }) {
  const fieldId = `student-profile-${field.key}`
  const errorId = `${fieldId}-error`

  return (
    <div className="student-profile__field">
      <label htmlFor={fieldId}>
        {field.label}
        {field.optional && <span> (optional)</span>}
      </label>
      <div className="student-profile__input-wrap">
        {field.icon && (
          <span className="student-profile__icon" aria-hidden="true">
            {field.icon}
          </span>
        )}
        {field.key === 'year' || field.key === 'concentration' ? (
          <select
            id={fieldId}
            value={value}
            onChange={onChange}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
            required
          >
            <option value="">
              {field.key === 'year'
                ? 'Select your year'
                : 'Select your concentration'}
            </option>
            {(field.key === 'year' ? schoolYears : concentrations).map(
              (option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ),
            )}
          </select>
        ) : (
          <input
            id={fieldId}
            type={
              field.key === 'email'
                ? 'email'
                : field.key === 'linkedIn'
                  ? 'url'
                  : 'text'
            }
            value={value}
            onChange={onChange}
            required={field.key === 'fullName'}
            placeholder={
              field.key === 'fullName'
                ? 'Enter your full name'
                : field.key === 'email'
                  ? 'Enter your email'
                  : 'Enter your LinkedIn URL'
            }
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : undefined}
          />
        )}
      </div>
      {error && (
        <p className="student-profile__field-error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}

function StudentProfileForm({ initialProfile, onSave, onCancel, isEditing }) {
  const [values, setValues] = useState(initialProfile)
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState('')

  function updateField(key) {
    return (event) => {
      setValues((current) => ({ ...current, [key]: event.target.value }))
      setErrors((current) => ({ ...current, [key]: '' }))
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    const profile = Object.fromEntries(
      Object.entries(values).map(([key, value]) => [key, value.trim()]),
    )
    const validationErrors = validateProfile(profile)
    setErrors(validationErrors)
    setSaveError('')

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
      onSave(profile)
    } catch {
      setSaveError(
        'Your profile could not be saved in this browser. Check your browser storage settings and try again.',
      )
    }
  }

  return (
    <>
      <header className="student-profile__intro">
        <h1>{isEditing ? 'Edit My Profile' : 'Create My Profile'}</h1>
        <p>
          Manage your basic information. This is separate from your matching
          information.
        </p>
      </header>

      <form
        className="student-profile__form"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="student-profile__form-panel">
          <div className="student-profile__fields">
            {profileFields.slice(0, 4).map((field) => (
              <ProfileField
                key={field.key}
                field={field}
                value={values[field.key]}
                error={errors[field.key]}
                onChange={updateField(field.key)}
              />
            ))}

            <div className="student-profile__field student-profile__password">
              <label htmlFor="student-profile-password">
                Password <span>(demo only)</span>
              </label>
              <div className="student-profile__input-wrap">
                <span className="student-profile__icon" aria-hidden="true">
                  🔒
                </span>
                <input
                  id="student-profile-password"
                  type="password"
                  placeholder="Not available in this demo"
                  disabled
                  aria-describedby="student-profile-password-note"
                />
              </div>
              <p
                className="student-profile__demo-note"
                id="student-profile-password-note"
              >
                This disabled password field does not create an account or
                support sign-in. Passwords require a secure authentication
                service.
              </p>
            </div>

            <ProfileField
              field={profileFields[4]}
              value={values.linkedIn}
              error={errors.linkedIn}
              onChange={updateField('linkedIn')}
            />

            <div className="student-profile__field student-profile__about">
              <label htmlFor="student-profile-about">
                About Me <span>(optional)</span>
              </label>
              <div className="student-profile__input-wrap student-profile__textarea-wrap">
                <span className="student-profile__icon" aria-hidden="true">
                  📝
                </span>
                <textarea
                  id="student-profile-about"
                  value={values.aboutMe}
                  onChange={updateField('aboutMe')}
                  placeholder="A short description about yourself beyond the basic information"
                  rows={4}
                />
              </div>
            </div>
          </div>
        </div>

        {saveError && (
          <p className="student-profile__error" role="alert">
            {saveError}
          </p>
        )}
        <div className="student-profile__actions">
          {isEditing && (
            <button
              className="student-profile__secondary-button"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>
          )}
          <button className="student-profile__submit" type="submit">
            {isEditing ? 'Save Profile' : 'Create Profile'}
          </button>
        </div>
      </form>
    </>
  )
}

function StudentProfileView({ profile, onEdit }) {
  return (
    <>
      <header className="student-profile__intro">
        <h1>My Profile</h1>
      </header>
      <section
        className="student-profile__form-panel student-profile__completed"
        aria-label="My profile information"
      >
        <div className="student-profile__fields">
          {profileFields.map((field) => {
            const value = profile[field.key]
            if (!value) {
              return null
            }

            return (
              <div className="student-profile__field" key={field.key}>
                <span className="student-profile__field-label">
                  {field.label}
                  {field.optional && <span> (optional)</span>}
                </span>
                <div className="student-profile__value">
                  {field.icon && (
                    <span className="student-profile__icon" aria-hidden="true">
                      {field.icon}
                    </span>
                  )}
                  {field.key === 'linkedIn' ? (
                    <a href={value} target="_blank" rel="noreferrer">
                      {value}
                    </a>
                  ) : (
                    <span>{value}</span>
                  )}
                </div>
              </div>
            )
          })}
          {profile.aboutMe && (
            <div className="student-profile__field student-profile__about">
              <span className="student-profile__field-label">
                About Me <span>(optional)</span>
              </span>
              <div className="student-profile__value student-profile__about-value">
                <span className="student-profile__icon" aria-hidden="true">
                  📝
                </span>
                <span>{profile.aboutMe}</span>
              </div>
            </div>
          )}
        </div>
        <button
          className="student-profile__secondary-button student-profile__edit"
          type="button"
          onClick={onEdit}
        >
          Edit Profile
        </button>
      </section>
    </>
  )
}

function StudentProfile() {
  const [storedProfile, setStoredProfile] = useState(loadProfile)
  const [isEditing, setIsEditing] = useState(false)

  function handleSave(profile) {
    setStoredProfile({ profile, error: '' })
    setIsEditing(false)
  }

  function handleCancel() {
    setIsEditing(false)
  }

  function handleEdit() {
    setIsEditing(true)
  }

  const profile = storedProfile.profile

  return (
    <main className="student-profile">
      {storedProfile.error && (
        <p className="student-profile__error" role="alert">
          {storedProfile.error}
        </p>
      )}
      {profile && !isEditing ? (
        <StudentProfileView profile={profile} onEdit={handleEdit} />
      ) : (
        <StudentProfileForm
          key={isEditing ? 'edit' : 'create'}
          initialProfile={profile || emptyProfile}
          onSave={handleSave}
          onCancel={handleCancel}
          isEditing={isEditing}
        />
      )}
    </main>
  )
}

export default StudentProfile
