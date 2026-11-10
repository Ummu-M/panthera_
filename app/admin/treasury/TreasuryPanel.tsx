'use client'

import { FormEvent, useCallback, useEffect, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { theme } from '@/lib/theme'
import { formatCrewDate, formatKSh, TREASURY_TYPE_LABELS } from '@/lib/admin-formatters'
import { useAdminToast } from '@/app/components/admin/AdminToastProvider'
import { AdminSearchInput } from '@/app/components/admin/AdminSearchInput'
import { DataTable, EmptyState, StatCard } from '@/app/components/admin/AdminUI'
import type { AdminColumn } from '@/app/components/admin/AdminUI'

const C = theme

type Payment = {
  id: string
  amount: number
  category: string
  purpose: string | null
  type: string
  status: string
  userId: string
  createdAt: string
  recordedBy: string
}

type TreasuryPanelProps = {
  initialPayments: Payment[]
  initialTotal: number
  entryCount: number
  income: number
  expenses: number
  page: number
  pageSize: number
}

export default function TreasuryPanel({ initialPayments, initialTotal, entryCount, income, expenses, page, pageSize }: TreasuryPanelProps) {
  const router = useRouter()
  const pathname = usePathname() || '/admin/treasury'
  const searchParams = useSearchParams()
  const queryString = searchParams?.toString() || ''
  const params = new URLSearchParams(queryString)
  const { notify } = useAdminToast()
  const [payments, setPayments] = useState(initialPayments)
  const [form, setForm] = useState({ amount: '', type: 'income', purpose: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [total, setTotal] = useState(initialTotal)
  const balance = income - expenses
  const currentPage = page
  const query = params.get('q') || ''
  const type = params.get('type') || 'all'
  const status = params.get('status') || 'all'
  const from = params.get('from') || ''
  const to = params.get('to') || ''
  const sort = params.get('sort') || 'createdAt'
  const direction = params.get('direction') === 'asc' ? 'asc' : 'desc'

  useEffect(() => {
    setPayments(initialPayments)
    setTotal(initialTotal)
  }, [initialPayments, initialTotal])

  useEffect(() => {
    let active = true
    const refresh = async () => {
      try {
        const suffix = queryString ? `?${queryString}` : ''
        const response = await fetch(`/api/admin/payments${suffix}`)
        if (!response.ok) return
        const data = await response.json()
        if (active && Array.isArray(data?.items)) {
          setPayments(data.items)
          setTotal(data.total)
        }
      } catch {
        // Keep the last known entries visible if a background refresh fails.
      }
    }
    const interval = window.setInterval(refresh, 15000)
    return () => { active = false; window.clearInterval(interval) }
  }, [queryString])

  const updateQuery = useCallback((key: string, value: string, replace = false) => {
    const next = new URLSearchParams(queryString)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    const href = next.toString() ? `${pathname}?${next.toString()}` : pathname
    startTransition(() => {
      if (replace) router.replace(href, { scroll: false })
      else router.push(href, { scroll: false })
    })
  }, [pathname, queryString, router])

  const clearFilters = () => {
    startTransition(() => router.replace(pathname, { scroll: false }))
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    try {
      const response = await fetch('/api/admin/payments', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form)
      })
      const data = await response.json()
      if (!response.ok) {
        notify('error', editingId ? "Couldn't save the entry. Try again." : "Couldn't add the entry. Try again.")
        return
      }
      setPayments((current) => editingId
        ? current.map((payment) => payment.id === editingId ? { ...data, recordedBy: payment.recordedBy } : payment)
        : [{ ...data, recordedBy: data.userId }, ...current].slice(0, pageSize))
      setTotal((current) => editingId ? current : current + 1)
      setForm({ amount: '', type: 'income', purpose: '' })
      notify('success', editingId ? 'Entry updated' : 'Entry added')
      setEditingId(null)
      router.refresh()
    } catch {
      notify('error', editingId ? "Couldn't save the entry. Try again." : "Couldn't add the entry. Try again.")
    } finally {
      setSaving(false)
    }
  }

  const removePayment = async (id: string) => {
    if (!window.confirm('Remove this treasury entry? This action cannot be undone.')) return
    setRemovingId(id)
    try {
      const response = await fetch('/api/admin/payments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (!response.ok) {
        notify('error', "Couldn't remove the entry. Try again.")
        return
      }
      setPayments((current) => current.filter((payment) => payment.id !== id))
      setTotal((current) => Math.max(0, current - 1))
      notify('success', 'Entry removed. Deletion is permanent.')
      if (payments.length === 1 && currentPage > 1) updateQuery('page', String(currentPage - 1))
      else router.refresh()
    } catch {
      notify('error', "Couldn't remove the entry. Try again.")
    } finally {
      setRemovingId(null)
    }
  }

  const editPayment = (payment: Payment) => {
    setEditingId(payment.id)
    setForm({ amount: String(payment.amount), type: payment.type, purpose: payment.purpose || '' })
  }

  return (
    <>
      <section className="treasury-stat-grid" aria-label="Treasury summary" style={{ marginTop: 24 }}>
        <StatCard label="Current balance" value={formatKSh(balance)} />
        <StatCard label="Income" value={formatKSh(income)} />
        <StatCard label="Expenses" value={formatKSh(expenses)} />
        <StatCard label="Recorded entries" value={entryCount} />
      </section>

      <section style={{ background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginTop: 20 }}>
        <h2 style={{ margin: '0 0 16px', color: C.text, fontSize: 19, fontFamily: 'var(--font-display)', fontWeight: 500 }}>{editingId ? 'Edit treasury entry' : 'Record treasury entry'}</h2>
        <form className="treasury-entry-form" onSubmit={submit}>
          <label className="treasury-field">
            Amount
            <span className="treasury-amount-input">
              <span aria-hidden="true">KSh</span>
              <input required type="number" min="0" step="0.01" aria-label="Amount in Kenyan shillings" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
            </span>
          </label>
          <label className="treasury-field">
            Type
            <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              <option value="income">{TREASURY_TYPE_LABELS.income}</option>
              <option value="expense">{TREASURY_TYPE_LABELS.expense}</option>
            </select>
          </label>
          <label className="treasury-field treasury-purpose-field">
            Purpose
            <input required placeholder="e.g. Camp transport" value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })} />
          </label>
          <div className="treasury-form-actions">
            <button type="submit" disabled={saving} style={{ background: saving ? C.muted : C.gold500 }}>{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add entry'}</button>
            {editingId ? <button type="button" onClick={() => { setEditingId(null); setForm({ amount: '', type: 'income', purpose: '' }) }}>Cancel</button> : null}
          </div>
        </form>
      </section>

      <section style={{ background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginTop: 20 }}>
        <div className="admin-toolbar treasury-filter-toolbar" style={{ alignItems: 'end', borderBottom: `1px solid ${C.border}`, display: 'flex', flexWrap: 'wrap', gap: 12, padding: 16 }}>
          <AdminSearchInput value={query} onSearch={(value) => updateQuery('q', value, true)} />
          <label style={{ color: C.muted, display: 'grid', fontSize: 13, gap: 6 }}>
            Type
            <select value={type} onChange={(event) => updateQuery('type', event.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 8, minHeight: 42, padding: '9px 12px' }}>
              <option value="all">All types</option>
              <option value="income">{TREASURY_TYPE_LABELS.income}</option>
              <option value="expense">{TREASURY_TYPE_LABELS.expense}</option>
            </select>
          </label>
          <label style={{ color: C.muted, display: 'grid', fontSize: 13, gap: 6 }}>
            Status
            <select value={status} onChange={(event) => updateQuery('status', event.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 8, minHeight: 42, padding: '9px 12px' }}>
              <option value="all">All statuses</option>
              <option value="recorded">Recorded</option>
              <option value="pending">Pending</option>
            </select>
          </label>
          <label style={{ color: C.muted, display: 'grid', fontSize: 13, gap: 6 }}>
            From
            <input aria-label="Start date" type="date" value={from} onChange={(event) => updateQuery('from', event.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 8, minHeight: 42, padding: '9px 12px' }} />
          </label>
          <label style={{ color: C.muted, display: 'grid', fontSize: 13, gap: 6 }}>
            To
            <input aria-label="End date" type="date" value={to} onChange={(event) => updateQuery('to', event.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 8, minHeight: 42, padding: '9px 12px' }} />
          </label>
          <label style={{ color: C.muted, display: 'grid', fontSize: 13, gap: 6 }}>
            Sort
            <select value={sort} onChange={(event) => updateQuery('sort', event.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 8, minHeight: 42, padding: '9px 12px' }}>
              <option value="createdAt">Date</option>
              <option value="amount">Amount</option>
              <option value="purpose">Purpose</option>
            </select>
          </label>
          <label style={{ color: C.muted, display: 'grid', fontSize: 13, gap: 6 }}>
            Order
            <select value={direction} onChange={(event) => updateQuery('direction', event.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 8, minHeight: 42, padding: '9px 12px' }}>
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </label>
          {query || type !== 'all' || status !== 'all' || from || to || sort !== 'createdAt' || direction !== 'desc' ? (
            <button type="button" onClick={clearFilters} style={{ background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, color: C.gold600, cursor: 'pointer', minHeight: 42, padding: '9px 12px' }}>Clear filters</button>
          ) : null}
        </div>

        {isPending ? (
          <div aria-label="Loading entries" aria-busy="true" style={{ padding: 16 }}>
            {[0, 1, 2, 3].map((item) => <div key={item} className="admin-skeleton" style={{ height: 44, marginBottom: 8 }} />)}
          </div>
        ) : payments.length === 0 ? (
          <EmptyState
            title={entryCount === 0 && !query && type === 'all' && status === 'all' && !from && !to ? 'Nothing recorded yet' : 'No results'}
            action={entryCount === 0 && !query && type === 'all' && status === 'all' && !from && !to ? undefined : (
              <button type="button" onClick={clearFilters} style={{ background: C.gold500, border: 0, borderRadius: 8, color: '#fff', cursor: 'pointer', padding: '9px 14px' }}>Clear filters</button>
            )}
          >
            {entryCount === 0 && !query && type === 'all' && status === 'all' && !from && !to
              ? 'Add the first entry using the form above.'
              : 'No entries match those filters. Clear filters to see the full ledger.'}
          </EmptyState>
        ) : (
          <>
            <DataTable
              rows={payments}
              getRowKey={(payment) => payment.id}
              sort={sort}
              direction={direction}
              onSort={(key) => {
                const nextDirection = sort === key && direction === 'desc' ? 'asc' : 'desc'
                const next = new URLSearchParams(queryString)
                next.set('sort', key)
                next.set('direction', nextDirection)
                next.delete('page')
                startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }))
              }}
              columns={[
                { key: 'amount', label: 'Amount', sortable: true, render: (payment) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatKSh(payment.amount)}</span> },
                { key: 'type', label: 'Type', render: (payment) => TREASURY_TYPE_LABELS[payment.type === 'expense' ? 'expense' : 'income'] },
                { key: 'purpose', label: 'Purpose', sortable: true, render: (payment) => payment.purpose || '—' },
                { key: 'recordedBy', label: 'Recorded by', render: (payment) => payment.recordedBy || payment.userId },
                { key: 'createdAt', label: 'Date', sortable: true, render: (payment) => formatCrewDate(payment.createdAt) },
                {
                  key: 'actions',
                  label: 'Actions',
                  render: (payment) => (
                    <>
                      <button type="button" onClick={() => editPayment(payment)} style={{ background: 'transparent', border: 0, color: C.gold600, cursor: 'pointer', padding: '6px 4px' }}>Edit</button>
                      <button type="button" disabled={removingId === payment.id} onClick={() => removePayment(payment.id)} style={{ background: 'transparent', border: 0, color: C.danger, cursor: removingId === payment.id ? 'wait' : 'pointer', marginLeft: 10, padding: '6px 4px' }}>{removingId === payment.id ? 'Removing…' : 'Remove'}</button>
                    </>
                  )
                }
              ] satisfies AdminColumn<Payment>[]}
            />
            <div className="admin-table-mobile responsive-card-list">
              {payments.map((payment) => (
                <article key={payment.id} className="responsive-card">
                  <div style={{ alignItems: 'flex-start', display: 'flex', gap: 12, justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: 16, fontVariantNumeric: 'tabular-nums' }}>{formatKSh(payment.amount)}</strong>
                    <span style={{ border: `1px solid ${C.border}`, borderRadius: 999, color: C.muted, fontSize: 11, padding: '4px 8px' }}>{TREASURY_TYPE_LABELS[payment.type === 'expense' ? 'expense' : 'income']}</span>
                  </div>
                  <div style={{ fontSize: 13, marginTop: 7 }}>{payment.purpose || 'No purpose provided'}</div>
                  <div className="responsive-card-details">
                    <div><span className="responsive-card-label">Recorded by</span><span className="responsive-card-value">{payment.recordedBy || payment.userId}</span></div>
                    <div><span className="responsive-card-label">Date</span><span className="responsive-card-value">{formatCrewDate(payment.createdAt)}</span></div>
                  </div>
                  <div className="responsive-card-actions">
                    <button type="button" onClick={() => editPayment(payment)} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 7, color: C.gold600 }}>Edit</button>
                    <button type="button" disabled={removingId === payment.id} onClick={() => removePayment(payment.id)} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 7, color: C.danger }}>{removingId === payment.id ? 'Removing…' : 'Remove'}</button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}

        {total > 0 ? (
          <nav aria-label="Treasury pages" style={{ alignItems: 'center', borderTop: `1px solid ${C.border}`, display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', padding: 14 }}>
            <span style={{ color: C.muted, fontSize: 13 }}>
              Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, total)} of {total}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" disabled={currentPage <= 1 || isPending} onClick={() => updateQuery('page', String(currentPage - 1))} style={{ border: `1px solid ${C.border}`, borderRadius: 7, background: '#fff', color: C.text, cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', padding: '8px 12px' }}>Previous</button>
              <button type="button" disabled={currentPage * pageSize >= total || isPending} onClick={() => updateQuery('page', String(currentPage + 1))} style={{ border: `1px solid ${C.border}`, borderRadius: 7, background: '#fff', color: C.text, cursor: currentPage * pageSize >= total ? 'not-allowed' : 'pointer', padding: '8px 12px' }}>Next</button>
            </div>
          </nav>
        ) : null}
      </section>
    </>
  )
}
