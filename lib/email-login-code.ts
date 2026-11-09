import { createHmac, randomInt, timingSafeEqual } from 'node:crypto'

export const EMAIL_LOGIN_CODE_TTL_MS = 10 * 60 * 1000
export const EMAIL_LOGIN_CODE_COOLDOWN_MS = 60 * 1000
export const EMAIL_LOGIN_CODE_MAX_ATTEMPTS = 5

export function normalizeLoginEmail(value: unknown) {
  if (typeof value !== 'string') return null
  const email = value.trim().toLowerCase()
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null
  return email
}

export function createEmailLoginCode() {
  return String(randomInt(0, 1_000_000)).padStart(6, '0')
}

export function hashEmailLoginCode(email: string, code: string, secret: string) {
  return createHmac('sha256', secret).update(`${email}:${code}`).digest('hex')
}

export function verifyEmailLoginCode(email: string, code: unknown, tokenHash: string, secret: string) {
  if (typeof code !== 'string' || !/^\d{6}$/.test(code)) return false
  const expected = Buffer.from(tokenHash, 'hex')
  const actual = Buffer.from(hashEmailLoginCode(email, code, secret), 'hex')
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}
