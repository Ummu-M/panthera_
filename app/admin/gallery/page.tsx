import Link from 'next/link'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { prisma } from '@/lib/prisma'
import { theme } from '@/lib/theme'
import GalleryPanel from './GalleryPanel'

const C = theme

export default async function GalleryPage() {
  const session = await getServerSession(authOptions as any)
  const role = (session as any)?.user?.role
  if (role !== 'SYSTEM_ADMIN' && role !== 'SECRETARY' && role !== 'RSL') return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: C.forest950, color: C.text }}>Access denied</main>
  const photos = await prisma.photo.findMany({ orderBy: { createdAt: 'desc' } })
  return <main style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${C.forest950} 0%, ${C.forest900} 100%)`, color: C.text, padding: '32px 24px', fontFamily: 'var(--font-body)' }}><div style={{ maxWidth: 1200, margin: '0 auto' }}><header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}><div><div style={{ letterSpacing: '.16em', fontSize: 10.5, color: C.gold500, textTransform: 'uppercase', fontWeight: 600 }}>Panthera</div><h1 style={{ margin: '2px 0 0', fontSize: 25, fontFamily: 'var(--font-display)', fontWeight: 500 }}>Gallery</h1></div><Link href="/admin" style={{ color: C.forest950, background: C.gold500, borderRadius: 8, padding: '10px 14px', textDecoration: 'none', fontWeight: 700, fontSize: 13 }}>Back to admin</Link></header><GalleryPanel initialPhotos={photos.map((photo) => ({ id: photo.id, url: photo.url, caption: photo.caption }))} /></div></main>
}
