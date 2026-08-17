/**
 * PublicDashboard.jsx
 * The first screen any visitor sees.
 * Three actions: Login, Sign Up, Emergency Mode.
 */

import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/PublicDashboard.css'

export default function PublicDashboard() {
  const navigate = useNavigate()
  const { currentUser, loading } = useAuth()

  // If already logged in, send straight to dashboard
  useEffect(() => {
    if (!loading && currentUser) {
      navigate('/dashboard', { replace: true })
    }
  }, [currentUser, loading, navigate])

  if (loading) return null

  return (
    <div className="public-page">
      {/* Background decorative blobs */}
      <div className="bg-blob blob-1" />
      <div className="bg-blob blob-2" />

      <main className="public-main">
        {/* Logo */}
        <div className="pub-logo">
          <div className="logo-icon">+</div>
          <span className="logo-text">Life<span>QR</span></span>
        </div>

        <p className="pub-tagline">Universal Emergency Medical Passport</p>

        {/* Hero description */}
        <p className="pub-description">
          Your medical information, instantly accessible in an emergency.
          Secure, private, and always with you.
        </p>

        {/* Action cards */}
        <div className="pub-actions">
          <button
            className="pub-action-card"
            onClick={() => navigate('/login')}
          >
            <span className="pub-action-icon">🔐</span>
            <span className="pub-action-label">Login</span>
            <span className="pub-action-sub">Access your account</span>
          </button>

          <button
            className="pub-action-card"
            onClick={() => navigate('/signup')}
          >
            <span className="pub-action-icon">✦</span>
            <span className="pub-action-label">Sign Up</span>
            <span className="pub-action-sub">Create your LifeQR profile</span>
          </button>

          <button
            className="pub-action-card pub-action-emergency"
            onClick={() => navigate('/emergency')}
          >
            <span className="pub-action-icon">🚨</span>
            <span className="pub-action-label">Emergency Mode</span>
            <span className="pub-action-sub">Scan or enter a LifeQR code</span>
          </button>
        </div>

        {/* Footer note */}
        <p className="pub-footer-note">
          LifeQR stores your data locally on your device only.
          No cloud. No tracking.
        </p>
      </main>
    </div>
  )
}
