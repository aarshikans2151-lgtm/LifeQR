/**
 * ProtectedRoute.jsx
 * Wraps private routes. Redirects to / if no valid session.
 * Shows nothing while the session is being restored (loading).
 */

import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#061826',
        color: '#8ab4c2',
        fontSize: '1rem',
        letterSpacing: '0.05em'
      }}>
        Loading...
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/" replace />
  }

  return children
}
