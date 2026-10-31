import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/lib/prisma'
import { isSameOriginRequest } from '@/lib/security'

type SubscriptionInput = {
  endpoint?: unknown
  keys?: { p256dh?: unknown; auth?: unknown }
}

function validEndpoint(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2048) return false
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any)
  const email = (session as any)?.user?.email
  if (!email) return res.status(401).json({ error: 'Sign in to manage push notifications.' })

  const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } })
  if (!user) return res.status(404).json({ error: 'Member account not found.' })

  if (req.method === 'GET') {
    const endpoint = typeof req.query.endpoint === 'string' ? req.query.endpoint : ''
    if (!validEndpoint(endpoint)) return res.status(400).json({ error: 'A valid push endpoint is required.' })
    const subscription = await prisma.pushSubscription.findFirst({ where: { endpoint, userId: user.id }, select: { id: true } })
    return res.status(200).json({ enabled: !!subscription })
  }

  if (req.method !== 'POST' && req.method !== 'DELETE') {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
    return res.status(405).json({ error: 'Method not allowed' })
  }
  if (!isSameOriginRequest(req.headers.origin, req.headers.host)) return res.status(403).json({ error: 'Cross-origin request blocked.' })

  if (req.method === 'POST') {
    const subscription = req.body as SubscriptionInput
    const endpoint = subscription?.endpoint
    const p256dh = subscription?.keys?.p256dh
    const auth = subscription?.keys?.auth
    if (!validEndpoint(endpoint) || typeof p256dh !== 'string' || p256dh.length > 256 || typeof auth !== 'string' || auth.length > 256) {
      return res.status(400).json({ error: 'Invalid push subscription.' })
    }

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh, auth, userId: user.id },
      create: { endpoint, p256dh, auth, userId: user.id }
    })
    return res.status(201).json({ enabled: true })
  }

  const endpoint = req.body?.endpoint
  if (!validEndpoint(endpoint)) return res.status(400).json({ error: 'A valid push endpoint is required.' })
  await prisma.pushSubscription.deleteMany({ where: { endpoint, userId: user.id } })
  return res.status(200).json({ enabled: false })
}