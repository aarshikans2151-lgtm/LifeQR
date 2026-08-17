import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getProfile } from '../utils/storage.js'
import '../styles/EmergencyMode.css'

const DEMO_CODE = '12345678'

function decodeProfile(encoded) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))))
  } catch {
    return null
  }
}

function calcAge(dob) {
  if (!dob) return null
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export default function EmergencyMode() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { currentUser } = useAuth()

  // 'no-profile' | 'gate' | 'authorized'
  const [screen, setScreen] = useState('loading')
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    // Priority 1: QR scan — base64 profile encoded directly in URL
    const dataParam = searchParams.get('data')
    if (dataParam) {
      const decoded = decodeProfile(dataParam)
      if (decoded) {
        setProfile(decoded)
        setScreen('gate')
      } else {
        setScreen('no-profile')
      }
      return
    }

    // Priority 2: uid param (logged-in user previewing their passport)
    const uid = searchParams.get('uid')
    if (uid) {
      const stored = getProfile(uid)
      if (stored) {
        setProfile(stored)
        setScreen('gate')
      } else {
        setScreen('no-profile')
      }
      return
    }

    // Priority 3: logged-in user, no uid — use their own profile
    if (currentUser?.userId) {
      const stored = getProfile(currentUser.userId)
      if (stored) {
        setProfile(stored)
        setScreen('gate')
        return
      }
    }

    // No data — show manual entry screen
    setScreen('no-profile')
  }, [searchParams, currentUser])

  function handleCodeSubmit(e) {
    e.preventDefault()
    if (codeInput === DEMO_CODE) {
      setScreen('authorized')
      setCodeError('')
    } else {
      setCodeError('Incorrect access code. Please try again.')
      setCodeInput('')
    }
  }

  function handleBack() {
    if (screen === 'authorized') {
      setScreen('gate')
      return
    }
    navigate(-1)
  }

  // ── Loading ───────────────────────────────────────────────

  if (screen === 'loading') {
    return (
      <div className="em-page em-loading">
        <p>Loading…</p>
      </div>
    )
  }

  // ── No Profile / Public Entry ─────────────────────────────
  // Shown when someone hits /emergency from the public dashboard
  // with no QR data. Lets them enter a LifeQR ID manually.

  if (screen === 'no-profile') {
    return <NoProfileScreen navigate={navigate} setProfile={setProfile} setScreen={setScreen} />
  }

  // ── Code Gate ─────────────────────────────────────────────

  if (screen === 'gate') {
    return (
      <div className="em-page em-page--gate">
        <div className="em-gate-inner">

          <div className="em-banner">
            <span className="em-banner-cross">✚</span>
            EMERGENCY MEDICAL PASSPORT
          </div>

          <div className="em-gate-name">{profile.name || 'Unknown Patient'}</div>
          <div className="em-gate-label">LifeQR Protected Profile</div>

          <div className="em-lock-icon">🔐</div>

          <h2 className="em-gate-title">Healthcare Access Required</h2>
          <p className="em-gate-desc">
            This Emergency Medical Passport is protected.
            Authorized healthcare professionals must enter the access code
            to view the full medical profile.
          </p>

          <form onSubmit={handleCodeSubmit} className="em-code-form">
            {codeError && <div className="error-msg">{codeError}</div>}
            <div className="form-group">
              <label htmlFor="accessCode">Healthcare Access Code</label>
              <input
                id="accessCode"
                type="password"
                inputMode="numeric"
                value={codeInput}
                onChange={e => { setCodeInput(e.target.value); setCodeError('') }}
                placeholder="Enter access code"
                autoComplete="off"
                maxLength={20}
              />
            </div>
            <button type="submit" className="btn btn-emergency">
              Unlock Medical Profile
            </button>
          </form>

          <div className="em-gate-disclaimer">
            Unauthorized access to medical records is prohibited.
            This system is for authorized healthcare use only.
          </div>

          <button className="btn btn-ghost" onClick={handleBack}>
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  // ── Authorized Healthcare View ────────────────────────────

  const age = calcAge(profile.dob)

  return (
    <div className="em-page em-page--authorized">
      <div className="em-auth-inner">

        {/* Header */}
        <div className="em-auth-header">
          <div className="em-auth-banner">
            <span className="em-banner-cross">✚</span>
            AUTHORIZED HEALTHCARE ACCESS
          </div>
          <button className="btn btn-ghost btn-sm em-exit-btn" onClick={handleBack}>
            ✕ Exit
          </button>
        </div>

        {/* Demo disclaimer */}
        <div className="em-demo-notice">
          ⚠ Demo access code used. A real system would require verified healthcare professional authentication.
        </div>

        {/* Patient identity */}
        <div className="em-patient-header">
          <div className="em-patient-avatar">
            {(profile.name || 'U')[0].toUpperCase()}
          </div>
          <div className="em-patient-info">
            <div className="em-patient-name">{profile.name || '—'}</div>
            <div className="em-patient-meta">
              {profile.dob && <span>DOB: {new Date(profile.dob).toLocaleDateString()}</span>}
              {age !== null && <span> · Age: {age}</span>}
            </div>
          </div>
          {profile.bloodGroup && (
            <div className="em-blood-badge">{profile.bloodGroup}</div>
          )}
        </div>

        {/* Medical sections */}
        <div className="em-sections">

          {profile.conditions && (
            <div className="em-section">
              <div className="em-section-label">Medical Conditions</div>
              <div className="em-section-value">{profile.conditions}</div>
            </div>
          )}

          {profile.allergies && (
            <div className="em-section em-section--alert">
              <div className="em-section-label">⚠ Allergies</div>
              <div className="em-section-value">{profile.allergies}</div>
            </div>
          )}

          {profile.medications && (
            <div className="em-section">
              <div className="em-section-label">Current Medications</div>
              <div className="em-section-value">{profile.medications}</div>
            </div>
          )}

          {profile.surgeries && (
            <div className="em-section">
              <div className="em-section-label">Previous Surgeries</div>
              <div className="em-section-value">{profile.surgeries}</div>
            </div>
          )}

          {profile.organDonor && profile.organDonor !== 'Not specified' && (
            <div className="em-section">
              <div className="em-section-label">Organ Donor</div>
              <div className={`em-section-value em-donor-${profile.organDonor.toLowerCase()}`}>
                {profile.organDonor === 'Yes' ? '✓ Registered organ donor' : '✗ Not an organ donor'}
              </div>
            </div>
          )}

          {profile.emergencyContacts?.some(c => c.name) && (
            <div className="em-section">
              <div className="em-section-label">Emergency Contacts</div>
              <div className="em-contacts">
                {profile.emergencyContacts.filter(c => c.name).map((c, i) => (
                  <div key={i} className="em-contact">
                    <div className="em-contact-name">{c.name}</div>
                    <div className="em-contact-rel">{c.relationship}</div>
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="em-contact-phone">
                        📞 {c.phone}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {(profile.insuranceProvider || profile.insurancePolicyNumber) && (
            <div className="em-section">
              <div className="em-section-label">Health Insurance</div>
              <div className="em-section-value">
                {profile.insuranceProvider && (
                  <div><strong>Provider:</strong> {profile.insuranceProvider}</div>
                )}
                {profile.insurancePolicyNumber && (
                  <div><strong>Policy:</strong> {profile.insurancePolicyNumber}</div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="em-auth-footer">
          <span>LifeQR Emergency Medical Passport</span>
          <span>For authorized healthcare use only</span>
        </div>

      </div>
    </div>
  )
}

// ── No Profile Screen (public entry, no QR) ───────────────

function NoProfileScreen({ navigate, setProfile, setScreen }) {
  const [manualId, setManualId] = useState('')
  const [error, setError] = useState('')

  function handleManualLookup(e) {
    e.preventDefault()
    const stored = getProfile(manualId.trim())
    if (stored) {
      setProfile(stored)
      setScreen('gate')
    } else {
      setError('No LifeQR profile found for that ID on this device.')
    }
  }

  return (
    <div className="em-page em-page--noprofile">
      <div className="em-noprofile-inner">

        <div className="em-banner">
          <span className="em-banner-cross">✚</span>
          EMERGENCY MODE
        </div>

        <div className="em-noprofile-icon">🚨</div>
        <h2 className="em-noprofile-title">Emergency Access</h2>
        <p className="em-noprofile-desc">
          Scan a LifeQR code with your camera to access a patient's
          Emergency Medical Passport, or enter a LifeQR ID below.
        </p>

        <form onSubmit={handleManualLookup} className="em-manual-form">
          {error && <div className="error-msg">{error}</div>}
          <div className="form-group">
            <label htmlFor="manualId">LifeQR Profile ID</label>
            <input
              id="manualId"
              type="text"
              value={manualId}
              onChange={e => { setManualId(e.target.value); setError('') }}
              placeholder="Paste or type a LifeQR ID"
              autoComplete="off"
            />
          </div>
          <button type="submit" className="btn btn-emergency">
            Access Emergency Profile
          </button>
        </form>

        <div className="em-noprofile-hint">
          The LifeQR ID can be found on the patient's LifeQR card or printed QR sheet.
        </div>

        <button className="btn btn-ghost" onClick={() => navigate('/')}>
          ← Return to Home
        </button>
      </div>
    </div>
  )
}
