import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { MEMBER_DIRECTORY_ROLES } from '@/lib/leadership'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions as any)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const role = (session as any)?.user?.role
  if (!MEMBER_DIRECTORY_ROLES.includes(role)) return res.status(403).json({ error: 'Forbidden' })

  const memberId = typeof req.query.memberId === 'string' ? req.query.memberId : ''
  if (!memberId) return res.status(400).json({ error: 'Member id is required' })

  try {
    const member = await prisma.user.findFirst({
      where: {
        id: memberId,
        membershipStatus: { equals: 'approved', mode: 'insensitive' },
        role: { isNot: { name: 'SYSTEM_ADMIN' } }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        registrationNumber: true,
        school: true,
        course: true,
        yearOfStudy: true,
        membershipStatus: true,
        dateJoined: true,
        createdAt: true,
        role: { select: { name: true, label: true } }
      }
    })

    if (!member) return res.status(404).json({ error: 'Approved member not found' })

    const badges = await prisma.badgeCompletion.findMany({
      where: { userId: member.id },
      select: { id: true, badgeName: true, category: true, reportName: true, reportUrl: true, status: true, completedAt: true },
      orderBy: { completedAt: 'desc' }
    })

    return res.status(200).json({ member, badges })
  } catch (error) {
    console.error('leadership members api error', error)
    return res.status(500).json({ error: 'Unable to load member details and badge reports' })
  }
}
