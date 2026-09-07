'use client'

import { SessionProvider } from 'next-auth/react'
import { useEffect } from 'react'
import { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) void navigator.serviceWorker.register('/sw.js')
  }, [])

  return <SessionProvider>{children}</SessionProvider>
}
