'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Home, User, ShieldCheck, LogOut, Users, WalletCards, Package, Images, BadgeCheck, CalendarDays } from 'lucide-react'
import { theme, shieldClip } from '@/lib/theme'

const C = theme

function initials(name: string) {
  return String(name || 'M')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'M'
}

// Rendered once in the root layout so every page — dashboard, profile,
// admin, admin/users — has the same way back to everywhere else. Without
// this, each page only had whatever links it happened to hardcode, and
// several (profile, admin/users) had none at all.
export default function SiteNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // No session yet, or on the login/landing page: don't show an app nav.
  if (!session || pathname === '/' || pathname?.startsWith('/access-denied')) return null

  const role = (session as any)?.user?.role || 'MEMBER'
  const isAdmin = role === 'SYSTEM_ADMIN' || role === 'SECRETARY' || role === 'RSL'
  const isBadgeReviewer = isAdmin || role === 'RSL'

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    ...(isAdmin ? [
      { href: '/admin', label: 'Admin', icon: ShieldCheck },
      { href: '/admin/users', label: 'Members', icon: Users },
      { href: '/admin/treasury', label: 'Treasury', icon: WalletCards },
      { href: '/admin/inventory', label: 'Inventory', icon: Package },
      { href: '/admin/gallery', label: 'Gallery', icon: Images },
      { href: '/admin/badges', label: 'Badges', icon: BadgeCheck }
    ] : []),
    ...(role === 'TREASURER' ? [{ href: '/admin/treasury', label: 'Treasury', icon: WalletCards }] : []),
    ...(role === 'QUARTERMASTER' ? [{ href: '/admin/inventory', label: 'Inventory', icon: Package }] : []),
    ...(isBadgeReviewer && !isAdmin ? [{ href: '/admin/badges', label: 'Badge reports', icon: BadgeCheck }] : []),
    ...(role === 'OG' ? [{ href: '/', label: 'Events', icon: CalendarDays }] : [])
  ]

  return (
    <div
      className="site-nav"
      style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)',
        borderBottom: `1px solid ${C.border}`,
        padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, minWidth: 0 }}>
        <img src="/pantheralogo.png" alt="Panthera crest" style={{ width: 24, height: 24, objectFit: 'cover', borderRadius: 3 }} />
        <div className="site-nav-links" style={{ display: 'flex', gap: 4, overflowX: 'auto', minWidth: 0, scrollbarWidth: 'thin' }}>
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname?.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 12.5, fontWeight: 500, textDecoration: 'none',
                  padding: '7px 12px', borderRadius: 6,
                  color: active ? theme.forest950 : C.muted,
                  background: active ? theme.gold500 : 'transparent'
                }}
              >
                <Icon size={13} />
                {label}
              </Link>
            )
          })}
        </div>
      </div>
      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            width: 28, height: 28, clipPath: shieldClip,
            background: 'rgba(46,155,236,0.12)', border: `1px solid ${C.border}`,
            color: theme.gold500, fontSize: 11, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', padding: 0
          }}
        >
          {initials((session as any)?.user?.name)}
        </button>

        {menuOpen && (
          <div
            style={{
              position: 'absolute', right: 0, top: 36,
              background: theme.forest850, border: `1px solid ${C.border}`,
              borderRadius: 8, minWidth: 160, overflow: 'hidden',
              boxShadow: '0 12px 32px rgba(0,0,0,0.4)'
            }}
          >
            <div style={{ padding: '10px 12px', borderBottom: `1px solid rgba(18,36,53,0.08)` }}>
              <div style={{ fontSize: 12.5, fontWeight: 500 }}>{(session as any)?.user?.name || 'Member'}</div>
              <div style={{ fontSize: 10.5, color: C.muted, marginTop: 1 }}>{(session as any)?.user?.email}</div>
            </div>
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px', fontSize: 12.5, color: C.text,
                textDecoration: 'none'
              }}
            >
              <User size={13} />
              Profile
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 12px', fontSize: 12.5, color: theme.danger, textAlign: 'left'
              }}
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
