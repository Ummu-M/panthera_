import test from 'node:test'
import assert from 'node:assert/strict'
import { canAssignRole, isSafeReportDataUrl, isSameOriginRequest, MAX_REPORT_FILE_SIZE_BYTES } from '../lib/security'

const eventManagers = new Set(['SYSTEM_ADMIN', 'SECRETARY', 'RSL', 'OG'])
const galleryManagers = new Set(['SYSTEM_ADMIN', 'SECRETARY', 'RSL'])
const inventoryManagers = new Set(['SYSTEM_ADMIN', 'QUARTERMASTER', 'RSL'])
const treasuryManagers = new Set(['SYSTEM_ADMIN', 'SECRETARY', 'TREASURER', 'RSL'])

test('accepts supported report data URLs', () => {
  assert.equal(isSafeReportDataUrl('data:application/pdf;base64,JVBERi0xLjQ='), true)
  assert.equal(isSafeReportDataUrl('data:image/png;base64,iVBORw0KGgo='), true)
})

test('rejects executable or malformed report URLs', () => {
  assert.equal(isSafeReportDataUrl('javascript:alert(1)'), false)
  assert.equal(isSafeReportDataUrl('data:text/html;base64,PGh0bWw+'), false)
  assert.equal(isSafeReportDataUrl('data:application/pdf,plain-text'), false)
  assert.equal(isSafeReportDataUrl('data:application/pdf;base64,not base64'), false)
})

test('allows reports up to 10 MB and rejects larger files', () => {
  const maxSizeReport = `data:application/pdf;base64,${Buffer.alloc(MAX_REPORT_FILE_SIZE_BYTES).toString('base64')}`
  const oversizedReport = `data:application/pdf;base64,${Buffer.alloc(MAX_REPORT_FILE_SIZE_BYTES + 1).toString('base64')}`
  assert.equal(isSafeReportDataUrl(maxSizeReport), true)
  assert.equal(isSafeReportDataUrl(oversizedReport), false)
})

test('only the system administrator and RSL can assign roles to approved members', () => {
  assert.equal(canAssignRole('SYSTEM_ADMIN', 'SECRETARY', 'approved'), true)
  assert.equal(canAssignRole('SYSTEM_ADMIN', 'MEMBER', 'approved'), true)
  assert.equal(canAssignRole('RSL', 'CREW_LEADER', 'approved'), true)
  assert.equal(canAssignRole('SYSTEM_ADMIN', 'SYSTEM_ADMIN', 'approved'), false)
  assert.equal(canAssignRole('SYSTEM_ADMIN', 'TREASURER', 'pending'), false)
  assert.equal(canAssignRole('SECRETARY', 'TREASURER', 'approved'), false)
  assert.equal(canAssignRole('RSL', 'SYSTEM_ADMIN', 'approved'), false)
})

test('same-origin validation accepts same host and rejects cross-origin requests', () => {
  assert.equal(isSameOriginRequest('http://localhost:3000', 'localhost:3000'), true)
  assert.equal(isSameOriginRequest('https://attacker.example', 'localhost:3000'), false)
  assert.equal(isSameOriginRequest(undefined, 'localhost:3000'), true)
})

test('role responsibilities are explicitly covered', () => {
  assert.equal(eventManagers.has('OG'), true)
  assert.equal(galleryManagers.has('SECRETARY'), true)
  assert.equal(inventoryManagers.has('QUARTERMASTER'), true)
  assert.equal(treasuryManagers.has('TREASURER'), true)
  assert.equal(eventManagers.has('MEMBER'), false)
  assert.equal(inventoryManagers.has('MEMBER'), false)
})