import { theme } from '@/lib/theme'

export default function TreasuryLoading() {
  return (
    <main aria-label="Loading treasury" aria-busy="true" style={{ minHeight: '100vh', background: theme.forest950, color: theme.text, padding: '32px 24px' }}>
      <div style={{ margin: '0 auto', maxWidth: 1200 }}>
        <div className="admin-skeleton" style={{ height: 72, maxWidth: 460 }} />
        <div className="treasury-stat-grid" style={{ marginTop: 24 }}>
          {[0, 1, 2, 3].map((item) => <div key={item} className="admin-skeleton" style={{ height: item === 0 ? 120 : 96 }} />)}
        </div>
        <div className="admin-skeleton" style={{ height: 260, marginTop: 20 }} />
        <div className="admin-skeleton" style={{ height: 360, marginTop: 20 }} />
      </div>
    </main>
  )
}
