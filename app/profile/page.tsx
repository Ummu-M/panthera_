import React from 'react'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../lib/auth'
import { prisma } from '@/lib/prisma'
import { theme } from '@/lib/theme'
import ProfileForm from './ProfileForm'

export const dynamic = 'force-dynamic'

const C = theme

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
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: C.forest950, color: C.text, padding: 24, fontFamily: 'var(--font-body)' }}>
        <div style={{ maxWidth: 520, background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 16, padding: 30, boxShadow: '0 14px 36px rgba(18,36,53,0.1)' }}>
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
    <main style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${C.forest950} 0%, ${C.forest900} 100%)`, color: C.text, padding: '32px 24px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
          <img src="/pantheralogo.png" alt="Panthera crest" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 3 }} />
          <div>
            <div style={{ letterSpacing: '0.16em', fontSize: 10.5, color: C.gold500, textTransform: 'uppercase', fontWeight: 600 }}>Kenyatta University Panthera Rover Crew</div>
            <h1 style={{ margin: '2px 0 0', fontSize: 25, fontFamily: 'var(--font-display)', fontWeight: 500 }}>My Profile</h1>
          </div>
        </header>

        {profileWarning && (
          <div style={{ marginTop: 24, border: `1px solid ${C.border}`, background: 'rgba(46,155,236,0.08)', color: C.gold600, borderRadius: 10, padding: 14, lineHeight: 1.5, fontSize: 13.5 }}>
            {profileWarning}
          </div>
        )}
        <ProfileForm profile={{
          name: user?.name || sessionName,
          email: user?.email || email,
          registrationNumber: user?.registrationNumber,
          phone: user?.phone,
          school: user?.school,
          course: user?.course,
          yearOfStudy: user?.yearOfStudy,
          membershipStatus: user?.membershipStatus
        }} />
      </div>
    </main>
  )
}
