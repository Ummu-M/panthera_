import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { normalizeNotificationUrl, sendPushBroadcast } from '@/lib/push-notifications'
import { isSameOriginRequest } from '@/lib/security'

const ALLOWED_ROLES = ['SYSTEM_ADMIN', 'SECRETARY', 'RSL']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const session = await getServerSession(req, res, authOptions as any)
  const role = (session as any)?.user?.role
  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  if (!ALLOWED_ROLES.includes(role)) return res.status(403).json({ error: 'Forbidden' })
  if (!isSameOriginRequest(req.headers.origin, req.headers.host)) return res.status(403).json({ error: 'Cross-origin request blocked.' })

  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : ''
  const body = typeof req.body?.body === 'string' ? req.body.body.trim() : ''
  if (!title || title.length > 80) return res.status(400).json({ error: 'Title is required and must be 80 characters or fewer.' })
  if (!body || body.length > 240) return res.status(400).json({ error: 'Message is required and must be 240 characters or fewer.' })

  try {
    const result = await sendPushBroadcast({ title, body, url: normalizeNotificationUrl(req.body?.url) })
    return res.status(200).json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to send notifications.'
    const status = message.includes('not configured') ? 503 : 500
    console.error('notification broadcast error', error)
    return res.status(status).json({ error: message })
  }
}