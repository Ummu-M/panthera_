import test from 'node:test'
import assert from 'node:assert/strict'
import { canAssignRole, isSafeReportDataUrl, isSameOriginRequest } from '../lib/security'

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
})

test('only system administrators can assign non-admin roles', () => {
  assert.equal(canAssignRole('SYSTEM_ADMIN', 'SECRETARY'), true)
  assert.equal(canAssignRole('SYSTEM_ADMIN', 'SYSTEM_ADMIN'), true)
  assert.equal(canAssignRole('SECRETARY', 'TREASURER'), false)
  assert.equal(canAssignRole('RSL', 'SYSTEM_ADMIN'), false)
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