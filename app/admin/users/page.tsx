import React from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { prisma } from '@/lib/prisma'
import { theme } from '@/lib/theme'
import UsersTable from './UsersTable'

const C = theme

export default async function UsersPage() {
  const session = await getServerSession(authOptions as any)
  const role = (session as any)?.user?.role

  if (role !== 'SYSTEM_ADMIN' && role !== 'SECRETARY' && role !== 'RSL') {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: C.forest950, color: C.text, padding: 24, fontFamily: 'var(--font-body)' }}>
        <div style={{ maxWidth: 440, background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 16, padding: 30, boxShadow: '0 14px 36px rgba(18,36,53,0.1)' }}>
          Access denied
        </div>
      </main>
    )
  }

  const users = await prisma.user.findMany({ include: { role: true }, orderBy: { createdAt: 'desc' } })

  return (
    <main style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${C.forest950} 0%, ${C.forest900} 100%)`, color: C.text, padding: '32px 24px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/pantheralogo.png" alt="Panthera crest" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 3 }} />
            <div>
              <div style={{ letterSpacing: '0.16em', fontSize: 10.5, color: C.gold500, textTransform: 'uppercase', fontWeight: 600 }}>Kenyatta University Panthera Rover Crew</div>
              <h1 style={{ margin: '2px 0 0', fontSize: 25, fontFamily: 'var(--font-display)', fontWeight: 500 }}>Members</h1>
            </div>
          </div>
        </header>

        <UsersTable initialUsers={users.map((user) => ({
          id: user.id,
          roleId: user.roleId,
          name: user.name,
          email: user.email,
          registrationNumber: user.registrationNumber,
          yearOfStudy: user.yearOfStudy,
          phone: user.phone,
          school: user.school,
          course: user.course,
          role: user.role?.name || null,
          membershipStatus: user.membershipStatus,
          registrationFeePaid: user.registrationFeePaid,
          registrationFeeYear: user.registrationFeeYear,
          registrationFeeAmount: user.registrationFeeAmount
        }))} />
      </div>
    </main>
  )
}
