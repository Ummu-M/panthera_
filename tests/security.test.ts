import test from 'node:test'
import assert from 'node:assert/strict'
import { canAssignRole, isSafeReportDataUrl, isSameOriginRequest } from '../lib/security'

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
  assert.equal(canAssignRole('SECRETARY', 'TREASURER'), false)
  assert.equal(canAssignRole('RSL', 'SYSTEM_ADMIN'), false)
})

test('same-origin validation accepts same host and rejects cross-origin requests', () => {
  assert.equal(isSameOriginRequest('http://localhost:3000', 'localhost:3000'), true)
  assert.equal(isSameOriginRequest('https://attacker.example', 'localhost:3000'), false)
  assert.equal(isSameOriginRequest(undefined, 'localhost:3000'), true)
})