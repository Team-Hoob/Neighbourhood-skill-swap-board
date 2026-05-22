import { useAuth } from '../auth/AuthContext'
import './DashboardPage.css'

export default function DashboardPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-welcome">
          <h2>Welcome, {user?.name || 'Neighbour'}! 👋</h2>
          <p className="dashboard-neighbourhood">
            📍 <span>{user?.neighbourhood || 'Neighbourhood not set'}</span>
          </p>
          <div className="dashboard-cards">
            <div className="dashboard-card">
              <div className="card-emoji">🛠️</div>
              <p>Post a Skill</p>
            </div>
            <div className="dashboard-card">
              <div className="card-emoji">🤝</div>
              <p>My Matches</p>
            </div>
            <div className="dashboard-card">
              <div className="card-emoji">📋</div>
              <p>Skill Board</p>
            </div>
            <div className="dashboard-card">
              <div className="card-emoji">👤</div>
              <p>My Profile</p>
            </div>
          </div>
          <button className="dashboard-logout" onClick={signOut}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}