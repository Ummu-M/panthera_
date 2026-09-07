'use client'

import { useEffect } from 'react'
import { theme } from '@/lib/theme'

const C = theme

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error for debugging in dev and production.
    console.error(error)
  }, [error])

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: `radial-gradient(circle at top, rgba(46,155,236,0.12), transparent 25%), linear-gradient(180deg, ${C.forest950} 0%, ${C.forest900} 100%)`, padding: 24, fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 480, width: '100%', background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 16, padding: 32, boxShadow: '0 20px 60px rgba(18,36,53,0.12)' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: `2px solid ${C.gold500}` }}>
          <img src="/pantheralogo.png" alt="Panthera crest" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ textAlign: 'center', color: C.gold500, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, fontSize: 10.5 }}>Kenyatta University Panthera Rover Crew</div>
        <h2 style={{ textAlign: 'center', color: C.text, margin: '10px 0 8px', fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 500 }}>Something went wrong</h2>
        <p style={{ textAlign: 'center', color: C.muted, lineHeight: 1.6, marginBottom: 22, fontSize: 13.5 }}>
          The app hit an auth or session issue. Please refresh or retry to continue.
        </p>
        <button
          onClick={() => reset()}
          style={{
            width: '100%',
            border: 'none',
            background: `linear-gradient(135deg, ${C.gold500}, ${C.gold600})`,
            color: '#fff',
            borderRadius: 10,
            padding: '13px 16px',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer'
          }}
        >
          Try again
        </button>
      </div>
    </main>
  )
}
