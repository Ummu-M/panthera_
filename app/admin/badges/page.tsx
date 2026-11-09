import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { prisma } from '@/lib/prisma'
import { theme } from '@/lib/theme'
import BadgeProgressTable from './BadgeProgressTable'

const C = theme

export default async function BadgesPage() {
  const session = await getServerSession(authOptions as any)
  const role = (session as any)?.user?.role
  if (role !== 'SYSTEM_ADMIN' && role !== 'SECRETARY' && role !== 'RSL') return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: C.forest950, color: C.text }}>Access denied</main>
  const [users, completions] = await Promise.all([
    prisma.user.findMany({ select: { id: true, name: true, email: true }, orderBy: { name: 'asc' } }),
    prisma.badgeCompletion.findMany({ orderBy: { completedAt: 'desc' } })
  ])
  const userMap = new Map(users.map((user) => [user.id, user]))
  return <main style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${C.forest950} 0%, ${C.forest900} 100%)`, color: C.text, padding: '32px 24px', fontFamily: 'var(--font-body)' }}><div style={{ maxWidth: 1200, margin: '0 auto' }}><header style={{ paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}><div style={{ color: C.gold500, fontSize: 12, fontWeight: 600 }}>Kenyatta University Panthera Rover Crew</div><h1 style={{ margin: '4px 0 0', fontSize: 25, fontFamily: 'var(--font-display)', fontWeight: 500 }}>Badge progress</h1><p style={{ color: C.muted, fontSize: 13, margin: '6px 0 0' }}>A read-only view of member progress and submitted evidence.</p></header><BadgeProgressTable initialRecords={completions.map((completion) => ({ ...completion, updatedAt: completion.updatedAt.toISOString(), memberName: userMap.get(completion.userId)?.name || 'Unknown member', memberEmail: userMap.get(completion.userId)?.email || '—' }))} /></div></main>
}
