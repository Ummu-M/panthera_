'use client'

import { useMemo, useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'

const panelStyle = {
  background: 'rgba(16,24,27,0.9)',
  border: '1px solid rgba(220,176,70,0.2)',
  borderRadius: 24,
  boxShadow: '0 28px 80px rgba(0,0,0,0.45)'
} as const

export default function AuthPage() {
  const { data: session, status } = useSession()
  const [view, setView] = useState<'landing' | 'signin' | 'register'>('landing')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [school, setSchool] = useState('')
  const [course, setCourse] = useState('')
  const [year, setYear] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const isLoggedIn = useMemo(() => status === 'authenticated' && !!session, [session, status])

  const handleCreateAccount = async () => {
    if (!email || !name) {
      setStatusMessage('Please add your name and email to create an account.')
      return
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          phone,
          school,
          course,
          yearOfStudy: year || null,
          registrationNumber
        })
      })

      const data = await response.json()
      if (!response.ok) {
        setStatusMessage(data?.error || 'Could not create your account.')
        return
      }

      setStatusMessage('Account created successfully. You can continue with Google to access your dashboard.')
      setView('landing')
    } catch (error) {
      console.error(error)
      setStatusMessage('Something went wrong while creating your account.')
    }
  }

  if (isLoggedIn) {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'radial-gradient(circle at top, rgba(231,184,74,0.18), transparent 25%), linear-gradient(135deg, #07130f 0%, #0b1d1a 100%)', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 470, ...panelStyle, padding: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ width: 84, height: 84, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(231,184,74,0.7)', boxShadow: '0 0 0 6px rgba(231,184,74,0.08)' }}>
              <img src="/pantheralogo.png" alt="Panthera" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ marginTop: 14, fontSize: 12, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#e7b84a', fontWeight: 800 }}>Panthera</div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#b7c7c3', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Signed in as</div>
            <div style={{ fontWeight: 700, color: '#f4f7f7', fontSize: 18 }}>{session?.user?.name || 'Member'}</div>
            <div style={{ color: '#c5d0ce', marginTop: 4 }}>{session?.user?.email}</div>
            <div style={{ marginTop: 12, color: '#e7b84a', fontWeight: 700 }}>Role: {String((session as any)?.user?.role || 'MEMBER')}</div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{
                width: '100%',
                border: 'none',
                background: 'linear-gradient(135deg, #f3cc6d, #d9a93a)',
                color: '#0c1715',
                borderRadius: 12,
                padding: '14px 16px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Open dashboard
            </button>

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              style={{
                width: '100%',
                border: '1px solid rgba(231,184,74,0.5)',
                background: 'rgba(231,184,74,0.04)',
                color: '#f2f5f4',
                borderRadius: 12,
                padding: '14px 16px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (view === 'signin') {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'radial-gradient(circle at top, rgba(231,184,74,0.18), transparent 25%), linear-gradient(135deg, #07130f 0%, #0b1d1a 100%)', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 470, ...panelStyle, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <button onClick={() => setView('landing')} style={{ border: 'none', background: 'transparent', color: '#dfe8e4', fontSize: 22, cursor: 'pointer' }}>←</button>
            <div style={{ fontWeight: 800, color: '#e7b84a', letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: 11 }}>Panthera</div>
          </div>

          <h1 style={{ margin: '0 0 8px', fontSize: 30, color: '#f5f6f5', fontWeight: 800 }}>Sign in</h1>
          <p style={{ margin: '0 0 18px', color: '#c6d2d0', lineHeight: 1.6 }}>Use your Google account or continue with your email.</p>

          <div style={{ display: 'grid', gap: 12 }}>
            <button
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
              style={{
                width: '100%',
                border: 'none',
                background: 'linear-gradient(135deg, #f3cc6d, #d9a93a)',
                color: '#0c1715',
                borderRadius: 12,
                padding: '16px 18px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Continue with Google
            </button>

            <div style={{ color: '#a8b6b3', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', textAlign: 'center', margin: '6px 0' }}>or</div>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px', color: '#f0f7f5', outline: 'none' }}
            />

            <button
              onClick={() => {
                if (!email.trim()) {
                  setStatusMessage('Please enter your email first.')
                  return
                }
                setStatusMessage('Use the Google sign-in for full access. Or create an account below.')
              }}
              style={{
                width: '100%',
                border: '1px solid rgba(231,184,74,0.5)',
                background: 'rgba(231,184,74,0.04)',
                color: '#f2f5f4',
                borderRadius: 12,
                padding: '14px 16px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Continue with email
            </button>

            <button
              onClick={() => setView('register')}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                color: '#e7b84a',
                borderRadius: 12,
                padding: '12px 16px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Create account
            </button>
          </div>

          {statusMessage ? <div style={{ marginTop: 16, color: '#f7d9a0', fontSize: 13 }}>{statusMessage}</div> : null}
        </div>
      </main>
    )
  }

  if (view === 'register') {
    return (
      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'radial-gradient(circle at top, rgba(231,184,74,0.18), transparent 25%), linear-gradient(135deg, #07130f 0%, #0b1d1a 100%)', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 520, ...panelStyle, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <button onClick={() => setView('signin')} style={{ border: 'none', background: 'transparent', color: '#dfe8e4', fontSize: 22, cursor: 'pointer' }}>←</button>
            <div style={{ fontWeight: 800, color: '#e7b84a', letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: 11 }}>Panthera</div>
          </div>

          <h1 style={{ margin: '0 0 8px', fontSize: 30, color: '#f5f6f5', fontWeight: 800 }}>Create account</h1>
          <p style={{ margin: '0 0 18px', color: '#c6d2d0', lineHeight: 1.6 }}>Join the Panthera Rover Crew. A crew leader will verify your details and activate your membership.</p>

          <div style={{ display: 'grid', gap: 12 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px', color: '#f0f7f5', outline: 'none' }} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" type="email" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px', color: '#f0f7f5', outline: 'none' }} />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" type="tel" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px', color: '#f0f7f5', outline: 'none' }} />
            <input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="Registration number" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px', color: '#f0f7f5', outline: 'none' }} />
            <input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="School / institution" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px', color: '#f0f7f5', outline: 'none' }} />
            <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="Course / programme" style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px', color: '#f0f7f5', outline: 'none' }} />
            <select value={year} onChange={(e) => setYear(e.target.value)} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px', color: '#f0f7f5', outline: 'none' }}>
              <option value="" style={{ color: '#0d1715' }}>Select year of study</option>
              <option value="1" style={{ color: '#0d1715' }}>1st Year</option>
              <option value="2" style={{ color: '#0d1715' }}>2nd Year</option>
              <option value="3" style={{ color: '#0d1715' }}>3rd Year</option>
              <option value="4" style={{ color: '#0d1715' }}>4th Year</option>
              <option value="5" style={{ color: '#0d1715' }}>Postgraduate</option>
            </select>

            <button
              onClick={handleCreateAccount}
              style={{
                width: '100%',
                border: 'none',
                background: 'linear-gradient(135deg, #f3cc6d, #d9a93a)',
                color: '#0c1715',
                borderRadius: 12,
                padding: '16px 18px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Submit registration
            </button>
          </div>

          {statusMessage ? <div style={{ marginTop: 16, color: '#f7d9a0', fontSize: 13 }}>{statusMessage}</div> : null}
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, rgba(231,184,74,0.18), transparent 25%), linear-gradient(135deg, #07130f 0%, #0b1d1a 100%)', color: '#edf2ef', padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '18px 10px 30px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(231,184,74,0.7)' }}>
              <img src="/pantheralogo.png" alt="Panthera Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#e7b84a', fontSize: 12 }}>Panthera</div>
              <div style={{ fontWeight: 700, fontSize: 20 }}>Rover Crew</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => setView('signin')} style={{ border: '1px solid rgba(231,184,74,0.5)', background: 'rgba(231,184,74,0.04)', color: '#f2f5f4', borderRadius: 12, padding: '12px 16px', fontWeight: 700, cursor: 'pointer' }}>Sign in</button>
            <button onClick={() => setView('register')} style={{ border: 'none', background: 'linear-gradient(135deg, #f3cc6d, #d9a93a)', color: '#0c1715', borderRadius: 12, padding: '12px 16px', fontWeight: 800, cursor: 'pointer' }}>Join the crew</button>
          </div>
        </header>

        <section style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24, alignItems: 'center', paddingBottom: 30 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.22em', color: '#e7b84a', textTransform: 'uppercase', fontWeight: 800, marginBottom: 12 }}>Kenyatta University Scout Crew</div>
            <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(2.3rem, 5vw, 4.3rem)', lineHeight: 1.05, color: '#f7f7f5' }}>Scouting for the young and the young at heart.</h1>
            <p style={{ margin: '0 0 24px', maxWidth: 620, fontSize: 18, lineHeight: 1.7, color: '#cfdbd8' }}>
              Panthera Rover Crew empowers young people through adventure, leadership, service, and lifelong friendships rooted in the Scout movement.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => signIn('google', { callbackUrl: '/dashboard' })} style={{ border: 'none', background: 'linear-gradient(135deg, #f3cc6d, #d9a93a)', color: '#0c1715', borderRadius: 12, padding: '16px 22px', fontWeight: 800, cursor: 'pointer' }}>Continue with Google</button>
              <button onClick={() => setView('register')} style={{ border: '1px solid rgba(231,184,74,0.5)', background: 'rgba(231,184,74,0.04)', color: '#f2f5f4', borderRadius: 12, padding: '16px 22px', fontWeight: 700, cursor: 'pointer' }}>Create account</button>
            </div>
          </div>

          <div style={{ ...panelStyle, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 58, height: 58, borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(231,184,74,0.7)' }}>
                <img src="/pantheralogo.png" alt="Panthera" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontWeight: 900, fontSize: 19, color: '#e7b84a' }}>PANTHERA</div>
                <div style={{ fontSize: 11, letterSpacing: '0.14em', color: '#b9c6c2', textTransform: 'uppercase' }}>Rover Crew • Kenya</div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {[
                ['51+', 'Active members'],
                ['6+', 'Years of service'],
                ['10+', 'Community initiatives'],
                ['24/7', 'Crew support']
              ].map(([value, label]) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#e7b84a' }}>{value}</div>
                  <div style={{ color: '#dbe5e3', fontSize: 13 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, paddingBottom: 18 }}>
          {[
            ['Who we are', 'Panthera is a Rover Crew built on service, adventure, leadership, and mentorship.'],
            ['What we do', 'We run volunteer projects, trainings, expeditions, and community outreach.'],
            ['Why join us', 'We create a space to grow, lead, serve, and make lasting friendships.']
          ].map(([title, text]) => (
            <div key={title} style={{ ...panelStyle, padding: 20 }}>
              <div style={{ color: '#e7b84a', fontWeight: 800, marginBottom: 8 }}>{title}</div>
              <div style={{ color: '#d7e1df', lineHeight: 1.7 }}>{text}</div>
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
