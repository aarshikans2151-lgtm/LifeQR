import React, { useState, useEffect } from 'react'
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
  }
}

export default function Profile() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const [form, setForm] = useState(() => {
    const existing = getProfile(currentUser?.userId)
    return existing || emptyProfile(currentUser?.name)
  })
  const [saved, setSaved] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    setSaved(false)
  }

  function handleContactChange(index, field, value) {
    setForm(f => {
      const contacts = [...f.emergencyContacts]
      contacts[index] = { ...contacts[index], [field]: value }
      return { ...f, emergencyContacts: contacts }
    })
    setSaved(false)
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

  function handleSave(e) {
    e.preventDefault()
    saveProfile(currentUser.userId, form)
    setSaved(true)
    setTimeout(() => navigate('/dashboard'), 1500)
  }

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

        {saved && (
          <div className="success-msg">Profile saved! Returning to dashboard…</div>
        )}

        <form onSubmit={handleSave} noValidate>

          {/* ── Basic Info ── */}
          <section className="profile-section">
            <h3 className="profile-section-title">Basic Information</h3>

            <div className="form-group">
              <label>Full Name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Jamie Osei" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth</label>
                <input name="dob" type="date" value={form.dob} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Blood Group</label>
                <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange}>
                  {BLOOD_GROUPS.map(g => (
                    <option key={g} value={g}>{g || '— Select —'}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* ── Medical Details ── */}
          <section className="profile-section">
            <h3 className="profile-section-title">Medical Details</h3>

            <div className="form-group">
              <label>Allergies</label>
              <textarea
                name="allergies"
                value={form.allergies}
                onChange={handleChange}
                placeholder="e.g. Penicillin, Peanuts, Latex"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Existing Medical Conditions</label>
              <textarea
                name="conditions"
                value={form.conditions}
                onChange={handleChange}
                placeholder="e.g. Mild asthma, Type 1 diabetes"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Current Medications</label>
              <textarea
                name="medications"
                value={form.medications}
                onChange={handleChange}
                placeholder="e.g. Salbutamol inhaler 100mcg, Metformin 500mg"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Previous Surgeries</label>
              <textarea
                name="surgeries"
                value={form.surgeries}
                onChange={handleChange}
                placeholder="e.g. Appendectomy 2022, Tonsillectomy 2018"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Organ Donor Status</label>
              <select name="organDonor" value={form.organDonor} onChange={handleChange}>
                {DONOR_OPTIONS.map(o => (
                  <option key={o} value={o}>{o}</option>
                ))}
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
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => removeContact(i)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={e => handleContactChange(i, 'name', e.target.value)}
                      placeholder="Kemi Osei"
                    />
                  </div>
                  <div className="form-group">
                    <label>Relationship</label>
                    <input
                      type="text"
                      value={contact.relationship}
                      onChange={e => handleContactChange(i, 'relationship', e.target.value)}
                      placeholder="Mother"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={contact.phone}
                    onChange={e => handleContactChange(i, 'phone', e.target.value)}
                    placeholder="+44 7700 000000"
                  />
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
                <input
                  name="insuranceProvider"
                  type="text"
                  value={form.insuranceProvider}
                  onChange={handleChange}
                  placeholder="NHS / BUPA / etc."
                />
              </div>
              <div className="form-group">
                <label>Policy Number</label>
                <input
                  name="insurancePolicyNumber"
                  type="text"
                  value={form.insurancePolicyNumber}
                  onChange={handleChange}
                  placeholder="N/A or policy number"
                />
              </div>
            </div>
          </section>

          <button type="submit" className="btn btn-primary profile-save-btn">
            Save Profile
          </button>

        </form>

        <div className="notice" style={{ marginTop: '1.5rem' }}>
          Your medical profile is stored only on this device. Clearing your browser data will remove it.
        </div>
      </div>
    </div>
  )
}
