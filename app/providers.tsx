'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'
import { ReactNode } from 'react'
import CrewAlertProvider from './components/CrewAlertProvider'

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service worker registration failed', error)
      })
    }
  }, [])

  return <SessionProvider><CrewAlertProvider>{children}</CrewAlertProvider></SessionProvider>
}
