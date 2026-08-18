import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { logout } from '../utils/auth.js'
import { getProfile } from '../utils/storage.js'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const navigate = useNavigate()
  const { currentUser, setCurrentUser } = useAuth()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const profile = getProfile(currentUser?.userId)
  const profileComplete = !!profile

  // Last updated display
  const lastUpdated = profile?.updatedAt
    ? new Date(profile.updatedAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
      })
    : null

  function handleLogout() {
    logout()
    setCurrentUser(null)
    navigate('/', { replace: true })
  }

  return (
    <div className="dash-page">
      <div className="dash-bg-blob blob-1" />
      <div className="dash-bg-blob blob-2" />

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <div className="logout-overlay">
          <div className="logout-modal">
            <h3>Sign out of LifeQR?</h3>
            <p>Your profile stays saved on this device. You can sign back in anytime.</p>
            <div className="logout-modal-btns">
              <button className="btn btn-primary" onClick={handleLogout}>Yes, Sign Out</button>
              <button className="btn btn-ghost" onClick={() => setShowLogoutConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="dash-inner">
        {/* Header */}
        <header className="dash-header">
          <div className="dash-logo">
            <div className="logo-icon">+</div>
            <span className="logo-text">Life<span>QR</span></span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowLogoutConfirm(true)}>
            Sign Out
          </button>
        </header>

        {/* Greeting with optional photo */}
        <div className="dash-greeting">
          <div className="dash-greeting-row">
            {profile?.photo ? (
              <img src={profile.photo} alt="Profile" className="dash-profile-photo" />
            ) : (
              <div className="dash-profile-initial">
                {(currentUser?.name || 'U')[0].toUpperCase()}
              </div>
            )}
            <div>
              <h1>Hello, {currentUser?.name?.split(' ')[0]} 👋</h1>
              <p className="dash-greeting-sub">Your Emergency Medical Passport</p>
            </div>
          </div>
        </div>

        {/* Profile status badge */}
        <div className={`profile-badge ${profileComplete ? 'profile-badge--complete' : 'profile-badge--incomplete'}`}>
          <span className="profile-badge-dot" />
          {profileComplete
            ? `Medical profile complete${lastUpdated ? ` · Updated ${lastUpdated}` : ''}`
            : 'Medical profile not yet set up — add yours below'}
        </div>

        {/* Action cards */}
        <div className="dash-actions">
          <button className="dash-card" onClick={() => navigate('/profile')}>
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

          <button className="dash-card" onClick={() => navigate('/qr')}>
            <div className="dash-card-icon">📱</div>
            <div className="dash-card-body">
              <span className="dash-card-title">QR Generation</span>
              <span className="dash-card-sub">Generate and download your LifeQR code</span>
            </div>
            <span className="dash-card-arrow">›</span>
          </button>

          <button
            className="dash-card dash-card--emergency"
            onClick={() => {
              if (!profileComplete) {
                navigate('/profile')
              } else {
                const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(profile))))
                navigate(`/emergency?data=${encoded}`)
              }
            }}
          >
            <div className="dash-card-icon">🚨</div>
            <div className="dash-card-body">
              <span className="dash-card-title">Emergency Mode</span>
              <span className="dash-card-sub">
                {profileComplete
                  ? 'Preview your emergency passport'
                  : 'Set up your profile first to use Emergency Mode'}
              </span>
            </div>
            <span className="dash-card-arrow">›</span>
          </button>
        </div>

        <p className="dash-footer">LifeQR · Data stored locally on this device</p>
      </div>
    </div>
  )
}
