import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { useAuth } from '../context/AuthContext.jsx'
import { getProfile } from '../utils/storage.js'
import '../styles/QRPage.css'

/**
 * Encode the medical profile into a compact Base64 string.
 * The full profile is embedded in the QR URL so it works
 * when scanned from ANY device — not just the device it was created on.
 */
function encodeProfile(profile) {
  const json = JSON.stringify(profile)
  return btoa(unescape(encodeURIComponent(json)))
}

export default function QRPage() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const qrRef = useRef(null)

  const profile = getProfile(currentUser?.userId)
  const [qrUrl, setQrUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!profile) return
    const encoded = encodeProfile(profile)
    // Use the current deployment origin so the QR works on Vercel too
    const base = window.location.origin
    setQrUrl(`${base}/emergency?data=${encoded}`)
  }, [profile])

  function handleDownload() {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = `LifeQR-${currentUser?.name?.replace(/\s+/g, '-') || 'passport'}.png`
    link.click()
  }

  function handlePrint() {
    window.print()
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(qrUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!profile) {
    return (
      <div className="qr-page">
        <div className="qr-inner">
          <header className="qr-header">
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
              ← Dashboard
            </button>
          </header>
          <div className="qr-no-profile">
            <div className="qr-no-profile-icon">📋</div>
            <h2>No medical profile yet</h2>
            <p>You need to complete your medical profile before a QR code can be generated.</p>
            <button className="btn btn-primary" onClick={() => navigate('/profile')}>
              Set Up Profile
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="qr-page">
      <div className="qr-inner">

        {/* Header */}
        <header className="qr-header">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </button>
          <div className="qr-header-logo">
            <div className="logo-icon">+</div>
            <span className="logo-text">Life<span>QR</span></span>
          </div>
        </header>

        <h1 className="qr-title">Your LifeQR Code</h1>
        <p className="qr-subtitle">Scan this code in an emergency to access your medical passport</p>

        {/* QR Code display */}
        <div className="qr-card" ref={qrRef}>
          <div className="qr-code-wrap">
            {qrUrl && (
              <QRCodeCanvas
                value={qrUrl}
                size={240}
                bgColor="#ffffff"
                fgColor="#061826"
                level="M"
                includeMargin={true}
              />
            )}
          </div>
          <div className="qr-name-label">{profile.name || currentUser?.name}</div>
          <div className="qr-sub-label">LifeQR Emergency Medical Passport</div>
        </div>

        {/* How it works */}
        <div className="qr-how">
          <h3 className="qr-how-title">How it works</h3>
          <div className="qr-steps">
            <div className="qr-step">
              <span className="qr-step-num">1</span>
              <span>Anyone scans this QR with a phone camera</span>
            </div>
            <div className="qr-step">
              <span className="qr-step-num">2</span>
              <span>They are taken to your Emergency Passport page</span>
            </div>
            <div className="qr-step">
              <span className="qr-step-num">3</span>
              <span>They must enter the healthcare access code to view your full profile</span>
            </div>
            <div className="qr-step">
              <span className="qr-step-num">4</span>
              <span>Authorized healthcare professionals see your complete medical information</span>
            </div>
          </div>
        </div>

        {/* Access code info */}
        <div className="qr-code-info">
          <span className="qr-code-info-icon">🔐</span>
          <div>
            <strong>Healthcare Access Code</strong>
            <p>The demo access code is <code>12345678</code>. Share this only with healthcare professionals.</p>
          </div>
        </div>

        {/* Your Profile ID */}
        <div className="qr-id-box">
          <div className="qr-id-label">Your LifeQR Profile ID</div>
          <div className="qr-id-value">{currentUser?.userId}</div>
          <p className="qr-id-hint">
            Share this ID so someone can access your Emergency Passport manually if they can't scan the QR.
          </p>
          <button className="btn btn-outline btn-sm" onClick={() => {
            navigator.clipboard.writeText(currentUser?.userId)
              .then(() => alert('Profile ID copied!'))
          }}>
            Copy Profile ID
          </button>
        </div>

        {/* Actions */}
        <div className="qr-actions">
          <button className="btn btn-primary" onClick={handleDownload}>
            ⬇ Download QR as PNG
          </button>
          <button className="btn btn-outline" onClick={handleCopyLink}>
            {copied ? '✓ Link Copied!' : '🔗 Copy Emergency Link'}
          </button>
          <button className="btn btn-outline qr-print-btn" onClick={handlePrint}>
            🖨 Print QR Code
          </button>
        </div>

        {/* Print-only block */}
        <div className="qr-print-only">
          <div className="qr-print-header">LifeQR — Emergency Medical Passport</div>
          <div className="qr-print-name">{profile.name || currentUser?.name}</div>
          <div className="qr-print-instruction">
            Scan QR code and enter healthcare access code to view full medical profile.
          </div>
        </div>

      </div>
    </div>
  )
}
