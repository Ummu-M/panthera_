import React from 'react'
import Link from 'next/link'
import { BadgeCheck, Boxes, Camera, ClipboardList, Landmark, LayoutDashboard } from 'lucide-react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../lib/auth'
import { prisma } from '@/lib/prisma'
import { theme } from '@/lib/theme'
import UsersTable from './users/UsersTable'
import { CrewCard, CrewEmptyState } from '../components/CrewCard'

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

  const [users, payments, inventory, events] = await Promise.all([
    prisma.user.findMany({ include: { role: true }, orderBy: { createdAt: 'desc' } }),
    prisma.payment.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    prisma.inventoryItem.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    prisma.event.findMany({ orderBy: { createdAt: 'desc' }, take: 8 })
  ])
  const scoutCount = users.filter((user) => user.membershipStatus === 'approved').length
  const treasuryBalance = payments.reduce((total, payment) => total + (payment.type === 'expense' ? -payment.amount : payment.amount), 0)
  const repairCount = inventory.filter((item) => item.condition === 'Needs Repair').length
  const recentActivity = [
    ...payments.map((item) => ({ label: `${item.type === 'expense' ? 'Expense' : 'Income'} recorded: ${item.category}`, date: item.createdAt })),
    ...inventory.map((item) => ({ label: `Inventory added: ${item.name}`, date: item.createdAt })),
    ...events.map((item) => ({ label: `Event created: ${item.title}`, date: item.createdAt }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 8)
  const leadershipRoles = [
    ['SECRETARY', 'Members, reports, and crew records'],
    ['OG', 'Events and crew activities'],
    ['TREASURER', 'Treasury and membership payments'],
    ['QUARTERMASTER', 'Inventory and equipment'],
    ['DISCIPLINARIAN', 'Discipline records'],
    ['CREW_LEADER', 'Crew reports and dashboard'],
    ['ASSISTANT_CREW_LEADER', 'Crew reports and dashboard']
  ]

  return (
    <main style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${C.forest950} 0%, ${C.forest900} 100%)`, color: C.text, padding: '32px 24px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/pantheralogo.png" alt="Panthera crest" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 3 }} />
            <div>
              <div style={{ letterSpacing: '0.16em', fontSize: 10.5, color: C.gold500, textTransform: 'uppercase', fontWeight: 600 }}>Kenyatta University Panthera Rover Crew</div>
              <h1 style={{ margin: '2px 0 0', fontSize: 30, fontFamily: 'var(--font-display)', fontWeight: 500 }}>Command centre</h1>
              <div style={{ marginTop: 5, color: C.muted, fontSize: 13 }}>Crew operations, membership, and resources</div>
            </div>
          </div>
        </header>

        <nav aria-label="Admin workspaces" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: 8, marginTop: 24 }}>
          {[
            { href: '/admin/users', label: 'Members', icon: ClipboardList },
            { href: '/admin/treasury', label: 'Treasury', icon: Landmark },
            { href: '/admin/inventory', label: 'Inventory', icon: Boxes },
            { href: '/admin/gallery', label: 'Gallery', icon: Camera },
            { href: '/admin/badges', label: 'Badges', icon: BadgeCheck },
            { href: '/dashboard', label: 'Member view', icon: LayoutDashboard }
          ].map(({ href, label, icon: Icon }) => <Link key={href} href={href} title={label} style={{ display: 'flex', alignItems: 'center', gap: 9, color: C.text, background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 8, padding: '12px 13px', textDecoration: 'none', fontWeight: 600, fontSize: 13 }}><Icon size={16} color={C.gold600} />{label}</Link>)}
        </nav>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginTop: 28 }}>
          {[
            ['Total scouts', scoutCount],
            ['Treasury balance', `KSh ${treasuryBalance.toLocaleString()}`],
            ['Inventory items', inventory.length],
            ['Needs repair', repairCount]
          ].map(([label, value], index) => <CrewCard key={label} accent={index === 0} style={{ padding: 16 }}><div style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em' }}>{label}</div><div style={{ color: C.text, fontSize: 24, marginTop: 6 }}>{value}</div></CrewCard>)}
        </section>

        <section style={{ background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20, marginTop: 20 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 19, color: C.text, fontFamily: 'var(--font-display)', fontWeight: 500 }}>Recent activity</h2>
          {recentActivity.length === 0 ? <CrewEmptyState>The command centre is ready. Member, treasury, and field activity will appear here as the crew gets moving.</CrewEmptyState> : recentActivity.map((item, index) => <div key={`${item.label}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: index === recentActivity.length - 1 ? 'none' : `1px solid ${C.border}`, fontSize: 13 }}><span>{item.label}</span><span style={{ color: C.muted, whiteSpace: 'nowrap' }}>{item.date.toLocaleDateString()}</span></div>)}
        </section>

        <section style={{ marginTop: 28 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 19, color: C.text, fontFamily: 'var(--font-display)', fontWeight: 500 }}>Leadership workspaces</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
            {leadershipRoles.map(([name, description]) => (
              <div key={name} style={{ background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{name}</div>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 5 }}>{description}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 28 }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 19, color: C.text, fontFamily: 'var(--font-display)', fontWeight: 500 }}>Applications and members</h2>
          <UsersTable actorRole={role} initialUsers={users.map((user) => ({
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
        </section>
      </div>
    </main>
  )
}
