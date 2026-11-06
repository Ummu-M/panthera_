'use client'

import { theme } from '@/lib/theme'

export default function TreasuryError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <main style={{ display: 'grid', minHeight: '60vh', placeItems: 'center', padding: 24 }}>
      <section style={{ background: '#ffffff', border: `1px solid ${theme.border}`, borderRadius: 14, maxWidth: 440, padding: 24, textAlign: 'center' }}>
        <h1 style={{ color: theme.text, fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500, margin: '0 0 8px' }}>Treasury couldn’t load</h1>
        <p style={{ color: theme.muted, fontSize: 14, margin: '0 0 18px' }}>Try again. If the problem continues, contact the crew administrator.</p>
        <button type="button" onClick={retry} style={{ background: theme.gold500, border: 0, borderRadius: 8, color: '#ffffff', cursor: 'pointer', fontWeight: 600, padding: '10px 16px' }}>Try again</button>
      </section>
    </main>
  )
}
