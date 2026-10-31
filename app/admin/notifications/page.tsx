import { getServerSession } from 'next-auth/next'
import Link from 'next/link'
import { ArrowLeft, Bell } from 'lucide-react'
import { authOptions } from '@/app/lib/auth'
import { theme } from '@/lib/theme'
import NotificationComposer from './NotificationComposer'

const C = theme
const ALLOWED_ROLES = ['SYSTEM_ADMIN', 'SECRETARY', 'RSL']

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions as any)
  const role = (session as any)?.user?.role

  if (!ALLOWED_ROLES.includes(role)) {
    return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: C.forest950, color: C.text, padding: 24 }}>Access denied</main>
  }

  return (
    <main style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${C.forest950} 0%, ${C.forest900} 100%)`, color: C.text, padding: '32px 24px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1px solid ${C.border}`, paddingBottom: 20, marginBottom: 24 }}>
          <Bell size={22} color={C.gold600} aria-hidden="true" />
          <div>
            <div style={{ color: C.gold600, fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Crew communication</div>
            <h1 style={{ margin: '3px 0 0', fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 500 }}>Notifications</h1>
          </div>
          <Link href="/admin" aria-label="Back to command centre" title="Back to command centre" style={{ display: 'grid', width: 44, height: 44, marginLeft: 'auto', placeItems: 'center', border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, background: '#fff' }}>
            <ArrowLeft size={18} />
          </Link>
        </header>
        <NotificationComposer />
      </div>
    </main>
  )
}