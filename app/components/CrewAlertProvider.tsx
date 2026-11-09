'use client'

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { theme } from '@/lib/theme'

type AlertKind = 'success' | 'error' | 'info'
type AlertMessage = { message: string; kind: AlertKind; href?: string }
type AlertContextValue = { showAlert: (message: string, kind?: AlertKind, href?: string) => void }

const AlertContext = createContext<AlertContextValue | null>(null)

export function useCrewAlert() {
  const context = useContext(AlertContext)
  if (!context) throw new Error('useCrewAlert must be used within CrewAlertProvider')
  return context
}

export default function CrewAlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertMessage | null>(null)
  const showAlert = useCallback((message: string, kind: AlertKind = 'info', href?: string) => {
    setAlert({ message, kind, href })
  }, [])

  useEffect(() => {
    if (!alert) return
    const timer = window.setTimeout(() => setAlert(null), 6500)
    return () => window.clearTimeout(timer)
  }, [alert])

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'PUSH_ALERT' || typeof event.data.title !== 'string') return
      const message = [event.data.title, event.data.body].filter((part) => typeof part === 'string' && part).join(': ')
      const href = typeof event.data.url === 'string' && event.data.url.startsWith('/') && !event.data.url.startsWith('//')
        ? event.data.url
        : undefined
      showAlert(message, 'info', href)
    }
    navigator.serviceWorker.addEventListener('message', onMessage)
    return () => navigator.serviceWorker.removeEventListener('message', onMessage)
  }, [showAlert])

  const colors = {
    success: { background: theme.forest900, border: theme.gold500 },
    error: { background: theme.forest900, border: theme.gold600 },
    info: { background: theme.forest900, border: theme.gold500 }
  }[alert?.kind || 'info']

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <div
          className="crew-alert-banner"
          role="alert"
          aria-live="assertive"
          style={{ borderColor: colors.border }}
        >
          {alert.href ? (
            <Link href={alert.href} onClick={() => setAlert(null)} className="crew-alert-message">
              {alert.message}
            </Link>
          ) : (
            <span className="crew-alert-message">{alert.message}</span>
          )}
          <button type="button" aria-label="Dismiss alert" onClick={() => setAlert(null)}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </AlertContext.Provider>
  )
}
