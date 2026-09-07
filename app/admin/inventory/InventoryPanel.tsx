'use client'

import { FormEvent, useState } from 'react'
import { theme } from '@/lib/theme'

const C = theme
const categories = ['Camping Gear', 'Navigation', 'First Aid', 'Tools', 'Clothing', 'Cooking', 'Other']
const conditions = ['Excellent', 'Good', 'Fair', 'Needs Repair']

type Item = { id: string; name: string; category: string; quantity: number; condition: string; location: string | null; createdAt: string }

export default function InventoryPanel({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems)
  const [form, setForm] = useState({ name: '', category: categories[0], quantity: '1', condition: 'Good', location: 'Bishop Square Store' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const repairCount = items.filter((item) => item.condition === 'Needs Repair').length
  const goodCount = items.filter((item) => ['Good', 'Excellent'].includes(item.condition)).length

  const addItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/admin/inventory', { method: editingId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingId ? { id: editingId, ...form } : form) })
      const data = await response.json()
      if (!response.ok) { setMessage(data?.error || 'Unable to add inventory item.'); return }
      setItems((current) => editingId ? current.map((item) => item.id === editingId ? data : item) : [data, ...current])
      setForm({ name: '', category: categories[0], quantity: '1', condition: 'Good', location: 'Bishop Square Store' })
      setEditingId(null)
      setMessage(editingId ? 'Inventory item updated.' : 'Inventory item added.')
    } catch { setMessage('Unable to add inventory item.') } finally { setSaving(false) }
  }

  const removeItem = async (id: string) => {
    const response = await fetch('/api/admin/inventory', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (response.ok) setItems((current) => current.filter((item) => item.id !== id))
    else setMessage('Unable to remove inventory item.')
  }

  const editItem = (item: Item) => {
    setEditingId(item.id)
    setForm({ name: item.name, category: item.category, quantity: String(item.quantity), condition: item.condition, location: item.location || '' })
  }

  return (
    <>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginTop: 24 }}>
        {[['Total items', items.length], ['Needs repair', repairCount], ['Good condition', goodCount]].map(([label, value]) => <div key={label} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: 16 }}><div style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em' }}>{label}</div><div style={{ color: C.text, fontSize: 24, marginTop: 6 }}>{value}</div></div>)}
      </section>
      <section style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginTop: 20 }}>
        <h2 style={{ margin: '0 0 14px', color: C.text, fontSize: 19, fontFamily: 'var(--font-display)', fontWeight: 500 }}>{editingId ? 'Edit inventory item' : 'Add inventory item'}</h2>
        <form onSubmit={addItem} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
          <input required placeholder="Item name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} style={{ padding: 11, border: `1px solid ${C.border}`, borderRadius: 8 }} />
          <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} style={{ padding: 11, border: `1px solid ${C.border}`, borderRadius: 8 }}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
          <input required min="0" type="number" placeholder="Quantity" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} style={{ padding: 11, border: `1px solid ${C.border}`, borderRadius: 8 }} />
          <select value={form.condition} onChange={(event) => setForm({ ...form, condition: event.target.value })} style={{ padding: 11, border: `1px solid ${C.border}`, borderRadius: 8 }}>{conditions.map((condition) => <option key={condition}>{condition}</option>)}</select>
          <input placeholder="Storage location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} style={{ padding: 11, border: `1px solid ${C.border}`, borderRadius: 8 }} />
          <button disabled={saving} type="submit" style={{ border: 'none', borderRadius: 8, background: saving ? C.muted : C.gold500, color: '#fff', fontWeight: 700 }}>{saving ? 'Saving...' : editingId ? 'Save changes' : 'Add item'}</button>
          {editingId ? <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', category: categories[0], quantity: '1', condition: 'Good', location: 'Bishop Square Store' }) }} style={{ border: `1px solid ${C.border}`, borderRadius: 8, background: '#fff', color: C.text }}>Cancel</button> : null}
        </form>
        {message ? <div style={{ marginTop: 12, color: C.gold600, fontSize: 13 }}>{message}</div> : null}
      </section>
      <section style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, overflowX: 'auto', marginTop: 20 }}>
        <table style={{ width: '100%', minWidth: 780, borderCollapse: 'collapse', color: C.text }}><thead><tr style={{ background: 'rgba(46,155,236,.06)' }}>{['Item', 'Category', 'Quantity', 'Condition', 'Location', 'Action'].map((heading) => <th key={heading} style={{ textAlign: 'left', padding: 14 }}>{heading}</th>)}</tr></thead><tbody>{items.map((item) => <tr key={item.id}><td style={{ padding: 14 }}>{item.name}</td><td style={{ padding: 14 }}>{item.category}</td><td style={{ padding: 14 }}>{item.quantity}</td><td style={{ padding: 14 }}>{item.condition}</td><td style={{ padding: 14 }}>{item.location || '—'}</td><td style={{ padding: 14 }}><button onClick={() => editItem(item)} type="button" style={{ border: 'none', background: 'transparent', color: C.gold600, cursor: 'pointer' }}>Edit</button><button onClick={() => removeItem(item.id)} type="button" style={{ border: 'none', background: 'transparent', color: '#9b2c2c', cursor: 'pointer', marginLeft: 10 }}>Remove</button></td></tr>)}</tbody></table>
      </section>
    </>
  )
}
