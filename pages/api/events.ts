import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/lib/prisma'
import { isSameOriginRequest } from '@/lib/security'

const ALLOWED_ROLES = ['SYSTEM_ADMIN', 'SECRETARY', 'RSL', 'OG']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const events = await prisma.event.findMany({ orderBy: { startAt: 'asc' } })
      return res.status(200).json(events)
    }

    // Everything past this point mutates data — require an authenticated
    // admin/secretary session, same rule as the members endpoint.
    const session = await getServerSession(req, res, authOptions as any)
    const role = (session as any)?.user?.role
    if (!session) return res.status(401).json({ error: 'Unauthorized' })
    if (!ALLOWED_ROLES.includes(role)) return res.status(403).json({ error: 'Forbidden' })
    if (!isSameOriginRequest(req.headers.origin, req.headers.host)) return res.status(403).json({ error: 'Cross-origin request blocked' })

    if (req.method === 'POST') {
      const { title, description, tag, startAt, endAt } = req.body || {}
      if (!title || !startAt) return res.status(400).json({ error: 'Title and start date are required' })

      const event = await prisma.event.create({
        data: {
          title,
          description: description || null,
          tag: tag || null,
          startAt: new Date(startAt),
          endAt: new Date(endAt || startAt),
          createdBy: (session as any).user.email
        }
      })
      return res.status(201).json(event)
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const { id, title, description, tag, startAt, endAt } = req.body || {}
      if (!id) return res.status(400).json({ error: 'Event id is required' })
      const event = await prisma.event.update({ where: { id: String(id) }, data: { ...(title !== undefined ? { title: String(title) } : {}), ...(description !== undefined ? { description: description || null } : {}), ...(tag !== undefined ? { tag: tag || null } : {}), ...(startAt !== undefined ? { startAt: new Date(startAt) } : {}), ...(endAt !== undefined ? { endAt: new Date(endAt) } : {}) } })
      return res.status(200).json(event)
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {}
      if (!id) return res.status(400).json({ error: 'Event id is required' })
      await prisma.event.delete({ where: { id } })
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'])
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('events api error', error)
    return res.status(500).json({ error: 'Unable to process events request' })
  }
}
