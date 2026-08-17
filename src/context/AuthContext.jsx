/**
 * AuthContext.jsx
 * Global authentication state.
 * Provides currentUser and setCurrentUser to the entire app.
 * On mount, restores session from localStorage if valid.
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getSession, isSessionValid, findAccountById } from '../utils/storage.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // currentUser shape: { userId, name } or null
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Restore session on app load
  useEffect(() => {
    const session = getSession()
    if (isSessionValid(session)) {
      const account = findAccountById(session.userId)
      if (account) {
        setCurrentUser({ userId: account.userId, name: account.name })
      }
    }
    setLoading(false)
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
