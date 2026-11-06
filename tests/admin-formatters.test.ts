import test from 'node:test'
import assert from 'node:assert/strict'
import { formatCrewDate, formatKSh, TREASURY_TYPE_LABELS } from '../lib/admin-formatters'
import { normalizeTreasuryQuery } from '../lib/treasury-list'

test('formats treasury values consistently', () => {
  assert.equal(formatCrewDate('2026-10-31T12:00:00.000Z'), '31/10/2026')
  assert.equal(formatCrewDate('invalid'), '—')
  assert.equal(formatCrewDate(null), '—')
  assert.equal(formatKSh(1234567.5), 'KSh 1,234,567.5')
  assert.deepEqual(TREASURY_TYPE_LABELS, { income: 'Income', expense: 'Expense' })
})

test('normalizes supported treasury filters and rejects invalid values', () => {
  assert.deepEqual(normalizeTreasuryQuery({
    q: '  camp  ',
    type: 'expense',
    status: 'pending',
    from: '2026-10-01',
    to: '2026-10-31',
    sort: 'amount',
    direction: 'asc',
    page: '3'
  }), {
    q: 'camp',
    type: 'expense',
    status: 'pending',
    from: '2026-10-01',
    to: '2026-10-31',
    sort: 'amount',
    direction: 'asc',
    page: 3,
    pageSize: 20
  })

  assert.deepEqual(normalizeTreasuryQuery({
    type: 'invalid',
    status: 'anything',
    from: '2026-02-30',
    sort: 'unknown',
    direction: 'sideways',
    page: '-2'
  }), {
    q: '',
    type: 'all',
    status: 'all',
    from: '',
    to: '',
    sort: 'createdAt',
    direction: 'desc',
    page: 1,
    pageSize: 20
  })
})
