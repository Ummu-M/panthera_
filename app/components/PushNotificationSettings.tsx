'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { theme } from '@/lib/theme'
import { useCrewAlert } from './CrewAlertProvider'

const C = theme

function decodeApplicationServerKey(value: string) {
  const padded = value.padEnd(value.length + (4 - value.length % 4) % 4, '=')
  const binary = window.atob(padded.replace(/-/g, '+').replace(/_/g, '/'))
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes
}

export default function PushNotificationSettings() {
  const { showAlert } = useCrewAlert()
  const [supported, setSupported] = useState<boolean | null>(null)
  const [enabled, setEnabled] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    const checkSubscription = async () => {
      const available = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
      if (!active) return
      setSupported(available)
      if (!available) return

      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        if (!subscription || !active) return
        const response = await fetch(`/api/push/subscriptions?endpoint=${encodeURIComponent(subscription.endpoint)}`)
        const data = await response.json()
        if (active && response.ok) setEnabled(!!data.enabled)
      } catch {
        if (active) showAlert("Couldn't check this device's notification settings. Try again.", 'error')
      }
    }

    void checkSubscription()
    return () => { active = false }
  }, [showAlert])

  const enable = async () => {
    setBusy(true)
    let createdSubscription = false
    try {
      if (Notification.permission === 'denied') throw new Error('blocked')
      const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission()
      if (permission !== 'granted') throw new Error('permission')

      const keyResponse = await fetch('/api/push/public-key')
      const keyData = await keyResponse.json()
      if (!keyResponse.ok || !keyData.publicKey) throw new Error('configuration')

      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeApplicationServerKey(keyData.publicKey)
        })
        createdSubscription = true
      }

      const response = await fetch('/api/push/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON())
      })
      if (!response.ok) throw new Error('save')
      setEnabled(true)
      showAlert('Notifications enabled on this device.', 'success')
    } catch (error) {
      if (createdSubscription) {
        const registration = await navigator.serviceWorker.ready.catch(() => null)
        const subscription = await registration?.pushManager.getSubscription().catch(() => null)
        await subscription?.unsubscribe().catch(() => false)
      }
      const reason = error instanceof Error ? error.message : ''
      const message = reason === 'blocked'
        ? 'Notifications are blocked in your browser settings.'
        : reason === 'permission'
          ? 'Allow notifications in your browser to enable crew updates.'
          : reason === 'configuration'
            ? 'Notifications are temporarily unavailable. Please try again later.'
            : "Couldn't enable notifications. Try again."
      showAlert(message, 'error')
    } finally {
      setBusy(false)
    }
  }

  const disable = async () => {
    setBusy(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        const response = await fetch('/api/push/subscriptions', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        })
        if (!response.ok) throw new Error('remove')
        await subscription.unsubscribe()
      }
      setEnabled(false)
      showAlert('Notifications are off for this device.', 'success')
    } catch {
      showAlert("Couldn't turn off notifications. Try again.", 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section style={{ borderTop: `1px solid ${C.border}`, marginTop: 24, paddingTop: 20 }} aria-labelledby="push-settings-title">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, maxWidth: 350 }}>
          {enabled ? <Bell size={18} color={C.gold600} aria-hidden="true" /> : <BellOff size={18} color={C.muted} aria-hidden="true" />}
          <div>
            <h2 id="push-settings-title" style={{ margin: '0 0 4px', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 500 }}>Crew notifications</h2>
            <p style={{ margin: 0, color: C.muted, fontSize: 12.5, lineHeight: 1.5 }}>
              {supported === false ? 'Push notifications are not supported by this browser.' : 'Get event and crew updates on this device. You can turn them off anytime.'}
            </p>
          </div>
        </div>
        {supported !== false && (
          <button
            type="button"
            onClick={() => void (enabled ? disable() : enable())}
            disabled={busy || supported === null}
            style={{ minHeight: 44, border: `1px solid ${enabled ? C.border : C.gold600}`, borderRadius: 8, padding: '0 14px', background: enabled ? '#fff' : C.gold600, color: enabled ? C.text : '#fff', fontWeight: 600, fontSize: 13, cursor: busy || supported === null ? 'wait' : 'pointer' }}
          >
            {busy ? 'Saving…' : enabled ? 'Turn off' : 'Enable notifications'}
          </button>
        )}
      </div>
    </section>
  )
}
