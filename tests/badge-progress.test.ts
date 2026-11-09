import test from 'node:test'
import assert from 'node:assert/strict'
import { badgeProgressLabel, isBadgeProgressStatus, resolveBadgeProgressStatus } from '../lib/badge-progress'

test('badge progress accepts only the supported stages', () => {
  assert.equal(isBadgeProgressStatus('IN_PROGRESS'), true)
  assert.equal(isBadgeProgressStatus('COMPLETED'), true)
  assert.equal(isBadgeProgressStatus('APPROVED'), false)
  assert.equal(isBadgeProgressStatus(null), false)
})

test('legacy approval outcomes remain readable as progress without changing the saved value', () => {
  assert.equal(resolveBadgeProgressStatus(null, 'APPROVED'), 'COMPLETED')
  assert.equal(resolveBadgeProgressStatus(null, 'REJECTED'), 'IN_PROGRESS')
  assert.equal(resolveBadgeProgressStatus('COMPLETED', 'PENDING'), 'COMPLETED')
  assert.equal(badgeProgressLabel(null, 'APPROVED'), 'Completed')
})
