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

  // screens: 'loading' | 'no-profile' | 'gate' | 'bystander' | 'code-entry' | 'authorized'
  const [screen, setScreen] = useState('loading')
  const [codeInput, setCodeInput] = useState('')
  const [codeError, setCodeError] = useState('')
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    // Priority 1: QR scan — base64 encoded profile in URL
    const dataParam = searchParams.get('data')
    if (dataParam) {
      const decoded = decodeProfile(dataParam)
      if (decoded) { setProfile(decoded); setScreen('gate') }
      else setScreen('no-profile')
      return
    }

    // Priority 2: uid param (logged-in user previewing)
    const uid = searchParams.get('uid')
    if (uid) {
      const stored = getProfile(uid)
      if (stored) { setProfile(stored); setScreen('gate') }
      else setScreen('no-profile')
      return
    }

    // Priority 3: logged-in user, use their own profile
    if (currentUser?.userId) {
      const stored = getProfile(currentUser.userId)
      if (stored) { setProfile(stored); setScreen('gate') }
      else setScreen('no-profile')
      return
    }

    // No data — go straight to code entry (no profile ID needed)
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

  // ── Loading ───────────────────────────────────────────────
  if (screen === 'loading') {
    return <div className="em-page em-loading"><p>Loading…</p></div>
  }

  // ── No Profile — public entry, no QR scanned ──────────────
  // Show bystander / healthcare choice immediately.
  if (screen === 'no-profile') {
    return (
      <div className="em-page em-page--gate">
        <div className="em-gate-inner">

          <div className="em-banner">
            <span className="em-banner-cross">✚</span>
            EMERGENCY MODE
          </div>

          <div className="em-noprofile-icon">🚨</div>
          <h2 className="em-gate-title">Emergency Access</h2>
          <p className="em-gate-desc">
            Choose your access level below. To view a specific patient's profile,
            scan their LifeQR code with your camera.
          </p>

          <div className="em-access-options">

            {/* Bystander */}
            <button
              className="em-access-card em-access-card--bystander"
              onClick={() => setScreen('bystander-noprofile')}
            >
              <div className="em-access-card-icon">👤</div>
              <div className="em-access-card-body">
                <div className="em-access-card-title">Bystander Access</div>
                <div className="em-access-card-sub">
                  Name, insurance and emergency contacts — scan a QR to load a patient
                </div>
              </div>
              <span className="em-access-card-arrow">›</span>
            </button>

            {/* Healthcare */}
            <button
              className="em-access-card em-access-card--healthcare"
              onClick={() => setScreen('code-entry')}
            >
              <div className="em-access-card-icon">🏥</div>
              <div className="em-access-card-body">
                <div className="em-access-card-title">Healthcare Professional</div>
                <div className="em-access-card-sub">
                  Full medical profile — requires access code
                </div>
              </div>
              <span className="em-access-card-arrow">›</span>
            </button>

          </div>

          <div className="em-gate-disclaimer">
            Scan a patient's LifeQR code to access their specific emergency profile.
          </div>

          <button className="btn btn-ghost" onClick={() => navigate('/')}>
            ← Return to Home
          </button>
        </div>
      </div>
    )
  }

  // ── Bystander with no profile loaded ─────────────────────
  if (screen === 'bystander-noprofile') {
    return (
      <div className="em-page em-page--bystander">
        <div className="em-auth-inner">
          <div className="em-auth-header">
            <div className="em-bystander-banner">
              <span className="em-banner-cross">✚</span>
              BYSTANDER ACCESS
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setScreen('no-profile')}>
              ✕ Exit
            </button>
          </div>

          <div className="em-bystander-notice">
            No patient profile loaded. Scan a LifeQR code with your camera to load a patient's information.
          </div>

          <div className="em-scan-prompt">
            <div className="em-scan-icon">📷</div>
            <p>Open your phone camera and point it at the patient's LifeQR code to load their bystander information.</p>
          </div>

          <button className="em-upgrade-btn" onClick={() => setScreen('code-entry')}>
            🏥 Healthcare professional? Enter access code
          </button>

          <div className="em-auth-footer">
            <span>LifeQR Emergency Medical Passport</span>
            <span>Bystander view</span>
          </div>
        </div>
      </div>
    )
  }

  // ── Access Gate — profile found, choose access level ──────
  if (screen === 'gate') {
    return (
      <div className="em-page em-page--gate">
        <div className="em-gate-inner">

          <div className="em-banner">
            <span className="em-banner-cross">✚</span>
            EMERGENCY MEDICAL PASSPORT
          </div>

          <div className="em-gate-name">{profile.name || 'Unknown Patient'}</div>
          <div className="em-gate-label">LifeQR — Choose Access Level</div>

          <div className="em-access-options">

            {/* Bystander */}
            <button
              className="em-access-card em-access-card--bystander"
              onClick={() => setScreen('bystander')}
            >
              <div className="em-access-card-icon">👤</div>
              <div className="em-access-card-body">
                <div className="em-access-card-title">Bystander Access</div>
                <div className="em-access-card-sub">
                  Name, insurance info and emergency contacts only
                </div>
              </div>
              <span className="em-access-card-arrow">›</span>
            </button>

            {/* Healthcare Professional */}
            <button
              className="em-access-card em-access-card--healthcare"
              onClick={() => setScreen('code-entry')}
            >
              <div className="em-access-card-icon">🏥</div>
              <div className="em-access-card-body">
                <div className="em-access-card-title">Healthcare Professional</div>
                <div className="em-access-card-sub">
                  Full medical profile — requires access code
                </div>
              </div>
              <span className="em-access-card-arrow">›</span>
            </button>

          </div>

          <div className="em-gate-disclaimer">
            Unauthorized access to private medical records is prohibited.
          </div>

          <button className="btn btn-ghost" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  // ── Bystander View ────────────────────────────────────────
  if (screen === 'bystander') {
    return (
      <div className="em-page em-page--bystander">
        <div className="em-auth-inner">

          <div className="em-auth-header">
            <div className="em-bystander-banner">
              <span className="em-banner-cross">✚</span>
              BYSTANDER ACCESS
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setScreen('gate')}>
              ✕ Exit
            </button>
          </div>

          <div className="em-bystander-notice">
            Limited information only. For full medical access, select Healthcare Professional.
          </div>

          {/* Patient name */}
          <div className="em-patient-header">
            <div className="em-patient-avatar">
              {(profile.name || 'U')[0].toUpperCase()}
            </div>
            <div className="em-patient-info">
              <div className="em-patient-name">{profile.name || '—'}</div>
              <div className="em-patient-meta">LifeQR Emergency Passport</div>
            </div>
          </div>

          <div className="em-sections">

            {/* Insurance */}
            {(profile.insuranceProvider || profile.insurancePolicyNumber) ? (
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
            ) : (
              <div className="em-section">
                <div className="em-section-label">Health Insurance</div>
                <div className="em-section-value em-empty">No insurance information provided</div>
              </div>
            )}

            {/* Emergency contacts */}
            {profile.emergencyContacts?.some(c => c.name) ? (
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
            ) : (
              <div className="em-section">
                <div className="em-section-label">Emergency Contacts</div>
                <div className="em-section-value em-empty">No emergency contacts provided</div>
              </div>
            )}

          </div>

          <button className="em-upgrade-btn" onClick={() => setScreen('code-entry')}>
            🏥 Healthcare professional? Enter access code
          </button>

          <div className="em-auth-footer">
            <span>LifeQR Emergency Medical Passport</span>
            <span>Bystander view — limited information</span>
          </div>

        </div>
      </div>
    )
  }

  // ── Code Entry ────────────────────────────────────────────
  if (screen === 'code-entry') {
    return (
      <div className="em-page em-page--gate">
        <div className="em-gate-inner">

          <div className="em-banner">
            <span className="em-banner-cross">✚</span>
            HEALTHCARE ACCESS
          </div>

          <div className="em-lock-icon">🔐</div>
          <h2 className="em-gate-title">Enter Access Code</h2>
          <p className="em-gate-desc">
            Enter the healthcare professional access code to view the full medical profile
            {profile?.name ? ` for ${profile.name}` : ''}.
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

          <button className="btn btn-ghost" onClick={() => setScreen(profile ? 'gate' : 'no-profile')}>
            ← Back
          </button>
        </div>
      </div>
    )
  }

  // ── Authorized Healthcare View ────────────────────────────
  const age = profile ? calcAge(profile.dob) : null

  return (
    <div className="em-page em-page--authorized">
      <div className="em-auth-inner">

        <div className="em-auth-header">
          <div className="em-auth-banner">
            <span className="em-banner-cross">✚</span>
            AUTHORIZED HEALTHCARE ACCESS
          </div>
          <button className="btn btn-ghost btn-sm em-exit-btn" onClick={() => setScreen(profile ? 'gate' : 'no-profile')}>
            ✕ Exit
          </button>
        </div>

        <div className="em-demo-notice">
          ⚠ Demo access code used. A real system would require verified healthcare professional authentication.
        </div>

        {profile ? (
          <>
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
                          <a href={`tel:${c.phone}`} className="em-contact-phone">📞 {c.phone}</a>
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
                    {profile.insuranceProvider && <div><strong>Provider:</strong> {profile.insuranceProvider}</div>}
                    {profile.insurancePolicyNumber && <div><strong>Policy:</strong> {profile.insurancePolicyNumber}</div>}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* No profile loaded — access granted but no QR scanned yet */
          <div className="em-authorized-noprofile">
            <div className="em-authorized-check">✓</div>
            <h3>Access Granted</h3>
            <p>You are authorized as a healthcare professional.</p>
            <p>To view a patient's full medical profile, scan their LifeQR code with your camera.</p>
            <div className="em-scan-prompt" style={{ marginTop: '1.5rem' }}>
              <div className="em-scan-icon">📷</div>
              <p>Point your camera at a patient's LifeQR code to load their complete medical profile.</p>
            </div>
          </div>
        )}

        <div className="em-auth-footer">
          <span>LifeQR Emergency Medical Passport</span>
          <span>For authorized healthcare use only</span>
        </div>

      </div>
    </div>
  )
}
