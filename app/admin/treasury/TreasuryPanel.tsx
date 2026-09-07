'use client'

import { FormEvent, useState } from 'react'
import { theme } from '@/lib/theme'

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
}

export default function TreasuryPanel({ initialPayments }: { initialPayments: Payment[] }) {
  const [payments, setPayments] = useState(initialPayments)
  const [form, setForm] = useState({ amount: '', category: '', purpose: '', type: 'income', status: 'recorded' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const settledPayments = payments.filter((payment) => payment.status !== 'pending')
  const income = settledPayments.filter((payment) => payment.type !== 'expense').reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  const expenses = settledPayments.filter((payment) => payment.type === 'expense').reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  const balance = income - expenses

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/payments', {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingId ? { id: editingId, ...form } : form)
      })
      const data = await response.json()
      if (!response.ok) {
        setMessage(data?.error || 'Unable to record payment.')
        return
      }
      setPayments((current) => editingId ? current.map((payment) => payment.id === editingId ? data : payment) : [data, ...current])
      setForm({ amount: '', category: '', purpose: '', type: 'income', status: 'recorded' })
      setEditingId(null)
      setMessage(editingId ? 'Treasury entry updated.' : 'Treasury entry recorded.')
    } catch {
      setMessage('Unable to record payment.')
    } finally {
      setSaving(false)
    }
  }

  const removePayment = async (id: string) => {
    const response = await fetch('/api/admin/payments', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (response.ok) setPayments((current) => current.filter((payment) => payment.id !== id))
    else setMessage('Unable to remove treasury entry.')
  }

  const editPayment = (payment: Payment) => {
    setEditingId(payment.id)
    setForm({ amount: String(payment.amount), category: payment.category, purpose: payment.purpose || '', type: payment.type, status: payment.status })
  }

  return (
    <>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 24 }}>
        <div style={{ background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}>
          <div style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recorded entries</div>
          <div style={{ color: C.text, fontSize: 24, marginTop: 6 }}>{payments.length}</div>
        </div>
        {['Income', `KSh ${income.toLocaleString()}`, 'Expenses', `KSh ${expenses.toLocaleString()}`, 'Balance', `KSh ${balance.toLocaleString()}`].reduce<Array<[string, string]>>((cards, value, index, values) => index % 2 === 0 ? [...cards, [value, values[index + 1]]] : cards, []).map(([label, value]) => <div key={label} style={{ background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}><div style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div><div style={{ color: C.text, fontSize: 24, marginTop: 6 }}>{value}</div></div>)}
      </section>

      <section style={{ background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginTop: 20 }}>
        <h2 style={{ margin: '0 0 14px', color: C.text, fontSize: 19, fontFamily: 'var(--font-display)', fontWeight: 500 }}>Record treasury entry</h2>
        <form onSubmit={submit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <input required type="number" min="0" step="0.01" placeholder="Amount (KSh)" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} style={{ padding: 11, border: `1px solid ${C.border}`, borderRadius: 8 }} />
          <input required placeholder="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} style={{ padding: 11, border: `1px solid ${C.border}`, borderRadius: 8 }} />
          <input required placeholder="What was the money for?" value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })} style={{ padding: 11, border: `1px solid ${C.border}`, borderRadius: 8 }} />
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} style={{ padding: 11, border: `1px solid ${C.border}`, borderRadius: 8 }}><option value="income">Income</option><option value="expense">Expense</option></select>
          <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} style={{ padding: 11, border: `1px solid ${C.border}`, borderRadius: 8 }}>
            <option value="recorded">Recorded</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
          </select>
          <button type="submit" disabled={saving} style={{ border: 'none', borderRadius: 8, background: saving ? C.muted : C.gold500, color: '#fff', fontWeight: 700, cursor: saving ? 'wait' : 'pointer' }}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Add entry'}</button>
          {editingId ? <button type="button" onClick={() => { setEditingId(null); setForm({ amount: '', category: '', purpose: '', type: 'income', status: 'recorded' }) }} style={{ border: `1px solid ${C.border}`, borderRadius: 8, background: '#fff', color: C.text }}>Cancel</button> : null}
        </form>
        {message ? <div style={{ marginTop: 12, color: C.gold600, fontSize: 13 }}>{message}</div> : null}
      </section>

      <section style={{ background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 12, overflowX: 'auto', marginTop: 20 }}>
        <table style={{ width: '100%', minWidth: 650, borderCollapse: 'collapse', color: C.text }}>
          <thead><tr style={{ background: 'rgba(46,155,236,0.06)' }}><th style={{ textAlign: 'left', padding: 14 }}>Amount</th><th style={{ textAlign: 'left', padding: 14 }}>Type</th><th style={{ textAlign: 'left', padding: 14 }}>Category</th><th style={{ textAlign: 'left', padding: 14 }}>Purpose</th><th style={{ textAlign: 'left', padding: 14 }}>Status</th><th style={{ textAlign: 'left', padding: 14 }}>Recorded by</th><th style={{ textAlign: 'left', padding: 14 }}>Date</th><th style={{ textAlign: 'left', padding: 14 }}>Action</th></tr></thead>
          <tbody>{payments.map((payment) => <tr key={payment.id}><td style={{ padding: 14 }}>KSh {Number(payment.amount).toLocaleString()}</td><td style={{ padding: 14 }}>{payment.type}</td><td style={{ padding: 14 }}>{payment.category}</td><td style={{ padding: 14 }}>{payment.purpose || '—'}</td><td style={{ padding: 14 }}>{payment.status}</td><td style={{ padding: 14 }}>{payment.userId}</td><td style={{ padding: 14 }}>{new Date(payment.createdAt).toLocaleDateString()}</td><td style={{ padding: 14 }}><button type="button" onClick={() => editPayment(payment)} style={{ border: 'none', background: 'transparent', color: C.gold600, cursor: 'pointer' }}>Edit</button><button type="button" onClick={() => removePayment(payment.id)} style={{ border: 'none', background: 'transparent', color: '#9b2c2c', cursor: 'pointer', marginLeft: 10 }}>Remove</button></td></tr>)}</tbody>
        </table>
      </section>
    </>
  )
}
