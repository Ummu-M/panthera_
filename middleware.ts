import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_FILE = /\.(.*)$/

const rolePermissions: Record<string, string[]> = {
  PENDING: ['profile'],
  SYSTEM_ADMIN: ['*'],
  MEMBER: ['dashboard', 'profile', 'events'],
  SECRETARY: ['dashboard', 'profile', 'admin', 'admin/users', 'admin/gallery', 'admin/badges'],
  RSL: ['dashboard', 'profile', 'admin', 'admin/users', 'admin/gallery', 'admin/badges', 'admin/treasury', 'admin/inventory'],
  OG: ['events', 'dashboard', 'profile'],
  TREASURER: ['treasury', 'admin/treasury', 'dashboard', 'profile'],
  QUARTERMASTER: ['inventory', 'admin/inventory', 'dashboard', 'profile'],
  DISCIPLINARIAN: ['discipline', 'dashboard', 'profile'],
  CREW_LEADER: ['dashboard', 'reports', 'profile'],
  ASSISTANT_CREW_LEADER: ['dashboard', 'reports', 'profile']
}

function hasAccess(role: string | undefined, pathname: string) {
  if (!role) return false
  const perms = rolePermissions[role]
  if (!perms) return false
  if (perms.includes('*')) return true
  return perms.some((p) => pathname.startsWith(`/${p}`) || pathname === `/`)
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || PUBLIC_FILE.test(pathname)) {
    return NextResponse.next()
  }

  if (pathname === '/' || pathname === '/privacy' || pathname === '/terms' || pathname === '/access-denied') {
    return NextResponse.next()
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const role = (token?.role as string | undefined) || (token ? 'MEMBER' : undefined)

  if (!hasAccess(role, pathname)) {
    const url = req.nextUrl.clone()
    url.pathname = '/access-denied'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/:path*'
}
