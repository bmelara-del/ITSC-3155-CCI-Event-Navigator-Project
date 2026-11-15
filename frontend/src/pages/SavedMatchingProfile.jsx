import { Link } from 'react-router'
import './SavedMatchingProfile.css'

function formatUpdatedAt(value) {
  const updatedAt = new Date(value)

  if (Number.isNaN(updatedAt.getTime())) {
    return 'Timestamp unavailable'
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(updatedAt)
}

function ProfileValue({ label, children }) {
  return (
    <div className="saved-profile__value">
      <h3>{label}</h3>
      <p>{children}</p>
    </div>
  )
}

function SavedMatchingProfile({ profile, onEdit, successMessage }) {
  return (
    <main className="saved-profile">
      <header className="saved-profile__intro">
        <h1>My Saved Matching Profile</h1>
        <p>Review the questionnaire answers saved to your profile.</p>
      </header>

      {successMessage && (
        <p className="saved-profile__success" role="status">
          {successMessage}
        </p>
      )}

      <section className="saved-profile__card" aria-labelledby="profile-overview">
        <div className="saved-profile__card-heading">
          <div>
            <h2 id="profile-overview">Profile Overview</h2>
            <p>Last saved {formatUpdatedAt(profile.updatedAt)}</p>
          </div>
        </div>

        <div className="saved-profile__grid">
          <ProfileValue label="Career interests">
            {profile.careerInterest || 'Not provided'}
          </ProfileValue>
          <ProfileValue label="Key skills">
            {profile.skills.length > 0
              ? profile.skills.join(', ')
              : 'No skills selected'}
          </ProfileValue>
          <ProfileValue label="Relevant coursework">
            {profile.coursework.length > 0
              ? profile.coursework.join(', ')
              : 'No coursework selected'}
          </ProfileValue>
          <ProfileValue label="Experience level">
            {profile.experienceLevel || 'Not provided'}
          </ProfileValue>
          <ProfileValue label="Work preferences">
            Not collected in the current questionnaire
          </ProfileValue>
        </div>

        <div className="saved-profile__actions">
          <button type="button" onClick={onEdit}>
            Edit My Profile
          </button>
          <Link to="/recommendations">View Recommendations</Link>
        </div>
      </section>
    </main>
  )
}

export default SavedMatchingProfile
