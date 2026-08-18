import React from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  let session = null
  let profileWarning = ''

  try {
    session = await getServerSession(authOptions as any)
  } catch (err) {
    console.error('profile session error', err)
    profileWarning = 'Your session could not be verified. Please sign in again to view your full profile.'
  }

  const email = (session as any)?.user?.email
  const sessionName = (session as any)?.user?.name

  if (!email) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#07130f', color: '#edf2ef', padding: 24 }}>
        <div style={{ maxWidth: 520, background: 'rgba(17,24,24,0.86)', border: '1px solid rgba(231,184,74,0.18)', borderRadius: 18, padding: 30 }}>
          {profileWarning || 'Please sign in to view your profile.'}
        </div>
      </main>
    )
  }

  let user = null

  try {
    user = await prisma.user.findUnique({ where: { email } })
  } catch (err) {
    console.error('profile lookup error', err)
    profileWarning = 'Profile details are temporarily unavailable. Showing your signed-in account information.'
  }

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #07130f 0%, #0f1f1b 100%)', color: '#edf2ef', padding: 24 }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(231,184,74,0.7)' }}>
            <img src="/pantheralogo.png" alt="Panthera" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ letterSpacing: '0.18em', fontSize: 11, color: '#e7b84a', textTransform: 'uppercase', fontWeight: 800 }}>Panthera</div>
            <h1 style={{ margin: 0, fontSize: 30 }}>My Profile</h1>
          </div>
        </header>

        <section style={{ background: 'rgba(17,24,24,0.86)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 22, padding: 28 }}>
          {profileWarning && (
            <div style={{ marginBottom: 18, border: '1px solid rgba(231,184,74,0.28)', background: 'rgba(231,184,74,0.08)', color: '#f5d77d', borderRadius: 14, padding: 14, lineHeight: 1.5 }}>
              {profileWarning}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
            {[
              ['Name', user?.name || sessionName || '-'],
              ['Email', user?.email || email],
              ['Registration #', user?.registrationNumber || '-'],
              ['Phone', user?.phone || '-'],
              ['School', user?.school || '-'],
              ['Course', user?.course || '-'],
              ['Year of study', user?.yearOfStudy ?? '-'],
              ['Membership status', user?.membershipStatus || '-']
            ].map(([label, value]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 16 }}>
                <div style={{ color: '#9ea9a8', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{value}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
