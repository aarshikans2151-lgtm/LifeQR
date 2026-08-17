/**
 * storage.js
 * All localStorage reads and writes go through this module.
 * No component should call localStorage directly.
 */

const KEYS = {
  ACCOUNTS: 'lifeqr_accounts',
  SESSION: 'lifeqr_session',
  profile: (userId) => `lifeqr_profile_${userId}`,
}

// ── Accounts ──────────────────────────────────────────────

export function getAccounts() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.ACCOUNTS)) || []
  } catch {
    return []
  }
}

export function saveAccounts(accounts) {
  localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts))
}

export function findAccountByEmail(email) {
  return getAccounts().find(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  ) || null
}

// ── Session ───────────────────────────────────────────────

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.SESSION)) || null
  } catch {
    return null
  }
}

export function saveSession(session) {
  localStorage.setItem(KEYS.SESSION, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(KEYS.SESSION)
}

// Session is valid for 7 days
export function isSessionValid(session) {
  if (!session || !session.userId || !session.loggedInAt) return false
  const sevenDays = 7 * 24 * 60 * 60 * 1000
  return Date.now() - session.loggedInAt < sevenDays
}

// ── Profile ───────────────────────────────────────────────

export function getProfile(userId) {
  try {
    return JSON.parse(localStorage.getItem(KEYS.profile(userId))) || null
  } catch {
    return null
  }
}

export function saveProfile(userId, profile) {
  localStorage.setItem(KEYS.profile(userId), JSON.stringify(profile))
}

// ── Account lookup by userId ───────────────────────────────

export function findAccountById(userId) {
  return getAccounts().find((a) => a.userId === userId) || null
}
