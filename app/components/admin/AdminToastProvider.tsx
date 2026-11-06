'use client'

import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { theme } from '@/lib/theme'

type ToastKind = 'success' | 'error'

type Toast = {
  id: number
  kind: ToastKind
  message: string
}

type ToastContextValue = {
  notify: (kind: ToastKind, message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function ToastItem({ toast, dismiss }: { toast: Toast; dismiss: (id: number) => void }) {
  useEffect(() => {
    const timeout = window.setTimeout(() => dismiss(toast.id), 4500)
    return () => window.clearTimeout(timeout)
  }, [dismiss, toast.id])

  const isError = toast.kind === 'error'
  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      style={{
        background: '#ffffff',
        border: `1px solid ${theme.border}`,
        borderLeft: `4px solid ${isError ? theme.danger : theme.teal500}`,
        borderRadius: 10,
        boxShadow: '0 10px 30px rgba(18,36,53,0.14)',
        color: theme.text,
        maxWidth: 360,
        padding: '12px 16px'
      }}
    >
      {toast.message}
    </div>
  )
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)

  const notify = useCallback((kind: ToastKind, message: string) => {
    nextId.current += 1
    setToasts((current) => [...current, { id: nextId.current, kind, message }])
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div
        aria-label="Notifications"
        style={{
          bottom: 20,
          display: 'grid',
          gap: 8,
          maxWidth: 'calc(100vw - 32px)',
          position: 'fixed',
          right: 16,
          zIndex: 1000
        }}
      >
        {toasts.map((toast) => <ToastItem key={toast.id} toast={toast} dismiss={dismiss} />)}
      </div>
    </ToastContext.Provider>
  )
}

export function useAdminToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useAdminToast must be used within AdminToastProvider')
  return context
}
