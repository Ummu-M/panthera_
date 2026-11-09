import test from 'node:test'
import assert from 'node:assert/strict'
import { isValidPushEndpoint, normalizeNotificationUrl } from '../lib/push-notifications'

test('only HTTPS push subscription endpoints are accepted', () => {
  assert.equal(isValidPushEndpoint('https://push.example.test/subscription'), true)
  assert.equal(isValidPushEndpoint('http://push.example.test/subscription'), false)
  assert.equal(isValidPushEndpoint('not a URL'), false)
  assert.equal(isValidPushEndpoint('https://push.example.test/' + 'a'.repeat(2048)), false)
})

test('push destinations stay on an internal app path', () => {
  assert.equal(normalizeNotificationUrl('/dashboard?tab=badges'), '/dashboard?tab=badges')
  assert.equal(normalizeNotificationUrl('//example.test'), '/')
  assert.equal(normalizeNotificationUrl('https://example.test'), '/')
  assert.equal(normalizeNotificationUrl('/\\\\example.test'), '/')
})
