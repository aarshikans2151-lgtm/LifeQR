import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { logout } from '../utils/auth.js'
import { getProfile } from '../utils/storage.js'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const { currentUser, setCurrentUser } = useAuth()

  const profile = getProfile(currentUser?.userId)
  const profileComplete = !!profile

  function handleLogout() {
    logout()
    setCurrentUser(null)
    navigate('/', { replace: true })
  }

  return (
    <div className="dash-page">
      <div className="dash-bg-blob blob-1" />
      <div className="dash-bg-blob blob-2" />

      <div className="dash-inner">
        {/* Header */}
        <header className="dash-header">
          <div className="dash-logo">
            <div className="logo-icon">+</div>
            <span className="logo-text">Life<span>QR</span></span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Sign Out
          </button>
        </header>

        {/* Greeting */}
        <div className="dash-greeting">
          <h1>Hello, {currentUser?.name?.split(' ')[0]} 👋</h1>
          <p className="dash-greeting-sub">Your Emergency Medical Passport</p>
        </div>

        {/* Profile status badge */}
        <div className={`profile-badge ${profileComplete ? 'profile-badge--complete' : 'profile-badge--incomplete'}`}>
          <span className="profile-badge-dot" />
          {profileComplete
            ? 'Medical profile complete'
            : 'Medical profile not yet set up — add yours below'}
        </div>

        {/* Action cards */}
        <div className="dash-actions">
          <button
            className="dash-card"
            onClick={() => navigate('/profile')}
          >
            <div className="dash-card-icon">📋</div>
            <div className="dash-card-body">
              <span className="dash-card-title">
                {profileComplete ? 'Edit Profile' : 'Add Profile'}
              </span>
              <span className="dash-card-sub">
                {profileComplete
                  ? 'Update your medical information'
                  : 'Set up your medical information'}
              </span>
            </div>
            <span className="dash-card-arrow">›</span>
          </button>

          <button
            className="dash-card"
            onClick={() => navigate('/qr')}
          >
            <div className="dash-card-icon">📱</div>
            <div className="dash-card-body">
              <span className="dash-card-title">QR Generation</span>
              <span className="dash-card-sub">Generate and download your LifeQR code</span>
            </div>
            <span className="dash-card-arrow">›</span>
          </button>

          <button
            className="dash-card dash-card--emergency"
            onClick={() => navigate(`/emergency?uid=${currentUser?.userId}`)}
          >
            <div className="dash-card-icon">🚨</div>
            <div className="dash-card-body">
              <span className="dash-card-title">Emergency Mode</span>
              <span className="dash-card-sub">Preview your emergency passport</span>
            </div>
            <span className="dash-card-arrow">›</span>
          </button>
        </div>

        {/* Footer */}
        <p className="dash-footer">
          LifeQR · Data stored locally on this device
        </p>
      </div>
    </div>
  )
}
