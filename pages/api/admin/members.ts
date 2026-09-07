import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/lib/prisma'
import { canAssignRole, isSameOriginRequest } from '@/lib/security'

const ALLOWED_ROLES = ['SYSTEM_ADMIN', 'SECRETARY', 'RSL']

// Rewritten against the real Prisma `User` model. The previous version of
// this file queried tables (scouts, badges, attendance, dues) that were
// never actually created in the database — patrol/rank/attendance/badges
// data was never real. This version only surfaces fields that genuinely
// exist on User: name, email, phone, school, course, yearOfStudy,
// dateJoined, membershipStatus, and registrationFeePaid (used for Dues).
function normalizeMember(user: any) {
  return {
    id: user.id,
    fullName: user.name || 'Unnamed member',
    email: user.email,
    phone: user.phone || '',
    school: user.school || 'Unassigned',
    course: user.course || '',
    yearOfStudy: user.yearOfStudy ?? null,
    joinDate: user.dateJoined || user.createdAt,
    status: (user.membershipStatus || 'pending').toLowerCase(),
    duesStatus: user.registrationFeePaid && user.registrationFeeYear === new Date().getFullYear() ? 'paid' : 'unpaid',
    registrationFeeYear: user.registrationFeeYear,
    registrationFeeAmount: user.registrationFeeAmount,
    role: user.role?.label || user.role?.name || 'Member'
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any)
  const role = (session as any)?.user?.role

  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  if (!ALLOWED_ROLES.includes(role)) return res.status(403).json({ error: 'Forbidden' })

  try {
    if (req.method === 'PATCH') {
      if (!isSameOriginRequest(req.headers.origin, req.headers.host)) return res.status(403).json({ error: 'Cross-origin request blocked' })
      const { id, data } = req.body || {}
      if (!id || !data) return res.status(400).json({ error: 'Missing member id or data' })

      const allowedFields = ['name', 'email', 'phone', 'school', 'course', 'yearOfStudy', 'membershipStatus', 'registrationFeePaid', 'registrationFeeYear', 'registrationFeeAmount', 'registrationFeePaidAt', 'roleId']
      const updateData: Record<string, any> = {}
      for (const key of allowedFields) {
        if (key in data) updateData[key] = data[key]
      }

      if (typeof data.roleId === 'string') {
        if (!canAssignRole(role, data.roleId)) return res.status(403).json({ error: 'Only the system administrator can assign roles' })
        const requestedRole = await prisma.role.findUnique({ where: { name: data.roleId } })
        if (!requestedRole) return res.status(400).json({ error: 'Unknown role' })
        updateData.roleId = requestedRole.id
      }

      const user = await prisma.user.update({
        where: { id: String(id) },
        data: updateData,
        include: { role: true }
      })

      return res.status(200).json({ scout: normalizeMember(user) })
    }

    if (req.method === 'DELETE') {
      if (!isSameOriginRequest(req.headers.origin, req.headers.host)) return res.status(403).json({ error: 'Cross-origin request blocked' })
      const { id } = req.body || {}
      if (!id) return res.status(400).json({ error: 'Member id is required' })
      await prisma.user.delete({ where: { id: String(id) } })
      return res.status(200).json({ ok: true })
    }

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

    const users = await prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: 'desc' }
    })

    const members = users.map(normalizeMember)
    res.status(200).json({ members })
  } catch (err: any) {
    console.error('members api error', err)
    res.status(500).json({ error: err?.message || 'Unable to load members' })
  }
}
