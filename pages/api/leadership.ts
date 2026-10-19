import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { DEFAULT_LEADERSHIP, LEADERSHIP_EDITOR_ROLES } from '@/lib/leadership'
import { prisma } from '@/lib/prisma'
import { isSameOriginRequest } from '@/lib/security'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const stored = await prisma.crewLeadership.findMany()
      const namesByRole = new Map(stored.map((entry) => [entry.roleKey, entry.name]))
      return res.status(200).json(DEFAULT_LEADERSHIP.map((leader) => ({
        ...leader,
        name: namesByRole.get(leader.roleKey) || leader.name
      })))
    }

    if (req.method !== 'PATCH') {
      res.setHeader('Allow', ['GET', 'PATCH'])
      return res.status(405).json({ error: 'Method not allowed' })
    }

    const session = await getServerSession(req, res, authOptions)
    if (!session) return res.status(401).json({ error: 'Unauthorized' })

    const role = (session.user as any)?.role
    if (!LEADERSHIP_EDITOR_ROLES.includes(role)) return res.status(403).json({ error: 'Only the JSL or Crew Leader can edit the crew roster' })
    if (!isSameOriginRequest(req.headers.origin, req.headers.host)) return res.status(403).json({ error: 'Cross-origin request blocked' })

    const { roleKey, name } = req.body || {}
    const leader = DEFAULT_LEADERSHIP.find((item) => item.roleKey === roleKey)
    const normalizedName = typeof name === 'string' ? name.trim() : ''
    if (!leader) return res.status(400).json({ error: 'Unknown leadership role' })
    if (!normalizedName || normalizedName.length > 100) return res.status(400).json({ error: 'Name must be between 1 and 100 characters' })

    const updated = await prisma.crewLeadership.upsert({
      where: { roleKey },
      create: { roleKey, name: normalizedName },
      update: { name: normalizedName }
    })

    return res.status(200).json({ ...leader, name: updated.name })
  } catch (err) {
    console.error('leadership api error', err)
    return res.status(500).json({ error: 'Unable to load or update the crew roster' })
  }
}