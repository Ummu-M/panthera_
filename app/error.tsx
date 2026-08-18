'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error for debugging in dev and production.
    console.error(error)
  }, [error])

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'radial-gradient(circle at top, rgba(231,184,74,0.18), transparent 25%), linear-gradient(135deg, #07130f 0%, #0b1d1a 100%)', padding: 24 }}>
      <div style={{ maxWidth: 520, width: '100%', background: 'rgba(16,24,27,0.92)', border: '1px solid rgba(231,184,74,0.2)', borderRadius: 24, padding: 32, boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
        <div style={{ width: 76, height: 76, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: '2px solid rgba(231,184,74,0.7)' }}>
          <img src="/pantheralogo.png" alt="Panthera" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ textAlign: 'center', color: '#e7b84a', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 800, fontSize: 11 }}>Panthera</div>
        <h2 style={{ textAlign: 'center', color: '#f4f7f7', margin: '12px 0 8px', fontSize: 28 }}>Something went wrong</h2>
        <p style={{ textAlign: 'center', color: '#c9d4d0', lineHeight: 1.6, marginBottom: 22 }}>
          The app hit an auth or session issue. Please refresh or retry to continue.
        </p>
        <button
          onClick={() => reset()}
          style={{
            width: '100%',
            border: 'none',
            background: 'linear-gradient(135deg, #f3cc6d, #d9a93a)',
            color: '#0c1715',
            borderRadius: 12,
            padding: '14px 16px',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          Try again
        </button>
      </div>
    </main>
  )
}
