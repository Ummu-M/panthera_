import webpush from 'web-push'
import { prisma } from '@/lib/prisma'

export type PushPayload = {
  title: string
  body: string
  url: string
}

export async function sendPushBroadcast(payload: PushPayload) {
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@panthera.local'

  if (!publicKey || !privateKey) {
    throw new Error('Web Push is not configured. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.')
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)
  const subscriptions = await prisma.pushSubscription.findMany()
  const results = await Promise.all(subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification({
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth }
      }, JSON.stringify(payload))
      return true
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode
      if (statusCode === 404 || statusCode === 410) {
        await prisma.pushSubscription.deleteMany({ where: { id: subscription.id } }).catch(() => undefined)
      }
      return false
    }
  }))

  return {
    sent: results.filter(Boolean).length,
    failed: results.filter((result) => !result).length,
    total: subscriptions.length
  }
}

export function normalizeNotificationUrl(value: unknown) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/'
  try {
    const url = new URL(value, 'https://panthera.invalid')
    if (url.origin !== 'https://panthera.invalid') return '/'
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return '/'
  }
}