'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Home, LayoutDashboard, User, LogOut, Users, WalletCards, Package, Images, BadgeCheck, CalendarDays, Menu, X } from 'lucide-react'
import { theme } from '@/lib/theme'
import { MEMBER_DIRECTORY_ROLES } from '@/lib/leadership'

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [memberNavTab, setMemberNavTab] = useState('home')
  const menuRef = useRef<HTMLDivElement>(null)
  const mobileToggleRef = useRef<HTMLButtonElement>(null)
  const mobileDrawerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusable = mobileDrawerRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
    focusable?.[0]?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
        mobileToggleRef.current?.focus()
        return
      }
      if (event.key === 'Tab' && focusable?.length) {
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    setMobileMenuOpen(false)
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const updateMemberTab = () => {
      if (pathname === '/profile') {
        setMemberNavTab('profile')
        return
      }
      const requestedTab = new URLSearchParams(window.location.search).get('tab')
      setMemberNavTab(['events', 'badges', 'profile'].includes(requestedTab || '') ? requestedTab || 'home' : 'home')
    }
    updateMemberTab()
    window.addEventListener('popstate', updateMemberTab)
    return () => window.removeEventListener('popstate', updateMemberTab)
  }, [pathname])

  // No session yet, or on the login/landing page: don't show an app nav.
  if (!session || pathname === '/' || pathname?.startsWith('/access-denied')) return null

  const role = (session as any)?.user?.role || 'MEMBER'
  const isAdmin = role === 'SYSTEM_ADMIN' || role === 'SECRETARY' || role === 'RSL'
  const isBadgeReviewer = isAdmin || role === 'RSL'
  const canViewMemberDirectory = MEMBER_DIRECTORY_ROLES.includes(role)

  const links = [
    ...(!isAdmin ? [{ href: '/dashboard', label: 'Dashboard', icon: Home }] : []),
    ...(isAdmin ? [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/treasury', label: 'Treasury', icon: WalletCards },
      { href: '/admin/inventory', label: 'Inventory', icon: Package },
      { href: '/admin/gallery', label: 'Gallery', icon: Images },
      { href: '/admin/badges', label: 'Badges', icon: BadgeCheck }
    ] : []),
    ...(canViewMemberDirectory ? [{ href: '/admin/members', label: 'Members', icon: Users }] : []),
    ...(role === 'TREASURER' ? [{ href: '/admin/treasury', label: 'Treasury', icon: WalletCards }] : []),
    ...(role === 'QUARTERMASTER' ? [{ href: '/admin/inventory', label: 'Inventory', icon: Package }] : []),
    ...(isBadgeReviewer && !isAdmin ? [{ href: '/admin/badges', label: 'Badge progress', icon: BadgeCheck }] : []),
    ...(role === 'OG' ? [{ href: '/', label: 'Events', icon: CalendarDays }] : [])
  ]
  const mobileMemberLinks = [
    { href: '/dashboard', tab: 'home', label: 'Home', icon: Home },
    { href: '/dashboard?tab=events', tab: 'events', label: 'Events', icon: CalendarDays },
    { href: '/dashboard?tab=badges', tab: 'badges', label: 'Badges', icon: BadgeCheck },
    { href: '/dashboard?tab=profile', tab: 'profile', label: 'Profile', icon: User }
  ]
  const showMemberBottomNav = !isAdmin && (pathname === '/dashboard' || pathname === '/profile')

  return (
    <div className="site-nav-shell">
      <div
        className={showMemberBottomNav ? 'site-nav member-nav-header' : 'site-nav'}
        style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)',
          borderBottom: `1px solid ${C.border}`,
          padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}
      >
      <button
        ref={mobileToggleRef}
        type="button"
        className="site-nav-toggle"
        aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={mobileMenuOpen}
        aria-controls="site-nav-mobile-drawer"
        onClick={() => setMobileMenuOpen((open) => !open)}
      >
        {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
      </button>
      <div className="site-nav-brand-and-links">
        <div className="site-nav-brand">
          <img src="/pantheralogo.png" alt="" />
          <span className="site-nav-brand-name">Panthera Rover Crew</span>
        </div>
        <div className="site-nav-links" style={{ display: 'flex', gap: 4, overflowX: 'auto', minWidth: 0, scrollbarWidth: 'thin' }}>
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && href !== '/admin' && pathname?.startsWith(`${href}/`))
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
      <div ref={menuRef} className="site-nav-account">
        <button
          type="button"
          aria-label="Open account menu"
          aria-expanded={menuOpen}
          className="site-nav-user"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            background: 'rgba(46,155,236,0.12)', border: `1px solid ${C.border}`,
            color: theme.gold600, fontSize: 12, fontWeight: 700,
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
              background: '#fff', border: `1px solid ${C.border}`,
              borderRadius: 12, minWidth: 220, overflow: 'hidden',
              boxShadow: '0 12px 32px rgba(18,36,53,0.16)'
            }}
          >
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{(session as any)?.user?.name || 'Member'}</div>
            <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3, overflowWrap: 'anywhere' }}>{(session as any)?.user?.email}</div>
            </div>
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                minHeight: 44, padding: '10px 16px', fontSize: 13, color: C.text,
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
                minHeight: 44, padding: '10px 16px', fontSize: 13, color: theme.danger, textAlign: 'left'
              }}
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        )}
      </div>
      </div>
      {mobileMenuOpen && <>
        <button
          type="button"
          className="site-nav-drawer-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
        />
        <aside ref={mobileDrawerRef} id="site-nav-mobile-drawer" className="site-nav-drawer" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="site-nav-drawer-brand">
            <img src="/pantheralogo.png" alt="" />
            <div>
              <strong>Panthera Rover Crew</strong>
              <span>Kenyatta University</span>
            </div>
          </div>
          <div className="site-nav-drawer-section-label">Workspace</div>
          <nav className="site-nav-drawer-links">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/dashboard' && href !== '/admin' && pathname?.startsWith(`${href}/`))
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={active ? 'site-nav-drawer-link active' : 'site-nav-drawer-link'}
                >
                  <Icon size={19} aria-hidden="true" />
                  {label}
                </Link>
              )
            })}
          </nav>
          <div className="site-nav-drawer-account">
            <span className="site-nav-drawer-section-label">Account</span>
            <div className="site-nav-drawer-user">
              <span className="site-nav-drawer-avatar">{initials((session as any)?.user?.name)}</span>
              <span className="site-nav-drawer-user-details">
                <strong>{(session as any)?.user?.name || 'Member'}</strong>
                <span>{(session as any)?.user?.email}</span>
              </span>
            </div>
            <Link href="/profile" onClick={() => setMobileMenuOpen(false)} className="site-nav-drawer-link">
              <User size={19} aria-hidden="true" />
              Profile
            </Link>
            <button type="button" className="site-nav-drawer-link sign-out" onClick={() => signOut({ callbackUrl: '/' })}>
              <LogOut size={19} aria-hidden="true" />
              Sign out
            </button>
          </div>
        </aside>
      </>}
      {showMemberBottomNav && (
        <nav className="member-bottom-nav" aria-label="Member navigation">
          {mobileMemberLinks.map(({ href, tab, label, icon: Icon }) => {
            const active = memberNavTab === tab
            return (
              <Link
                key={tab}
                href={href}
                aria-current={active ? 'page' : undefined}
                onClick={(event) => {
                  setMemberNavTab(tab)
                  if (pathname === '/dashboard' && href.startsWith('/dashboard')) {
                    event.preventDefault()
                    const url = new URL(window.location.href)
                    if (tab === 'home') url.searchParams.delete('tab')
                    else url.searchParams.set('tab', tab)
                    window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`)
                    window.dispatchEvent(new CustomEvent('panthera-member-tab-change', { detail: tab }))
                  }
                }}
                className={active ? 'member-bottom-nav-link active' : 'member-bottom-nav-link'}
              >
                <Icon size={19} aria-hidden="true" />
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      )}
    </div>
  )
}
