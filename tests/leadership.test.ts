import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveLeadershipRoster } from '../lib/leadership'

test('database role assignment overrides the saved and fallback welcome name', () => {
  const roster = resolveLeadershipRoster(
    [{ roleKey: 'quartermaster', name: 'Previous Quartermaster' }],
    [{ name: 'New Quartermaster', role: { name: 'QUARTERMASTER' } }]
  )

  const quartermaster = roster.find((entry) => entry.roleKey === 'quartermaster')
  assert.equal(quartermaster?.name, 'New Quartermaster')
  assert.equal(quartermaster?.assigned, true)
})

test('saved and default names remain for offices without an assigned member', () => {
  const roster = resolveLeadershipRoster(
    [{ roleKey: 'assistant-jsl', name: 'Saved Assistant JSL' }],
    []
  )

  assert.equal(roster.find((entry) => entry.roleKey === 'assistant-jsl')?.name, 'Saved Assistant JSL')
  assert.equal(roster.find((entry) => entry.roleKey === 'crew-leader')?.name, 'Horas Obutinda')
  assert.equal(roster.find((entry) => entry.roleKey === 'crew-leader')?.assigned, false)
})
