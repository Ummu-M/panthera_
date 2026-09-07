import { theme } from '@/lib/theme'

export default function Loading() {
  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', background: theme.forest950, color: theme.text, padding: 24 }}>
      <div role="status" aria-live="polite" style={{ display: 'grid', justifyItems: 'center', gap: 12, color: theme.muted }}>
        <img src="/pantheralogo.png" alt="Panthera" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
        <span>Loading Panthera...</span>
      </div>
    </main>
  )
}