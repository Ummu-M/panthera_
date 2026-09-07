'use client'

import { useState } from 'react'
import { theme } from '@/lib/theme'

const C = theme

const ROLE_OPTIONS = [
  ['MEMBER', 'Member'],
  ['SECRETARY', 'Secretary'],
  ['RSL', 'Rover Scout Leader'],
  ['OG', 'Organising Secretary'],
  ['TREASURER', 'Treasurer'],
  ['QUARTERMASTER', 'Quartermaster'],
  ['DISCIPLINARIAN', 'Disciplinarian'],
  ['CREW_LEADER', 'Crew Leader'],
  ['ASSISTANT_CREW_LEADER', 'Assistant Crew Leader']
]

const ADMIN_ROLE_OPTION = ['SYSTEM_ADMIN', 'System Administrator']

type Member = {
  id: string
  roleId: string | null
  name: string | null
  email: string
  registrationNumber: string | null
  yearOfStudy: number | null
  phone: string | null
  school: string | null
  course: string | null
  role: string | null
  membershipStatus: string | null
  registrationFeePaid: boolean
  registrationFeeYear: number | null
  registrationFeeAmount: number | null
}

export default function UsersTable({ initialUsers, actorRole }: { initialUsers: Member[]; actorRole: string }) {
  const [users, setUsers] = useState(initialUsers)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const approve = async (id: string) => {
    setSavingId(id)
    setError('')

    try {
      const response = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, data: { membershipStatus: 'approved' } })
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data?.error || 'Unable to approve application.')
        return
      }
      setUsers((current) => current.map((user) => user.id === id ? { ...user, membershipStatus: 'approved' } : user))
    } catch {
      setError('Unable to approve application.')
    } finally {
      setSavingId(null)
    }
  }

  const assignRole = async (id: string, roleId: string, roleName: string) => {
    try {
      const response = await fetch('/api/admin/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, data: { roleId } })
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data?.error || 'Unable to assign role.')
        return
      }
      setUsers((current) => current.map((user) => user.id === id ? { ...user, roleId, role: roleName } : user))
    } catch {
      setError('Unable to assign role.')
    }
  }

  const removeMember = async (id: string) => {
    if (!window.confirm('Remove this member account?')) return
    const response = await fetch('/api/admin/members', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (response.ok) setUsers((current) => current.filter((user) => user.id !== id))
    else setError('Unable to remove member.')
  }

  const recordAnnualFee = async (user: Member) => {
    const year = new Date().getFullYear()
    const response = await fetch('/api/admin/members', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: user.id, data: { registrationFeePaid: true, registrationFeeYear: year, registrationFeeAmount: 100, registrationFeePaidAt: new Date().toISOString() } }) })
    if (!response.ok) return setError('Unable to record annual fee.')
    setUsers((current) => current.map((item) => item.id === user.id ? { ...item, registrationFeePaid: true, registrationFeeYear: year, registrationFeeAmount: 100 } : item))
  }

  return (
    <div style={{ background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', marginTop: 24, boxShadow: '0 14px 36px rgba(18,36,53,0.08)' }}>
      {error ? <div style={{ padding: '14px 18px', color: '#9b2c2c', background: '#fff5f5', borderBottom: `1px solid ${C.border}` }}>{error}</div> : null}
      <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', minWidth: 1060, borderCollapse: 'collapse', color: C.text }}>
        <thead>
          <tr style={{ background: 'rgba(46,155,236,0.06)' }}>
            <th style={{ textAlign: 'left', padding: '14px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</th>
            <th style={{ textAlign: 'left', padding: '14px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Name</th>
            <th style={{ textAlign: 'left', padding: '14px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Year</th>
            <th style={{ textAlign: 'left', padding: '14px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>KU reg. no.</th>
            <th style={{ textAlign: 'left', padding: '14px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>School</th>
            <th style={{ textAlign: 'left', padding: '14px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Course</th>
            <th style={{ textAlign: 'left', padding: '14px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role</th>
            <th style={{ textAlign: 'left', padding: '14px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Status</th>
            <th style={{ textAlign: 'left', padding: '14px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Annual fee</th>
            <th style={{ textAlign: 'left', padding: '14px 18px', borderBottom: `1px solid ${C.border}`, fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const status = String(user.membershipStatus || '').toLowerCase()
            const canApprove = status === 'pending'
            return (
              <tr key={user.id}>
                <td style={{ padding: '14px 18px', borderBottom: '1px solid rgba(18,36,53,0.06)', fontSize: 13.5, color: C.muted }}>{user.email}</td>
                <td style={{ padding: '14px 18px', borderBottom: '1px solid rgba(18,36,53,0.06)', fontSize: 13.5 }}>{user.name || '—'}</td>
                <td style={{ padding: '14px 18px', borderBottom: '1px solid rgba(18,36,53,0.06)', fontSize: 13.5 }}>{user.yearOfStudy || '—'}</td>
                <td style={{ padding: '14px 18px', borderBottom: '1px solid rgba(18,36,53,0.06)', fontSize: 13.5 }}>{user.registrationNumber || '—'}</td>
                <td style={{ padding: '14px 18px', borderBottom: '1px solid rgba(18,36,53,0.06)', fontSize: 13.5 }}>{user.school || '—'}</td>
                <td style={{ padding: '14px 18px', borderBottom: '1px solid rgba(18,36,53,0.06)', fontSize: 13.5 }}>{user.course || '—'}</td>
                <td style={{ padding: '14px 18px', borderBottom: '1px solid rgba(18,36,53,0.06)', fontSize: 13.5 }}>
                  <select value={user.role || 'MEMBER'} onChange={(event) => assignRole(user.id, event.target.value, event.target.value)} style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '7px 8px', color: C.text, background: '#f7fbfe' }}>
                    {(actorRole === 'SYSTEM_ADMIN' ? [ADMIN_ROLE_OPTION, ...ROLE_OPTIONS] : ROLE_OPTIONS).map(([name, label]) => <option key={name} value={name}>{label}</option>)}
                  </select>
                </td>
                <td style={{ padding: '14px 18px', borderBottom: '1px solid rgba(18,36,53,0.06)', fontSize: 13.5 }}>{user.membershipStatus || '—'}</td>
                <td style={{ padding: '14px 18px', borderBottom: '1px solid rgba(18,36,53,0.06)', fontSize: 13.5 }}>{user.registrationFeePaid && user.registrationFeeYear === new Date().getFullYear() ? `Paid KSh ${user.registrationFeeAmount || 100}` : <button type="button" onClick={() => void recordAnnualFee(user)} style={{ border: 'none', borderRadius: 6, padding: '7px 9px', background: C.gold500, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Record KSh 100</button>}</td>
                <td style={{ padding: '14px 18px', borderBottom: '1px solid rgba(18,36,53,0.06)', fontSize: 13.5 }}>
                  {canApprove ? (
                    <button
                      type="button"
                      onClick={() => approve(user.id)}
                      disabled={savingId === user.id}
                      style={{ border: 'none', borderRadius: 8, padding: '9px 12px', background: savingId === user.id ? C.muted : C.gold500, color: '#fff', fontWeight: 700, cursor: savingId === user.id ? 'wait' : 'pointer' }}
                    >
                      {savingId === user.id ? 'Approving...' : 'Approve'}
                    </button>
                  ) : null}
                  <button type="button" onClick={() => removeMember(user.id)} style={{ marginLeft: 8, border: 'none', background: 'transparent', color: '#9b2c2c', cursor: 'pointer', fontSize: 12 }}>Remove</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      </div>
    </div>
  )
}
