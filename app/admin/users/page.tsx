import React from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const session = await getServerSession(authOptions as any)
  const role = (session as any)?.user?.role

  if (role !== 'SYSTEM_ADMIN' && role !== 'SECRETARY') {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#07130f', color: '#edf2ef', padding: 24 }}>
        <div style={{ maxWidth: 440, background: 'rgba(17,24,24,0.86)', border: '1px solid rgba(231,184,74,0.18)', borderRadius: 18, padding: 30 }}>
          Access denied
        </div>
      </main>
    )
  }

  const users = await prisma.user.findMany({ include: { role: true }, orderBy: { createdAt: 'desc' } })

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #07130f 0%, #0f1f1b 100%)', color: '#edf2ef', padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(231,184,74,0.7)' }}>
              <img src="/pantheralogo.png" alt="Panthera" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ letterSpacing: '0.18em', fontSize: 11, color: '#e7b84a', textTransform: 'uppercase', fontWeight: 800 }}>Panthera</div>
              <h1 style={{ margin: 0, fontSize: 30 }}>Members</h1>
            </div>
          </div>
        </header>

        <div style={{ background: 'rgba(17,24,24,0.86)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 22, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', color: '#edf2ef' }}>
            <thead>
              <tr style={{ background: 'rgba(231,184,74,0.08)' }}>
                <th style={{ textAlign: 'left', padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Email</th>
                <th style={{ textAlign: 'left', padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Role</th>
                <th style={{ textAlign: 'left', padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{u.name || '—'}</td>
                  <td style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{u.email}</td>
                  <td style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{u.role?.name || '—'}</td>
                  <td style={{ padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{u.membershipStatus || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
