import assert from 'node:assert/strict'
import test from 'node:test'
import { createEmailLoginCode, hashEmailLoginCode, normalizeLoginEmail, verifyEmailLoginCode } from '../lib/email-login-code'

test('normalizes valid email addresses and rejects malformed addresses', () => {
  assert.equal(normalizeLoginEmail('  Rover@example.com '), 'rover@example.com')
  assert.equal(normalizeLoginEmail('not-an-email'), null)
  assert.equal(normalizeLoginEmail(''), null)
  assert.equal(normalizeLoginEmail(null), null)
})

test('creates six-digit email login codes, including leading zeroes', () => {
  assert.match(createEmailLoginCode(), /^\d{6}$/)
})

test('email login codes are tied to the normalized email and secret', () => {
  const email = 'rover@example.com'
  const code = '004281'
  const secret = 'test-secret'
  const tokenHash = hashEmailLoginCode(email, code, secret)

  assert.equal(verifyEmailLoginCode(email, code, tokenHash, secret), true)
  assert.equal(verifyEmailLoginCode('other@example.com', code, tokenHash, secret), false)
  assert.equal(verifyEmailLoginCode(email, code, tokenHash, 'other-secret'), false)
  assert.equal(verifyEmailLoginCode(email, '4281', tokenHash, secret), false)
})
