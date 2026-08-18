import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PUBLIC_FILE = /\.(.*)$/

const rolePermissions: Record<string, string[]> = {
  SYSTEM_ADMIN: ['*'],
  MEMBER: ['dashboard', 'profile', 'events'],
  SECRETARY: ['members', 'dashboard', 'reports'],
  OG: ['events', 'dashboard'],
  TREASURER: ['treasury', 'dashboard'],
  QUARTERMASTER: ['inventory', 'dashboard'],
  DISCIPLINARIAN: ['discipline', 'dashboard'],
  CREW_LEADER: ['dashboard', 'reports'],
  ASSISTANT_CREW_LEADER: ['dashboard', 'reports']
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

  if (pathname === '/' || pathname === '/access-denied') {
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
