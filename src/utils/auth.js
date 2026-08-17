/**
 * auth.js
 * Signup, login, and logout logic.
 * Depends on storage.js and crypto.js.
 */

import { hashPassword } from './crypto.js'
import {
  getAccounts,
  saveAccounts,
  findAccountByEmail,
  saveSession,
  clearSession,
} from './storage.js'

/**
 * Register a new user.
 * Returns { success: true, userId } or { success: false, error: string }
 */
export async function signup({ name, email, password }) {
  const existing = findAccountByEmail(email)
  if (existing) {
    return { success: false, error: 'An account with this email already exists.' }
  }

  const passwordHash = await hashPassword(password)
  const userId = crypto.randomUUID()

  const newAccount = {
    userId,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    createdAt: Date.now(),
  }

  const accounts = getAccounts()
  accounts.push(newAccount)
  saveAccounts(accounts)

  saveSession({ userId, loggedInAt: Date.now() })

  return { success: true, userId, name: newAccount.name }
}

/**
 * Log in an existing user.
 * Returns { success: true, userId, name } or { success: false, error: string }
 */
export async function login({ email, password }) {
  const account = findAccountByEmail(email)
  if (!account) {
    return { success: false, error: 'Invalid email or password.' }
  }

  const passwordHash = await hashPassword(password)
  if (passwordHash !== account.passwordHash) {
    return { success: false, error: 'Invalid email or password.' }
  }

  saveSession({ userId: account.userId, loggedInAt: Date.now() })

  return { success: true, userId: account.userId, name: account.name }
}

/**
 * Log out the current user.
 */
export function logout() {
  clearSession()
}
