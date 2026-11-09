import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/lib/prisma'
import { isSameOriginRequest } from '@/lib/security'
import { isValidPushEndpoint, PushConfigurationError, sendPushToSubscription } from '@/lib/push-notifications'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed.' })
  }

  const session = await getServerSession(req, res, authOptions as any)
  const email = (session as any)?.user?.email
  if (!email) return res.status(401).json({ error: 'Sign in to send a test notification.' })
  if (!isSameOriginRequest(req.headers.origin, req.headers.host)) return res.status(403).json({ error: 'Cross-origin request blocked.' })

  const endpoint = req.body?.endpoint
  if (!isValidPushEndpoint(endpoint)) return res.status(400).json({ error: 'A valid device subscription is required.' })

  try {
    const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } }, select: { id: true } })
    if (!user) return res.status(404).json({ error: 'Member account not found.' })

    const subscription = await prisma.pushSubscription.findFirst({ where: { endpoint, userId: user.id } })
    if (!subscription) return res.status(404).json({ error: 'This device is not registered for notifications.' })

    await sendPushToSubscription(subscription, {
      title: 'Panthera test notification',
      body: 'Push notifications are working on this device.',
      url: '/profile'
    })
    return res.status(200).json({ sent: true })
  } catch (error) {
    console.error('push test notification failed', error)
    const status = error instanceof PushConfigurationError ? 503 : 500
    return res.status(status).json({ error: 'Unable to send a test notification.' })
  }
}
