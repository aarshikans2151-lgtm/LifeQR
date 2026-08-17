import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { signup } from '../utils/auth.js'
import '../styles/Auth.css'

export default function Signup() {
  const navigate = useNavigate()
  const { setCurrentUser } = useAuth()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNotice, setShowNotice] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { name, email, password, confirm } = form

    if (!name || !email || !password || !confirm) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const result = await signup({ name, email, password })
    setLoading(false)

    if (!result.success) {
      setError(result.error)
      return
    }

    setCurrentUser({ userId: result.userId, name: result.name })
    setShowNotice(true)

    setTimeout(() => {
      navigate('/dashboard', { replace: true })
    }, 2200)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo" onClick={() => navigate('/')}>
          <div className="logo-icon">+</div>
          <span className="logo-text">Life<span>QR</span></span>
        </div>

        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Build your Emergency Medical Passport</p>

        {showNotice && (
          <div className="success-msg">
            Account created! Your data is stored locally on this device only — no cloud, no tracking.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {error && <div className="error-msg">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Jamie Osei"
              value={form.name}
              onChange={handleChange}
            />
          </div>

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
            <label htmlFor="password">Password <span className="field-hint">(min. 8 characters)</span></label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirm">Confirm Password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || showNotice}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <hr className="divider" />

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="link-text">Sign in</Link>
        </p>

        <button className="btn btn-ghost" onClick={() => navigate('/')}>
          ← Back
        </button>
      </div>
    </div>
  )
}
