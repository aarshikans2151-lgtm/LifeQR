import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { getProfile, saveProfile } from '../utils/storage.js'
import '../styles/Profile.css'

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const DONOR_OPTIONS = ['Not specified', 'Yes', 'No']
const EMPTY_CONTACT = { name: '', relationship: '', phone: '' }

function emptyProfile(name) {
  return {
    name: name || '',
    dob: '',
    bloodGroup: '',
    allergies: '',
    conditions: '',
    medications: '',
    surgeries: '',
    organDonor: 'Not specified',
    emergencyContacts: [{ ...EMPTY_CONTACT }],
    insuranceProvider: '',
    insurancePolicyNumber: '',
    photo: null,
    updatedAt: null,
  }
}

export default function Profile() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const photoInputRef = useRef(null)

  const [form, setForm] = useState(() => {
    const existing = getProfile(currentUser?.userId)
    return existing || emptyProfile(currentUser?.name)
  })

  // save states: null | 'saving' | 'saved'
  const [saveState, setSaveState] = useState(null)
  const [errors, setErrors] = useState({})

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setErrors(err => ({ ...err, [name]: null }))
  }

  function handleContactChange(index, field, value) {
    setForm(f => {
      const contacts = [...f.emergencyContacts]
      contacts[index] = { ...contacts[index], [field]: value }
      return { ...f, emergencyContacts: contacts }
    })
  }

  function addContact() {
    if (form.emergencyContacts.length >= 3) return
    setForm(f => ({
      ...f,
      emergencyContacts: [...f.emergencyContacts, { ...EMPTY_CONTACT }]
    }))
  }

  function removeContact(index) {
    setForm(f => ({
      ...f,
      emergencyContacts: f.emergencyContacts.filter((_, i) => i !== index)
    }))
  }

  // ── Photo upload ──────────────────────────────────────────
  function handlePhotoChange(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setForm(f => ({ ...f, photo: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  function removePhoto() {
    setForm(f => ({ ...f, photo: null }))
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  // ── Validation ────────────────────────────────────────────
  function validate() {
    const newErrors = {}
    if (!form.name?.trim()) newErrors.name = 'Full name is required.'
    if (!form.dob) newErrors.dob = 'Date of birth is required.'
    if (!form.bloodGroup) newErrors.bloodGroup = 'Please select a blood group.'
    return newErrors
  }

  // ── Save ──────────────────────────────────────────────────
  function handleSave(e) {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      // Scroll to first error
      const firstKey = Object.keys(newErrors)[0]
      document.getElementById(firstKey)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setSaveState('saving')
    const profileToSave = { ...form, updatedAt: Date.now() }
    saveProfile(currentUser.userId, profileToSave)

    setTimeout(() => {
      setSaveState('saved')
      setTimeout(() => navigate('/dashboard'), 1200)
    }, 600)
  }

  const lastUpdated = form.updatedAt
    ? new Date(form.updatedAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : null

  return (
    <div className="profile-page">
      <div className="profile-inner">

        {/* Header */}
        <header className="profile-header">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </button>
          <div className="profile-header-logo">
            <div className="logo-icon">+</div>
            <span className="logo-text">Life<span>QR</span></span>
          </div>
        </header>

        <h1 className="profile-title">Medical Profile</h1>
        <p className="profile-subtitle">This information powers your Emergency Passport</p>

        {/* Last updated */}
        {lastUpdated && (
          <div className="profile-updated">
            Last updated: {lastUpdated}
          </div>
        )}

        {/* Save animation */}
        {saveState === 'saving' && (
          <div className="save-anim save-anim--saving">
            <span className="save-anim-spinner" /> Saving…
          </div>
        )}
        {saveState === 'saved' && (
          <div className="save-anim save-anim--saved">
            ✓ Profile saved! Returning to dashboard…
          </div>
        )}

        <form onSubmit={handleSave} noValidate>

          {/* ── Photo ── */}
          <section className="profile-section">
            <h3 className="profile-section-title">Profile Photo</h3>
            <div className="photo-upload-area">
              {form.photo ? (
                <div className="photo-preview-wrap">
                  <img src={form.photo} alt="Profile" className="photo-preview" />
                  <button type="button" className="photo-remove-btn" onClick={removePhoto}>
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="photo-upload-btn"
                  onClick={() => photoInputRef.current?.click()}
                >
                  <span className="photo-upload-icon">📷</span>
                  <span>Upload Photo</span>
                  <span className="photo-upload-hint">Optional — shown on emergency passport</span>
                </button>
              )}
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
            </div>
          </section>

          {/* ── Basic Info ── */}
          <section className="profile-section">
            <h3 className="profile-section-title">Basic Information</h3>

            <div className="form-group">
              <label htmlFor="name">Full Name <span className="required">*</span></label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Jamie Osei"
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dob">Date of Birth <span className="required">*</span></label>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  value={form.dob}
                  onChange={handleChange}
                  className={errors.dob ? 'input-error' : ''}
                />
                {errors.dob && <span className="field-error">{errors.dob}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="bloodGroup">Blood Group <span className="required">*</span></label>
                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  className={errors.bloodGroup ? 'input-error' : ''}
                >
                  {BLOOD_GROUPS.map(g => (
                    <option key={g} value={g}>{g || '— Select —'}</option>
                  ))}
                </select>
                {errors.bloodGroup && <span className="field-error">{errors.bloodGroup}</span>}
              </div>
            </div>
          </section>

          {/* ── Medical Details ── */}
          <section className="profile-section">
            <h3 className="profile-section-title">Medical Details</h3>

            <div className="form-group">
              <label>Allergies</label>
              <textarea name="allergies" value={form.allergies} onChange={handleChange}
                placeholder="e.g. Penicillin, Peanuts, Latex" rows={3} />
            </div>

            <div className="form-group">
              <label>Existing Medical Conditions</label>
              <textarea name="conditions" value={form.conditions} onChange={handleChange}
                placeholder="e.g. Mild asthma, Type 1 diabetes" rows={3} />
            </div>

            <div className="form-group">
              <label>Current Medications</label>
              <textarea name="medications" value={form.medications} onChange={handleChange}
                placeholder="e.g. Salbutamol inhaler 100mcg, Metformin 500mg" rows={3} />
            </div>

            <div className="form-group">
              <label>Previous Surgeries</label>
              <textarea name="surgeries" value={form.surgeries} onChange={handleChange}
                placeholder="e.g. Appendectomy 2022, Tonsillectomy 2018" rows={3} />
            </div>

            <div className="form-group">
              <label>Organ Donor Status</label>
              <select name="organDonor" value={form.organDonor} onChange={handleChange}>
                {DONOR_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          </section>

          {/* ── Emergency Contacts ── */}
          <section className="profile-section">
            <h3 className="profile-section-title">Emergency Contacts</h3>

            {form.emergencyContacts.map((contact, i) => (
              <div key={i} className="contact-block">
                <div className="contact-block-header">
                  <span className="section-label">Contact {i + 1}</span>
                  {form.emergencyContacts.length > 1 && (
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeContact(i)}>
                      Remove
                    </button>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input type="text" value={contact.name}
                      onChange={e => handleContactChange(i, 'name', e.target.value)}
                      placeholder="Kemi Osei" />
                  </div>
                  <div className="form-group">
                    <label>Relationship</label>
                    <input type="text" value={contact.relationship}
                      onChange={e => handleContactChange(i, 'relationship', e.target.value)}
                      placeholder="Mother" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="tel" value={contact.phone}
                    onChange={e => handleContactChange(i, 'phone', e.target.value)}
                    placeholder="+44 7700 000000" />
                </div>
              </div>
            ))}

            {form.emergencyContacts.length < 3 && (
              <button type="button" className="btn btn-outline btn-sm" onClick={addContact}>
                + Add Contact
              </button>
            )}
          </section>

          {/* ── Insurance ── */}
          <section className="profile-section">
            <h3 className="profile-section-title">Health Insurance</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Provider</label>
                <input name="insuranceProvider" type="text" value={form.insuranceProvider}
                  onChange={handleChange} placeholder="NHS / BUPA / etc." />
              </div>
              <div className="form-group">
                <label>Policy Number</label>
                <input name="insurancePolicyNumber" type="text" value={form.insurancePolicyNumber}
                  onChange={handleChange} placeholder="N/A or policy number" />
              </div>
            </div>
          </section>

          <p className="required-note"><span className="required">*</span> Required fields</p>

          <button
            type="submit"
            className={`btn profile-save-btn ${saveState === 'saved' ? 'btn-saved' : 'btn-primary'}`}
            disabled={saveState === 'saving' || saveState === 'saved'}
          >
            {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? '✓ Saved!' : 'Save Profile'}
          </button>

        </form>

        <div className="notice" style={{ marginTop: '1.5rem' }}>
          Your medical profile is stored only on this device. Clearing your browser data will remove it.
        </div>
      </div>
    </div>
  )
}
