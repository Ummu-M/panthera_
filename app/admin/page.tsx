'use client'

import { useEffect, useMemo, useState } from 'react'
import { signOut } from 'next-auth/react'
import { Home, User, Users, DollarSign, Package, Clipboard, Star, Clock, TrendingUp, TrendingDown, Building, Trash2, X, Search, BadgeCheck, CalendarCheck, CreditCard, Edit2, Save } from 'lucide-react'

const C = {
  gold: '#E8B84B',
  dkGold: '#C49A2A',
  dark: '#1E2228',
  panel: '#252B35',
  border: '#353D4A',
  muted: '#8A9BB5',
  text: '#D8DCE5',
  green: '#3DD68C',
  red: '#FF6B6B'
}

const S = {
  card: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, marginBottom: 10 },
  input: { width: '100%', background: 'rgba(255,255,255,.04)', border: `1px solid ${C.border}`, borderRadius: 12, padding: '12px 14px', color: C.text, fontFamily: 'inherit', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const },
  btnGold: { border: 'none', borderRadius: 12, padding: '12px 0', width: '100%', fontFamily: 'inherit', fontSize: 14, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' as const, cursor: 'pointer', background: `linear-gradient(135deg,${C.gold},${C.dkGold})`, color: '#000' }
}

function StatCard({ icon: IconComponent, label, value, color }: any) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 10px', textAlign: 'center', flex: 1 }}>
      <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'center' }}>
        <IconComponent size={24} color={color || C.gold} />
      </div>
      <div style={{ fontWeight: 900, fontSize: 20, color: color || C.gold }}>{value}</div>
      <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 2 }}>{label}</div>
    </div>
  )
}

function Modal({ open, onClose, title, children }: any) {
  if (!open) return null
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'flex-end', zIndex: 20 }}>
      <div style={{ background: '#1A1F28', borderRadius: '20px 20px 0 0', padding: '24px 20px 32px', width: '100%', maxHeight: '80%', overflowY: 'auto' as const }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{ fontWeight: 700, fontSize: 17 }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, padding: 0, display: 'flex', alignItems: 'center' }}>
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function formatDate(value: any) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString()
}

function memberInitials(name: string) {
  return String(name || 'M')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'M'
}

function statusPill(status: string, positive = 'active') {
  const normalized = String(status || '').toLowerCase()
  const isPositive = normalized === positive || normalized === 'paid' || normalized === 'present' || normalized === 'earned'
  return {
    border: `1px solid ${isPositive ? 'rgba(61,214,140,.35)' : 'rgba(255,107,107,.35)'}`,
    background: isPositive ? 'rgba(61,214,140,.10)' : 'rgba(255,107,107,.10)',
    color: isPositive ? C.green : C.red,
    borderRadius: 999,
    padding: '5px 9px',
    fontSize: 11,
    fontWeight: 800,
    textTransform: 'capitalize' as const,
    display: 'inline-flex'
  }
}

