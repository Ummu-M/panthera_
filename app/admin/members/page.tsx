import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { prisma } from '@/lib/prisma'
import { MEMBER_DIRECTORY_ROLES } from '@/lib/leadership'
import { theme } from '@/lib/theme'
import CrewMemberDirectory from './CrewMemberDirectory'

const C = theme

export default async function MembersDirectoryPage() {
  const session = await getServerSession(authOptions as any)
  const role = (session as any)?.user?.role

  if (!MEMBER_DIRECTORY_ROLES.includes(role)) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: C.forest950, color: C.text, padding: 24 }}>
        Access denied
      </main>
    )
  }

  const members = await prisma.user.findMany({
    where: {
      membershipStatus: { equals: 'approved', mode: 'insensitive' },
      role: { isNot: { name: 'SYSTEM_ADMIN' } }
    },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })
  const badgeCounts = members.length
    ? await prisma.badgeCompletion.groupBy({
        by: ['userId'],
        where: { userId: { in: members.map((member) => member.id) } },
        _count: { _all: true }
      })
    : []
  const badgeCountByMember = new Map(badgeCounts.map((item) => [item.userId, item._count._all]))

  return (
    <CrewMemberDirectory
      members={members.map((member) => ({ id: member.id, name: member.name || 'Unnamed member', badgeCount: badgeCountByMember.get(member.id) || 0 }))}
      canManageAccounts={role === 'SYSTEM_ADMIN' || role === 'SECRETARY' || role === 'RSL'}
    />
  )
}
