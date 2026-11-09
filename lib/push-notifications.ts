import webpush from 'web-push'
import type { PushSubscription as StoredPushSubscription } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type PushPayload = {
  title: string
  body: string
  url: string
}

export class PushConfigurationError extends Error {
  constructor() {
    super('Web Push configuration is incomplete.')
    this.name = 'PushConfigurationError'
  }
}

function configureWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT
  if (!publicKey || !privateKey || !subject) throw new PushConfigurationError()
  webpush.setVapidDetails(subject, publicKey, privateKey)
}

export function isValidPushEndpoint(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 2048) return false
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

async function sendToSubscription(subscription: StoredPushSubscription, payload: PushPayload) {
  try {
    await webpush.sendNotification({
      endpoint: subscription.endpoint,
      keys: { p256dh: subscription.p256dh, auth: subscription.auth }
    }, JSON.stringify(payload))
    return true
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode
    console.error('web push delivery failed', { subscriptionId: subscription.id, statusCode })
    if (statusCode === 404 || statusCode === 410) {
      try {
        await prisma.pushSubscription.deleteMany({ where: { id: subscription.id } })
      } catch (cleanupError) {
        console.error('expired push subscription cleanup failed', { subscriptionId: subscription.id, error: cleanupError })
      }
    }
    return false
  }
}

export async function sendPushToSubscription(subscription: StoredPushSubscription, payload: PushPayload) {
  configureWebPush()
  const sent = await sendToSubscription(subscription, payload)
  if (!sent) throw new Error('Push delivery failed.')
}

export async function sendPushBroadcast(payload: PushPayload) {
  configureWebPush()
  const subscriptions = await prisma.pushSubscription.findMany()
  const results = await Promise.all(subscriptions.map((subscription) => sendToSubscription(subscription, payload)))

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