function MembersSection() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [patrol, setPatrol] = useState('all')
  const [rank, setRank] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState({ key: 'fullName', direction: 'asc' })
  const [selectedId, setSelectedId] = useState('')
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<any>({})
  const [saving, setSaving] = useState(false)

  const loadMembers = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/members')
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Unable to load members')
      setMembers(data.members || [])
      if (data.error) setError(data.error)
    } catch (err: any) {
      setError(err?.message || 'Unable to load members')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [])

  const selected = useMemo(() => members.find((member) => member.id === selectedId) || members[0], [members, selectedId])

  useEffect(() => {
    if (!selected) return
    setSelectedId(selected.id)
    setEditForm({
      full_name: selected.rawScout?.full_name || selected.fullName,
      email: selected.rawScout?.email || selected.email,
      phone: selected.rawScout?.phone || selected.phone,
      patrol: selected.rawScout?.patrol || selected.patrol,
      rank: selected.rawScout?.rank || selected.rank,
      status: selected.rawScout?.status || selected.status,
      join_date: selected.rawScout?.join_date || selected.joinDate
    })
  }, [selected?.id])

  const patrols = useMemo(() => Array.from(new Set(members.map((m) => m.patrol).filter(Boolean))).sort(), [members])
  const ranks = useMemo(() => Array.from(new Set(members.map((m) => m.rank).filter(Boolean))).sort(), [members])

  const summary = useMemo(() => {
    const now = new Date()
    return {
      total: members.length,
      active: members.filter((member) => String(member.status).toLowerCase() === 'active').length,
      newThisMonth: members.filter((member) => {
        if (!member.joinDate) return false
        const date = new Date(member.joinDate)
        return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
      }).length
    }
  }, [members])

  const filteredMembers = useMemo(() => {
    const valueFor = (member: any, key: string) => {
      if (key === 'joinDate') return new Date(member.joinDate || 0).getTime()
      return member[key]
    }

    return members
      .filter((member) => member.fullName.toLowerCase().includes(query.toLowerCase()))
      .filter((member) => patrol === 'all' || member.patrol === patrol)
      .filter((member) => rank === 'all' || member.rank === rank)
      .filter((member) => status === 'all' || member.status === status)
      .sort((a, b) => {
        const aValue = valueFor(a, sort.key)
        const bValue = valueFor(b, sort.key)
        const direction = sort.direction === 'asc' ? 1 : -1
        if (typeof aValue === 'number' && typeof bValue === 'number') return (aValue - bValue) * direction
        return String(aValue || '').localeCompare(String(bValue || '')) * direction
      })
  }, [members, query, patrol, rank, status, sort])

  const changeSort = (key: string) => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const saveMember = async () => {
    if (!selected) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, data: editForm })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Unable to save member')
      setEditing(false)
      await loadMembers()
    } catch (err: any) {
      setError(err?.message || 'Unable to save member')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    ['fullName', 'Member'],
    ['patrol', 'Patrol'],
    ['rank', 'Rank'],
    ['joinDate', 'Join date'],
    ['status', 'Status'],
    ['duesStatus', 'Dues'],
    ['attendancePercent', 'Attendance'],
    ['badgesEarned', 'Badges']
  ]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard icon={Users} label="Total Members" value={summary.total} />
        <StatCard icon={BadgeCheck} label="Active Members" value={summary.active} color={C.green} />
        <StatCard icon={Clock} label="New This Month" value={summary.newThisMonth} color={C.gold} />
      </div>

      {error && (
        <div style={{ ...S.card, borderColor: 'rgba(255,107,107,.35)', color: C.red }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 16, alignItems: 'start' }}>
        <section style={{ minWidth: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(220px, 1fr) repeat(3, minmax(130px, 160px))', gap: 10, marginBottom: 12 }}>
            <label style={{ position: 'relative' }}>
              <Search size={16} color={C.muted} style={{ position: 'absolute', left: 12, top: 13 }} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name" style={{ ...S.input, paddingLeft: 36 }} />
            </label>
            <select value={patrol} onChange={(e) => setPatrol(e.target.value)} style={S.input}>
              <option value="all">All patrols</option>
              {patrols.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={rank} onChange={(e) => setRank(e.target.value)} style={S.input}>
              <option value="all">All ranks</option>
              {ranks.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={S.input}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto', border: `1px solid ${C.border}`, borderRadius: 10, background: 'rgba(16,24,27,.78)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
              <thead>
                <tr>
                  {columns.map(([key, label]) => (
                    <th key={key} onClick={() => changeSort(key)} style={{ textAlign: 'left', padding: '12px 14px', color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em', cursor: 'pointer', borderBottom: `1px solid ${C.border}` }}>
                      {label} {sort.key === key ? (sort.direction === 'asc' ? 'up' : 'down') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={8} style={{ padding: 22, color: C.muted }}>Loading members...</td></tr>
                )}
                {!loading && filteredMembers.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 22, color: C.muted }}>No members match the current view.</td></tr>
                )}
                {!loading && filteredMembers.map((member) => (
                  <tr key={member.id} onClick={() => { setSelectedId(member.id); setEditing(false) }} style={{ cursor: 'pointer', background: selected?.id === member.id ? 'rgba(231,184,74,.08)' : 'transparent' }}>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(231,184,74,.16)', display: 'grid', placeItems: 'center', color: C.gold, fontWeight: 900, overflow: 'hidden', flex: '0 0 auto' }}>
                          {member.photoUrl ? <img src={member.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : memberInitials(member.fullName)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800 }}>{member.fullName}</div>
                          <div style={{ color: C.muted, fontSize: 11 }}>{member.email || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}` }}>{member.patrol}</td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}` }}>{member.rank}</td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}` }}>{formatDate(member.joinDate)}</td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}` }}><span style={statusPill(member.status)}>{member.status}</span></td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}` }}><span style={statusPill(member.duesStatus, 'paid')}>{member.duesStatus}</span></td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}` }}>{member.attendancePercent}%</td>
                    <td style={{ padding: '12px 14px', borderBottom: `1px solid ${C.border}` }}>{member.badgesEarned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside style={{ ...S.card, position: 'sticky', top: 16, marginBottom: 0 }}>
          {!selected ? (
            <div style={{ color: C.muted }}>Select a member to view details.</div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>{selected.fullName}</div>
                  <div style={{ color: C.muted, fontSize: 12 }}>{selected.patrol} / {selected.rank}</div>
                </div>
                <button onClick={() => editing ? saveMember() : setEditing(true)} style={{ border: `1px solid ${C.border}`, background: editing ? C.gold : 'rgba(255,255,255,.04)', color: editing ? '#000' : C.text, borderRadius: 10, padding: '8px 10px', display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer', fontWeight: 800 }}>
                  {editing ? <Save size={15} /> : <Edit2 size={15} />}
                  {editing ? (saving ? 'Saving' : 'Save') : 'Edit'}
                </button>
              </div>

              <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
                {[
                  ['full_name', 'Full name'],
                  ['email', 'Email'],
                  ['phone', 'Phone'],
                  ['patrol', 'Patrol'],
                  ['rank', 'Rank'],
                  ['status', 'Status'],
                  ['join_date', 'Join date']
                ].map(([key, label]) => (
                  <label key={key} style={{ display: 'grid', gap: 4, color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                    {label}
                    {editing ? (
                      <input value={editForm[key] || ''} onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })} style={{ ...S.input, padding: '9px 10px', fontSize: 13 }} />
                    ) : (
                      <span style={{ color: C.text, fontSize: 13, textTransform: 'none', letterSpacing: 0 }}>{key === 'join_date' ? formatDate(editForm[key]) : editForm[key] || '-'}</span>
                    )}
                  </label>
                ))}
              </div>

              {[
                ['Badge Progress', BadgeCheck, selected.badgeHistory, (item: any) => `${item.name} - ${item.status} ${formatDate(item.earnedAt)}`],
                ['Attendance', CalendarCheck, selected.attendanceHistory, (item: any) => `${formatDate(item.date)} - ${item.event} - ${item.status}`],
                ['Dues', CreditCard, selected.duesHistory, (item: any) => `${item.period} - Ksh ${Number(item.amount || 0).toLocaleString()} - ${item.status}`],
                ['Payments', DollarSign, selected.paymentHistory, (item: any) => `${formatDate(item.date)} - ${item.description} - Ksh ${Number(item.amount || 0).toLocaleString()}`]
              ].map(([title, IconComp, rows, render]: any) => (
                <div key={title} style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, marginBottom: 8 }}>
                    <IconComp size={16} color={C.gold} />
                    {title}
                  </div>
                  <div style={{ display: 'grid', gap: 7, maxHeight: 120, overflowY: 'auto' }}>
                    {rows?.length ? rows.slice(0, 6).map((item: any, index: number) => (
                      <div key={item.id || index} style={{ color: C.muted, fontSize: 12, lineHeight: 1.35 }}>{render(item)}</div>
                    )) : <div style={{ color: C.muted, fontSize: 12 }}>No records yet.</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [tab, setTab] = useState('home')
  const [pending, setPending] = useState<any[]>([])
  const [approved, setApproved] = useState<any[]>([])
  const [scouts, setScouts] = useState<any[]>([])
  const [finances, setFinances] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [awardedBadges, setAwardedBadges] = useState<any[]>([])
  const [badgeReports, setBadgeReports] = useState<any[]>([])

  const [scoutModal, setScoutModal] = useState(false)
  const [scoutForm, setScoutForm] = useState({ name: '', email: '', phone: '', regno: '', uni: '', year: '' })

  const [finModal, setFinModal] = useState(false)
  const [finForm, setFinForm] = useState({ type: 'income', desc: '', amount: '', date: '', person: '' })

  const [invModal, setInvModal] = useState(false)
  const [invForm, setInvForm] = useState({ name: '', category: 'Camping Gear', qty: '', condition: 'Good', location: '' })

  const [projModal, setProjModal] = useState(false)
  const [projForm, setProjForm] = useState({ name: '', desc: '', start: '', end: '', status: 'pending', progress: '0' })

  const addScout = () => {
    if (!scoutForm.name || !scoutForm.email) return alert('Name and email required')
    const id = 'KC-' + String(Math.floor(Math.random() * 9000) + 1000)
    setScouts((s) => [...s, { ...scoutForm, id, joinDate: new Date().toLocaleDateString(), badges: 0, serviceHrs: 0 }])
    setScoutModal(false)
    setScoutForm({ name: '', email: '', phone: '', regno: '', uni: '', year: '' })
  }

  const approveScout = (scout: any) => {
    setScouts((s) => [...s, { ...scout, joinDate: new Date().toLocaleDateString(), badges: 0, serviceHrs: 0 }])
    setApproved((x) => [...x, { ...scout, approvedOn: new Date().toLocaleDateString() }])
    setPending((p) => p.filter((x) => x.id !== scout.id))
  }

  const addFinance = () => {
    if (!finForm.desc || !finForm.amount) return alert('Description and amount required')
    setFinances((f) => [...f, { ...finForm, amount: parseFloat(finForm.amount) }])
    setFinModal(false)
    setFinForm({ type: 'income', desc: '', amount: '', date: '', person: '' })
  }

  const removeFinance = (index: number) => {
    setFinances((f) => f.filter((_, i) => i !== index))
  }

  const addInventory = () => {
    if (!invForm.name || !invForm.qty) return alert('Item name and quantity required')
    setInventory((i) => [...i, { ...invForm, qty: parseInt(invForm.qty) }])
    setInvModal(false)
    setInvForm({ name: '', category: 'Camping Gear', qty: '', condition: 'Good', location: '' })
  }

  const removeInventory = (index: number) => {
    setInventory((i) => i.filter((_, idx) => idx !== index))
  }

  const addProject = () => {
    if (!projForm.name) return alert('Project name required')
    setProjects((p) => [...p, { ...projForm, progress: parseInt(projForm.progress) || 0 }])
    setProjModal(false)
    setProjForm({ name: '', desc: '', start: '', end: '', status: 'pending', progress: '0' })
  }

  const removeProject = (index: number) => {
    setProjects((p) => p.filter((_, i) => i !== index))
  }

  const income = finances.filter((f) => f.type === 'income').reduce((s, f) => s + f.amount, 0)
  const expense = finances.filter((f) => f.type === 'expense').reduce((s, f) => s + f.amount, 0)
  const statusColor = { pending: C.gold, active: C.green, done: C.muted }

  return (
    <main style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${C.dark} 0%, #0d1d1b 100%)`, color: C.text, padding: 24, position: 'relative' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, padding: '18px 22px', borderRadius: 18, background: 'rgba(16,24,27,0.86)', border: `1px solid rgba(231,184,74,0.18)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', border: `2px solid rgba(231,184,74,0.7)` }}>
              <img src="/pantheralogo.png" alt="Panthera" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ letterSpacing: '0.18em', fontSize: 11, color: C.gold, textTransform: 'uppercase', fontWeight: 800 }}>Panthera</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>Admin Dashboard</div>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: '/' })} style={{ background: 'rgba(255,76,76,.1)', color: C.red, border: `1px solid rgba(255,76,76,.3)`, borderRadius: 12, padding: '10px 16px', fontWeight: 800, cursor: 'pointer' }}>
            Sign Out
          </button>
        </header>

        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, background: 'rgba(8,8,8,.5)', marginBottom: 20 }}>
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'scouts', icon: Users, label: 'Members' },
            { id: 'finances', icon: DollarSign, label: 'Finances' },
            { id: 'inventory', icon: Package, label: 'Inventory' },
            { id: 'projects', icon: Clipboard, label: 'Projects' },
            { id: 'badges', icon: Star, label: 'Badges' }
          ].map(({ id, icon: IconComp, label }) => (
            <div key={id} onClick={() => setTab(id)} style={{ flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: tab === id ? C.gold : C.muted, borderBottom: tab === id ? `2px solid ${C.gold}` : '2px solid transparent', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <IconComp size={16} style={{ marginRight: 6 }} />
              {label}
            </div>
          ))}
        </div>

        {tab === 'home' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
              <StatCard icon={Users} label="Members" value={scouts.length} />
              <StatCard icon={Clock} label="Pending" value={pending.length} color={C.gold} />
              <StatCard icon={DollarSign} label="Balance" value={`Ksh ${(income - expense).toLocaleString()}`} color={C.green} />
              <StatCard icon={Package} label="Items" value={inventory.length} />
            </div>
          </div>
        )}

        {tab === 'scouts' && (
          <>
            <MembersSection />
            {false && (
          <div>
            <button onClick={() => setScoutModal(true)} style={{ ...S.btnGold, marginBottom: 16, width: 120, padding: '10px 0' }}>
              ＋ Add Scout
            </button>
            <div style={{ display: 'grid', gap: 10 }}>
              {scouts.map((scout, i) => (
                <div key={i} style={{ ...S.card }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{scout.name}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                    {scout.email} · {scout.regno || '—'}
                  </div>
                </div>
              ))}
            </div>
            <Modal open={scoutModal} onClose={() => setScoutModal(false)} title="Add Scout">
              <div style={{ display: 'grid', gap: 12 }}>
                <input placeholder="Name" value={scoutForm.name} onChange={(e) => setScoutForm({ ...scoutForm, name: e.target.value })} style={S.input} />
                <input placeholder="Email" type="email" value={scoutForm.email} onChange={(e) => setScoutForm({ ...scoutForm, email: e.target.value })} style={S.input} />
                <input placeholder="Phone" value={scoutForm.phone} onChange={(e) => setScoutForm({ ...scoutForm, phone: e.target.value })} style={S.input} />
                <input placeholder="Reg. No." value={scoutForm.regno} onChange={(e) => setScoutForm({ ...scoutForm, regno: e.target.value })} style={S.input} />
                <button onClick={addScout} style={S.btnGold}>
                  Add Scout
                </button>
              </div>
            </Modal>
          </div>
            )}
          </>
        )}

        {tab === 'finances' && (
          <div>
            <button onClick={() => setFinModal(true)} style={{ ...S.btnGold, marginBottom: 16, width: 120, padding: '10px 0' }}>
              ＋ Add
            </button>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: 10, marginBottom: 16 }}>
              <StatCard icon={TrendingUp} label="Income" value={`Ksh ${income.toLocaleString()}`} color={C.green} />
              <StatCard icon={TrendingDown} label="Expense" value={`Ksh ${expense.toLocaleString()}`} color={C.red} />
              <StatCard icon={Building} label="Balance" value={`Ksh ${(income - expense).toLocaleString()}`} color={income - expense >= 0 ? C.green : C.red} />
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {finances.map((f, i) => (
                <div key={i} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{f.desc}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{f.date || '—'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: f.type === 'income' ? C.green : C.red }}>
                      {f.type === 'income' ? '+' : '-'}Ksh {f.amount.toLocaleString()}
                    </span>
                    <button onClick={() => removeFinance(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, padding: 0, display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <Modal open={finModal} onClose={() => setFinModal(false)} title="Add Transaction">
              <div style={{ display: 'grid', gap: 12 }}>
                <select value={finForm.type} onChange={(e) => setFinForm({ ...finForm, type: e.target.value })} style={S.input}>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <input placeholder="Description" value={finForm.desc} onChange={(e) => setFinForm({ ...finForm, desc: e.target.value })} style={S.input} />
                <input type="number" placeholder="Amount" value={finForm.amount} onChange={(e) => setFinForm({ ...finForm, amount: e.target.value })} style={S.input} />
                <input type="date" value={finForm.date} onChange={(e) => setFinForm({ ...finForm, date: e.target.value })} style={S.input} />
                <button onClick={addFinance} style={S.btnGold}>
                  Add
                </button>
              </div>
            </Modal>
          </div>
        )}

        {tab === 'inventory' && (
          <div>
            <button onClick={() => setInvModal(true)} style={{ ...S.btnGold, marginBottom: 16, width: 120, padding: '10px 0' }}>
              ＋ Add Item
            </button>
            <div style={{ display: 'grid', gap: 10 }}>
              {inventory.map((item, i) => (
                <div key={i} style={{ ...S.card, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                      {item.category} · Qty: {item.qty}
                    </div>
                  </div>
                  <button onClick={() => removeInventory(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, padding: 0, display: 'flex', alignItems: 'center' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <Modal open={invModal} onClose={() => setInvModal(false)} title="Add Item">
              <div style={{ display: 'grid', gap: 12 }}>
                <input placeholder="Item name" value={invForm.name} onChange={(e) => setInvForm({ ...invForm, name: e.target.value })} style={S.input} />
                <select value={invForm.category} onChange={(e) => setInvForm({ ...invForm, category: e.target.value })} style={S.input}>
                  {['Camping Gear', 'Navigation', 'First Aid', 'Tools', 'Clothing', 'Cooking', 'Other'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input type="number" placeholder="Quantity" value={invForm.qty} onChange={(e) => setInvForm({ ...invForm, qty: e.target.value })} style={S.input} />
                <input placeholder="Location" value={invForm.location} onChange={(e) => setInvForm({ ...invForm, location: e.target.value })} style={S.input} />
                <button onClick={addInventory} style={S.btnGold}>
                  Add Item
                </button>
              </div>
            </Modal>
          </div>
        )}

        {tab === 'projects' && (
          <div>
            <button onClick={() => setProjModal(true)} style={{ ...S.btnGold, marginBottom: 16, width: 120, padding: '10px 0' }}>
              ＋ New
            </button>
            <div style={{ display: 'grid', gap: 10 }}>
              {projects.map((p, i) => (
                <div key={i} style={{ ...S.card, borderLeft: `3px solid ${statusColor[p.status as keyof typeof statusColor] || C.border}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                    <button onClick={() => removeProject(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, padding: 0, display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,.06)', borderRadius: 8, height: 6, marginBottom: 4 }}>
                    <div style={{ height: '100%', background: `linear-gradient(90deg,${C.gold},${C.green})`, width: `${p.progress}%` }} />
                  </div>
                  <div style={{ fontSize: 10, color: C.muted }}>Progress: {p.progress}%</div>
                </div>
              ))}
            </div>
            <Modal open={projModal} onClose={() => setProjModal(false)} title="New Project">
              <div style={{ display: 'grid', gap: 12 }}>
                <input placeholder="Project name" value={projForm.name} onChange={(e) => setProjForm({ ...projForm, name: e.target.value })} style={S.input} />
                <textarea placeholder="Description" value={projForm.desc} onChange={(e) => setProjForm({ ...projForm, desc: e.target.value })} style={{ ...S.input, height: 70, resize: 'none' as const }} />
                <input type="date" value={projForm.start} onChange={(e) => setProjForm({ ...projForm, start: e.target.value })} style={S.input} />
                <input type="number" min="0" max="100" placeholder="Progress %" value={projForm.progress} onChange={(e) => setProjForm({ ...projForm, progress: e.target.value })} style={S.input} />
                <button onClick={addProject} style={S.btnGold}>
                  Create
                </button>
              </div>
            </Modal>
          </div>
        )}

        {tab === 'badges' && (
          <div>
            <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: C.muted }}>Badge module coming soon</div>
          </div>
        )}
      </div>
    </main>
  )
}
