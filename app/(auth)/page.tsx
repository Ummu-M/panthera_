'use client'

import { useEffect, useMemo, useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import {
  Calendar, Clock, MapPin, Mail, Music2, Users, Shield,
  Plus, Trash2, Tag, Image as ImageIcon, Upload
} from 'lucide-react'
import { FaInstagram } from 'react-icons/fa'
import { theme } from '@/lib/theme'
import { CrewCard, CrewEmptyState, InitialsBadge } from '@/app/components/CrewCard'

const C = theme

// Real crew leadership roster — Kenyatta University Panthera Rover Crew.
const LEADERSHIP = [
  { role: 'Jasiri Scout Leader', name: 'Dr. David Muigai' },
  { role: 'Assistant JSL', name: 'Nicolas Mwangi' },
  { role: 'Crew Leader', name: 'Horas Obutinda' },
  { role: 'Assistant Crew Leader', name: 'Charles Njuguna' },
  { role: 'Quartermaster', name: 'Sharon Juma' },
  { role: 'Scribe', name: 'Sheiline Jerop' },
  { role: 'Organising Secretary', name: 'Justus Kipchirchir' },
  { role: 'Disciplinarian', name: 'Romelse Akoyo' },
  { role: 'Treasurer', name: 'Ummuayman Mohamed' }
]

// Photos are managed entirely from the admin gallery upload form below —
// no static /public images are assumed to exist.

const bgStyle = {
  minHeight: '100vh',
  background: `radial-gradient(circle at top, rgba(46,155,236,0.12), transparent 25%), linear-gradient(180deg, ${C.forest950} 0%, ${C.forest900} 100%)`
} as const

const panelStyle = {
  background: '#ffffff',
  border: `1px solid ${C.border}`,
  borderRadius: 16,
  boxShadow: '0 20px 60px rgba(18,36,53,0.1)'
} as const

const inputStyle = {
  width: '100%',
  background: '#f7fbfe',
  border: `1px solid ${C.border}`,
  borderRadius: 10,
  padding: '13px 15px',
  color: C.text,
  outline: 'none',
  fontFamily: 'inherit',
  fontSize: 14
} as const

const primaryBtn = {
  width: '100%',
  border: 'none',
  background: `linear-gradient(135deg, ${C.gold500}, ${C.gold600})`,
  color: '#fff',
  borderRadius: 10,
  padding: '14px 16px',
  fontWeight: 700,
  fontSize: 14,
  cursor: 'pointer'
} as const

const secondaryBtn = {
  width: '100%',
  border: `1px solid ${C.border}`,
  background: 'rgba(46,155,236,0.06)',
  color: C.text,
  borderRadius: 10,
  padding: '14px 16px',
  fontWeight: 600,
  fontSize: 14,
  cursor: 'pointer'
} as const

export default function AuthPage() {
  const { data: session, status } = useSession()
  const [view, setView] = useState<'landing' | 'signin' | 'join'>('landing')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [school, setSchool] = useState('')
  const [course, setCourse] = useState('')
  const [year, setYear] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  const isLoggedIn = useMemo(() => status === 'authenticated' && !!session, [session, status])
  const role = (session as any)?.user?.role
  const membershipStatus = (session as any)?.user?.membershipStatus || 'not_started'
  const isAdmin = role === 'SYSTEM_ADMIN' || role === 'SECRETARY' || role === 'RSL'
  const canManageEvents = isAdmin || role === 'OG'
  const isPending = role === 'PENDING' || membershipStatus === 'pending'

  // Events — fetched from /api/events, backed by the existing Event model.
  const [events, setEvents] = useState<any[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [eventForm, setEventForm] = useState({ title: '', tag: '', description: '', startAt: '', endAt: '' })
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [eventMsg, setEventMsg] = useState('')

  // Gallery — fetched from /api/gallery, backed by the existing Photo model.
  const [photos, setPhotos] = useState<any[]>([])
  const [photosLoading, setPhotosLoading] = useState(true)
  const [photoCaption, setPhotoCaption] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoMsg, setPhotoMsg] = useState('')

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false))

    fetch('/api/gallery')
      .then((r) => r.json())
      .then((data) => setPhotos(Array.isArray(data) ? data : []))
      .catch(() => setPhotos([]))
      .finally(() => setPhotosLoading(false))
  }, [])

  const addEvent = async () => {
    if (!eventForm.title || !eventForm.startAt) {
      setEventMsg('Title and start date are required.')
      return
    }
    try {
      const res = await fetch('/api/events', {
        method: editingEventId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingEventId ? { id: editingEventId, ...eventForm } : eventForm)
      })
      const data = await res.json()
      if (!res.ok) return setEventMsg(data?.error || 'Could not create event.')
      setEvents((e) => (editingEventId ? e.map((event) => event.id === editingEventId ? data : event) : [...e, data]).sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()))
      setEventForm({ title: '', tag: '', description: '', startAt: '', endAt: '' })
      setEditingEventId(null)
      setEventMsg('Event added.')
    } catch {
      setEventMsg('Something went wrong adding the event.')
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      await fetch('/api/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      setEvents((e) => e.filter((ev) => ev.id !== id))
    } catch {
      setEventMsg('Could not delete that event.')
    }
  }

  const editEvent = (event: any) => {
    setEditingEventId(event.id)
    setEventForm({ title: event.title || '', tag: event.tag || '', description: event.description || '', startAt: String(event.startAt || '').slice(0, 10), endAt: String(event.endAt || '').slice(0, 10) })
  }

  const handlePhotoFile = (file: File | null) => {
    if (!file) return setPhotoPreview(null)
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const addPhoto = async () => {
    if (!photoPreview) {
      setPhotoMsg('Choose an image first.')
      return
    }
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: photoPreview, caption: photoCaption })
      })
      const data = await res.json()
      if (!res.ok) return setPhotoMsg(data?.error || 'Could not upload photo.')
      setPhotos((p) => [data, ...p])
      setPhotoPreview(null)
      setPhotoCaption('')
      setPhotoMsg('Photo added.')
    } catch {
      setPhotoMsg('Something went wrong uploading the photo.')
    }
  }

  const deletePhoto = async (id: string) => {
    try {
      await fetch('/api/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      setPhotos((p) => p.filter((ph) => ph.id !== id))
    } catch {
      setPhotoMsg('Could not delete that photo.')
    }
  }

  const handleCreateAccount = async () => {
    if (!email || !name) {
      setStatusMessage('Please add your name and email to continue.')
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
        setStatusMessage(data?.error || 'Could not submit your registration.')
        return
      }

      setStatusMessage(data?.message || 'Registration submitted successfully. Pending verification.')
      setView('landing')
    } catch (error) {
      console.error(error)
      setStatusMessage('Something went wrong while submitting your registration.')
    }
  }

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email)
    }
    if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [session])

  useEffect(() => {
    if (isLoggedIn && isPending) {
      setView('landing')
    }
    if (isLoggedIn && isAdmin) {
      window.location.href = '/admin'
    }
    if (isLoggedIn && !isAdmin && role !== 'OG' && !isPending) {
      window.location.href = '/dashboard'
    }
  }, [isLoggedIn, isAdmin, isPending, role])

  // Send admins straight to the admin panel right after they land here
  // signed in — members still go to the regular dashboard. Once inside,
  // the top nav lets an admin freely switch back to the member dashboard;
  // this only decides the very first screen after login.
  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      window.location.href = '/admin'
    }
  }, [isLoggedIn, isAdmin])

  if (isLoggedIn && isPending) {
    return (
      <main style={{ ...bgStyle, display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 470, ...panelStyle, padding: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ width: 84, height: 84, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${C.gold500}` }}>
              <img src="/pantheralogo.png" alt="Panthera" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ marginTop: 14, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.gold500, fontWeight: 700 }}>Panthera</div>
          </div>

          <div style={{ background: '#f7fbfe', border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Application status</div>
            <div style={{ fontWeight: 600, color: C.text, fontSize: 18 }}>Pending verification</div>
            <div style={{ color: C.muted, marginTop: 6 }}>{session?.user?.email}</div>
          </div>

          <p style={{ margin: '0 0 18px', color: C.muted, lineHeight: 1.6, fontSize: 14 }}>
            Your crew application is under review. You will gain member access after admin approval.
          </p>

          <div style={{ display: 'grid', gap: 12 }}>
            <button onClick={() => signOut({ callbackUrl: '/' })} style={secondaryBtn}>Sign out</button>
          </div>
        </div>
      </main>
    )
  }

  if (isLoggedIn) {
    return (
      <main style={{ ...bgStyle, display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 470, ...panelStyle, padding: 32 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ width: 84, height: 84, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${C.gold500}` }}>
              <img src="/pantheralogo.png" alt="Panthera" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ marginTop: 14, fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.gold500, fontWeight: 700 }}>Panthera</div>
          </div>

          <div style={{ background: '#f7fbfe', border: `1px solid ${C.border}`, borderRadius: 12, padding: 18, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.12em' }}>Signed in as</div>
            <div style={{ fontWeight: 600, color: C.text, fontSize: 18 }}>{session?.user?.name || 'Member'}</div>
            <div style={{ color: C.muted, marginTop: 4 }}>{session?.user?.email}</div>
          </div>

          <div style={{ display: 'grid', gap: 12 }}>
            <button onClick={() => (window.location.href = isAdmin ? '/admin' : '/dashboard')} style={primaryBtn}>
              {isAdmin ? 'Open admin panel' : 'Open dashboard'}
            </button>
            <button onClick={() => signOut({ callbackUrl: '/' })} style={secondaryBtn}>
              Sign out
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (view === 'signin') {
    return (
      <main style={{ ...bgStyle, display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 470, ...panelStyle, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <button onClick={() => setView('landing')} style={{ border: 'none', background: 'transparent', color: C.muted, fontSize: 22, cursor: 'pointer' }}>←</button>
            <div style={{ fontWeight: 700, color: C.gold500, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 11 }}>Panthera</div>
          </div>

          <h1 style={{ margin: '0 0 8px', fontSize: 28, color: C.text, fontWeight: 500, fontFamily: 'var(--font-display)' }}>Sign in</h1>
          <p style={{ margin: '0 0 18px', color: C.muted, lineHeight: 1.6, fontSize: 14 }}>Use your Google account or continue with your email.</p>

          <div style={{ display: 'grid', gap: 12 }}>
            <button onClick={() => signIn('google', { callbackUrl: '/' })} style={primaryBtn}>
              Continue with Google
            </button>

            <div style={{ color: C.muted, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', textAlign: 'center', margin: '6px 0' }}>or</div>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              style={inputStyle}
            />

            <button
              onClick={() => {
                if (!email.trim()) {
                  setStatusMessage('Please enter your email first.')
                  return
                }
                setStatusMessage('Use the Google sign-in for full access. Or create an account below.')
              }}
              style={secondaryBtn}
            >
              Continue with email
            </button>

            <button onClick={() => signIn('google', { callbackUrl: '/' })} style={{ width: '100%', border: 'none', background: 'transparent', color: C.gold500, borderRadius: 10, padding: '12px 16px', fontWeight: 600, cursor: 'pointer' }}>
              Join crew with Google
            </button>
          </div>

          {statusMessage ? <div style={{ marginTop: 16, color: C.gold600, fontSize: 13 }}>{statusMessage}</div> : null}
        </div>
      </main>
    )
  }

  if (view === 'join') {
    return (
      <main style={{ ...bgStyle, display: 'grid', placeItems: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 620, ...panelStyle, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
            <button onClick={() => setView('landing')} style={{ border: 'none', background: 'transparent', color: C.muted, fontSize: 22, cursor: 'pointer' }}>←</button>
            <div style={{ fontWeight: 700, color: C.gold500, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 11 }}>Panthera</div>
          </div>

          <h1 style={{ margin: '0 0 8px', fontSize: 28, color: C.text, fontWeight: 500, fontFamily: 'var(--font-display)' }}>Join Crew</h1>
          <p style={{ margin: '0 0 18px', color: C.muted, lineHeight: 1.6, fontSize: 14 }}>Use Google to verify your identity. Then complete your Panthera registration and wait for admin review.</p>

          <div style={{ display: 'grid', gap: 12 }}>
            <button onClick={() => signIn('google', { callbackUrl: '/profile' })} style={{ ...primaryBtn, padding: '16px 18px' }}>
              Continue with Google
            </button>

            <div style={{ display: 'grid', gap: 12 }}>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" style={inputStyle} />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="KU email address" type="email" style={inputStyle} />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" type="tel" style={inputStyle} />
              <input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="KU registration / student number" style={inputStyle} />
              <input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="School / faculty" style={inputStyle} />
              <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="Course / programme" style={inputStyle} />
              <select value={year} onChange={(e) => setYear(e.target.value)} style={inputStyle}>
                <option value="">Select year of study</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
                <option value="5">Postgraduate</option>
              </select>

              <button onClick={handleCreateAccount} style={{ ...primaryBtn, padding: '16px 18px' }}>
                Submit registration
              </button>
            </div>
          </div>

          {statusMessage ? <div style={{ marginTop: 16, color: C.gold600, fontSize: 13 }}>{statusMessage}</div> : null}
        </div>
      </main>
    )
  }

  return (
    <main style={{ ...bgStyle, color: C.text, padding: 24 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '18px 10px 30px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${C.gold500}` }}>
              <img src="/pantheralogo.png" alt="Panthera Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#1683d8', fontSize: 11 }}>Panthera</div>
              <div style={{ fontWeight: 500, fontSize: 20, fontFamily: 'var(--font-display)', color: '#000000' }}>Rover Crew</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => setView('signin')} style={{ ...secondaryBtn, width: 'auto', padding: '12px 16px' }}>Sign in</button>
            <button onClick={() => setView('join')} style={{ ...primaryBtn, width: 'auto', padding: '12px 16px' }}>Join Crew</button>
          </div>
        </header>

        {/* Weekly meeting banner */}
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
            background: `linear-gradient(135deg, ${C.gold500}, ${C.gold600})`,
            color: '#fff', borderRadius: 12, padding: '14px 20px', marginBottom: 26
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14 }}>
            <Clock size={16} />
            Every Wednesday from 5:00 PM
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14 }}>
            <MapPin size={16} />
            Kenyatta University, Bishop Square
          </div>
        </div>

        <section className="responsive-split" style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 24, alignItems: 'center', paddingBottom: 30 }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '0.22em', color: C.gold500, textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>Kenyatta University Scout Crew</div>
            <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(2.2rem, 5vw, 3.8rem)', lineHeight: 1.1, color: C.text, fontFamily: 'var(--font-display)', fontWeight: 500 }}>
              Scouting for the young and the young at heart.
            </h1>
            <p style={{ margin: '0 0 24px', maxWidth: 620, fontSize: 17, lineHeight: 1.7, color: C.muted }}>
              Kenyatta University Panthera Rover Crew empowers young people through adventure, leadership, service, and lifelong friendships rooted in the Scout movement.
            </p>

          </div>

          <div style={{ ...panelStyle, padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ position: 'relative', width: 64, height: 64, flexShrink: 0 }}>
                <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: `1px dashed ${C.border}` }} />
                <div style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${C.gold500}` }}>
                  <img src="/pantheralogo.png" alt="Panthera" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 19, color: C.gold500, letterSpacing: '0.02em' }}>PANTHERA</div>
                <div style={{ fontSize: 11, letterSpacing: '0.14em', color: C.muted, textTransform: 'uppercase' }}>Rover Crew &middot; Kenya</div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {[
                ['50+', 'Active Rovers'],
                ['6+', 'Years Active'],
                ['10+', 'Projects']
              ].map(([value, label]) => (
                <div key={label} style={{ background: '#f7fbfe', border: `1px solid ${C.border}`, borderRadius: 10, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 500, color: C.gold500 }}>{value}</div>
                  <div style={{ color: C.text, fontSize: 13 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ paddingBottom: 34 }}>
          <div className="responsive-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.8, color: C.text }}>
              Kenyatta University Panthera Rover Crew is built on service, adventure, leadership, and mentorship. We run volunteer projects, trainings, and expeditions that take Scouting beyond the classroom — and community outreach that puts it to work.
            </p>
            <div style={{ borderLeft: `3px solid ${C.gold500}`, paddingLeft: 20 }}>
              <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: 19, lineHeight: 1.5, color: C.text, fontStyle: 'italic' }}>
                "We create a space to grow, lead, serve, and make lasting friendships."
              </p>
            </div>
          </div>
        </section>

        {/* Leadership & Patrons */}
        <section style={{ paddingBottom: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Shield size={18} color={C.gold500} />
            <h2 style={{ margin: 0, fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 500, color: C.text }}>Crew Leadership &amp; Patrons</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
            {LEADERSHIP.map(({ role, name }) => (
              <CrewCard key={role} accent={role === 'Crew Leader'} style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14, minHeight: role === 'Crew Leader' ? 92 : 76 }}>
                <InitialsBadge name={name} prominent={role === 'Crew Leader'} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5, color: C.text }}>{name}</div>
                  <div style={{ fontSize: 11.5, color: C.muted, marginTop: 1 }}>{role}</div>
                </div>
              </CrewCard>
            ))}
          </div>
        </section>

        {/* Events */}
        <section style={{ paddingBottom: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Calendar size={18} color={C.gold500} />
            <h2 style={{ margin: 0, fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 500, color: C.text }}>Upcoming Events</h2>
          </div>

          {eventsLoading ? (
            <div style={{ color: C.muted, fontSize: 13 }}>Loading events…</div>
          ) : events.length === 0 ? (
            <CrewEmptyState>The trail is quiet for now. New crew gatherings will appear here as soon as they are scheduled.</CrewEmptyState>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: canManageEvents ? 20 : 0 }}>
              {events.map((ev) => (
                <div key={ev.id} style={{ ...panelStyle, padding: 18, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderStyle: 'solid', borderWidth: '0 22px 22px 0', borderColor: `transparent ${C.gold500} transparent transparent`, opacity: 0.85 }} />
                  {ev.tag && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 600, color: C.gold500, background: 'rgba(46,155,236,0.1)', borderRadius: 999, padding: '3px 9px', marginBottom: 8 }}>
                      <Tag size={10} />
                      {ev.tag}
                    </div>
                  )}
                  <div style={{ fontWeight: 600, fontSize: 15, color: C.text, marginBottom: 4 }}>{ev.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: C.muted, marginBottom: 8 }}>
                    <Calendar size={12} />
                    {new Date(ev.startAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  {ev.description && <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{ev.description}</div>}
                  {canManageEvents && (
                    <div style={{ position: 'absolute', top: 14, right: 28, display: 'flex', gap: 8 }}>
                      <button onClick={() => editEvent(ev)} aria-label={`Edit event: ${ev.title}`} title="Edit event" style={{ background: 'none', border: 'none', color: C.gold600, cursor: 'pointer', padding: 0, display: 'flex' }}>✎</button>
                      <button onClick={() => deleteEvent(ev.id)} aria-label={`Delete event: ${ev.title}`} title="Delete event" style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: 0, display: 'flex' }}><Trash2 size={15} /></button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {canManageEvents && (
            <div style={{ ...panelStyle, padding: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>{editingEventId ? 'Edit event' : 'Add an event'}</div>
              <div className="responsive-form" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10 }}>
                <input value={eventForm.title} onChange={(e) => setEventForm((f) => ({ ...f, title: e.target.value }))} placeholder="Event title" style={inputStyle} />
                <input value={eventForm.tag} onChange={(e) => setEventForm((f) => ({ ...f, tag: e.target.value }))} placeholder="Tag (e.g. Camp)" style={inputStyle} />
              </div>
              <div className="responsive-form" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                <input type="date" value={eventForm.startAt} onChange={(e) => setEventForm((f) => ({ ...f, startAt: e.target.value }))} style={inputStyle} />
                <input type="date" value={eventForm.endAt} onChange={(e) => setEventForm((f) => ({ ...f, endAt: e.target.value }))} style={inputStyle} />
              </div>
              <textarea
                value={eventForm.description}
                onChange={(e) => setEventForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Description (optional)"
                rows={2}
                style={{ ...inputStyle, marginBottom: 10, resize: 'vertical' as const }}
              />
              <button onClick={addEvent} style={{ ...primaryBtn, width: 'auto', padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Plus size={14} />
                {editingEventId ? 'Save changes' : 'Add event'}
              </button>
              {eventMsg && <div style={{ marginTop: 10, fontSize: 12.5, color: C.gold600 }}>{eventMsg}</div>}
            </div>
          )}
        </section>

        {/* Photo gallery */}
        <section style={{ paddingBottom: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <ImageIcon size={18} color={C.gold500} />
            <h2 style={{ margin: 0, fontSize: 22, fontFamily: 'var(--font-display)', fontWeight: 500, color: C.text }}>Photo Gallery</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: isAdmin ? 20 : 0 }}>
            {photos.map((photo) => (
              <div key={photo.id} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `1px solid ${C.border}`, aspectRatio: '4 / 3', background: '#f2f9fd' }}>
                <img src={photo.url} alt={photo.caption || 'Panthera Rover Crew'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {photo.caption && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.55), transparent)', color: '#fff', fontSize: 11.5, padding: '16px 10px 8px' }}>
                    {photo.caption}
                  </div>
                )}
                {isAdmin && (
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    aria-label={`Delete photo: ${photo.caption || 'untitled'}`}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', padding: 5, display: 'flex' }}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
            {!photosLoading && photos.length === 0 && (
              <CrewEmptyState>No gallery stories have been shared yet. The first field moment will have a place here.</CrewEmptyState>
            )}
          </div>

          {isAdmin && (
            <div style={{ ...panelStyle, padding: 18 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Add a photo</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <label style={{ ...secondaryBtn, width: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <Upload size={14} />
                  {photoPreview ? 'Change image' : 'Choose image'}
                  <input type="file" accept="image/*" onChange={(e) => handlePhotoFile(e.target.files?.[0] || null)} style={{ display: 'none' }} />
                </label>
                <input value={photoCaption} onChange={(e) => setPhotoCaption(e.target.value)} placeholder="Caption" style={{ ...inputStyle, width: 200 }} />
                <button onClick={addPhoto} style={{ ...primaryBtn, width: 'auto', padding: '13px 18px' }}>Add photo</button>
              </div>
              {photoPreview && (
                <img src={photoPreview} alt="Preview" style={{ marginTop: 12, width: 100, height: 75, objectFit: 'cover', borderRadius: 8, border: `1px solid ${C.border}` }} />
              )}
              {photoMsg && <div style={{ marginTop: 10, fontSize: 12.5, color: C.gold600 }}>{photoMsg}</div>}
            </div>
          )}
        </section>

        {/* Contacts & socials */}
        <section style={{ paddingBottom: 40 }}>
          <div style={{ ...panelStyle, padding: 22, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: C.text }}>Get in touch with Kenyatta University Panthera Rover Crew</div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              <a href="mailto:kupantherascouts@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.gold500, textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
                <Mail size={16} />
                kupantherascouts@gmail.com
              </a>
              <a href="https://www.instagram.com/ku_scouts_panthera?igsh=a29lOHNrdGFpMHp1" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.gold500, textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
                <FaInstagram size={16} />
                Instagram
              </a>
              <a href="https://www.tiktok.com/@kenyatta.universi5?_r=1&_t=ZS-98zH5Ox4n8H" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.gold500, textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
                <Music2 size={16} />
                TikTok
              </a>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginTop: 16, fontSize: 12, color: C.muted }}>
            <a href="/privacy" style={{ color: C.muted, textDecoration: 'none' }}>Privacy Policy</a>
            <a href="/terms" style={{ color: C.muted, textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </section>
      </div>
    </main>
  )
}
