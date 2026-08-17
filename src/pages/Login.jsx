import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { login } from '../utils/auth.js'
import '../styles/Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const { setCurrentUser } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    const result = await login({ email: form.email, password: form.password })
    setLoading(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    setCurrentUser({ userId: result.userId, name: result.name })
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" onClick={() => navigate('/')}>
          <div className="logo-icon">+</div>
          <span className="logo-text">Life<span>QR</span></span>
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your LifeQR account</p>

        <form onSubmit={handleSubmit} noValidate>
          {error && <div className="error-msg">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <hr className="divider" />

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/signup" className="link-text">Sign up</Link>
        </p>

        <button className="btn btn-ghost" onClick={() => navigate('/')}>
          ← Back
        </button>
      </div>
    </div>
  )
}
