'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Home, Calendar, Star, User, Compass, BookOpen, Wrench, Stethoscope, Heart, Globe, Handshake, Apple, Smile, Users, Activity, AlertCircle, Droplet, Code, Leaf, Target } from 'lucide-react'
import { theme } from '@/lib/theme'

const C = theme

// A single figure in the top register: label above, value in monospace
// below, separated from its neighbors by a hairline rather than a boxed
// card. This is the one recurring idea the page is built around — data
// read like ledger entries, not gamified stat tiles.
function Figure({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ padding: '0 22px', borderLeft: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 500, color: C.text }}>{value}</div>
    </div>
  )
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: `1px solid rgba(18,36,53,0.08)` }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, color: C.muted, fontSize: 13 }}>
        <Icon size={15} />
        {label}
      </span>
      <span style={{ fontWeight: 500, fontSize: 13.5 }}>{value}</span>
    </div>
  )
}

function BadgeRow({ icon: Icon, name, status, required }: { icon: any; name: string; status: string; required: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderBottom: `1px solid rgba(18,36,53,0.08)` }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
        <Icon size={15} color={required ? C.gold500 : C.muted} strokeWidth={1.75} />
        {name}
      </span>
      <span
        style={{
          fontSize: 10.5,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: required ? C.gold500 : C.muted,
          border: `1px solid ${required ? 'rgba(46,155,236,0.4)' : C.border}`,
          borderRadius: 4,
          padding: '3px 8px'
        }}
      >
        {status}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [tab, setTab] = useState('home')
  const [badges, setBadges] = useState<any[]>([])
  const [events] = useState<any[]>([])
  const [serviceHours] = useState(0)

  useEffect(() => {
    fetch('/api/badges').then((response) => response.json()).then((data) => setBadges(Array.isArray(data) ? data : [])).catch(() => setBadges([]))
  }, [])

  const completeBadge = async (badgeName: string, category: string, file: File) => {
    const reportUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
    const response = await fetch('/api/badges', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ badgeName, category, reportUrl, reportName: file.name }) })
    const data = await response.json()
    if (response.ok) setBadges((current) => [...current.filter((badge) => badge.badgeName !== badgeName), data])
  }

  const undoBadge = async (badgeName: string) => {
    const response = await fetch('/api/badges', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ badgeName }) })
    if (response.ok) setBadges((current) => current.filter((badge) => badge.badgeName !== badgeName))
  }

  const badgeStatus = (name: string) => {
    const badge = badges.find((item) => item.badgeName === name)
    if (!badge) return 'Report required'
    if (badge.status === 'APPROVED') return 'Approved'
    if (badge.status === 'REJECTED') return 'Report rejected'
    return 'Awaiting RSL review'
  }

  const reportUpload = (name: string, category: string) => <label style={{ display: 'inline-flex', color: C.gold500, cursor: 'pointer', fontSize: 11, padding: '0 0 10px' }}>
    Upload report
    <input type="file" accept=".pdf,.doc,.docx,image/*" onChange={(event) => { const file = event.target.files?.[0]; if (file) void completeBadge(name, category, file) }} style={{ display: 'none' }} />
  </label>

  const compulsoryBadges = [
    { icon: Compass, name: 'Jasiri Rovermatestar' },
    { icon: Compass, name: 'Jasiri Instructor' },
    { icon: BookOpen, name: 'Jasiri Projectstar' },
    { icon: Wrench, name: 'Jasiri Craftstar' },
    { icon: Stethoscope, name: 'Jasiri First Aider' },
    { icon: Heart, name: 'Jasiri SRH' }
  ]

  const nonCompBadges = [
    { icon: Globe, name: 'Jasiri Afya' },
    { icon: Handshake, name: 'Jasiri Mzalendo' },
    { icon: Apple, name: 'Jasiri Food Security' },
    { icon: Smile, name: 'Jasiri Utamaduni' },
    { icon: Users, name: 'Jasiri PLWD' },
    { icon: AlertCircle, name: 'Jasiri Mountain Rescue' },
    { icon: Activity, name: 'Jasiri Sportsperson' },
    { icon: AlertCircle, name: 'Jasiri Rescue' },
    { icon: Droplet, name: 'Jasiri Lifesaver' },
    { icon: Code, name: 'Jasiri Computerist' },
    { icon: Leaf, name: 'Jasiri Conservation' }
  ]

  const userName = (session as any)?.user?.name || 'Rover'
  const role = (session as any)?.user?.role || 'MEMBER'
  const approvedBadges = badges.filter((badge) => badge.status === 'APPROVED')

  return (
    <main style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${C.forest950} 0%, ${C.forest900} 100%)`, color: C.text, padding: '32px 24px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 1080, margin: '0 auto' }}>

        {/* Masthead — plain, no card chrome, like a letterhead rather than a widget */}
        <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/pantheralogo.png" alt="Panthera crest" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 3 }} />
            <div>
              <div style={{ letterSpacing: '0.16em', fontSize: 10.5, color: C.gold500, textTransform: 'uppercase', fontWeight: 600 }}>
                Kenyatta University Panthera Rover Crew
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 25, fontWeight: 500, marginTop: 2 }}>Member Register</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{userName}</div>
            </div>
          </div>
        </header>

        {/* Nav — underline tabs, no filled backgrounds */}
        <nav style={{ display: 'flex', gap: 28, marginBottom: 32, marginTop: 4 }}>
          {[
            { id: 'home', icon: Home, label: 'Overview' },
            { id: 'events', icon: Calendar, label: 'Events' },
            { id: 'badges', icon: Star, label: 'Badges' },
            { id: 'profile', icon: User, label: 'Profile' }
          ].map(({ id, icon: IconComp, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '4px 0 12px', fontSize: 13, fontWeight: 500,
                color: tab === id ? C.text : C.muted,
                borderBottom: tab === id ? `2px solid ${C.gold500}` : '2px solid transparent'
              }}
            >
              <IconComp size={14} />
              {label}
            </button>
          ))}
        </nav>

        {tab === 'home' && (
          <div>
            <section style={{ display: 'flex', flexWrap: 'wrap', gap: 0, marginBottom: 36, marginLeft: -22 }}>
              <Figure label="Events attended" value={events.length} />
              <Figure label="Badges earned" value={approvedBadges.length} />
              <Figure label="Service hours" value={serviceHours} />
            </section>

            <section className="responsive-split" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 28 }}>
              <div>
                <h2 style={{ margin: '0 0 10px', fontSize: 24, fontWeight: 500 }}>Karibu, {userName}</h2>
                <p style={{ margin: '0 0 22px', color: C.muted, lineHeight: 1.7, fontSize: 14, maxWidth: 480 }}>
                  {approvedBadges.length === 0 && events.length === 0
                    ? 'Nothing recorded yet. Attendance, badge progress, and service hours will appear here as the crew secretary logs them.'
                    : `${events.length} event${events.length === 1 ? '' : 's'} attended and ${approvedBadges.length} badge${approvedBadges.length === 1 ? '' : 's'} earned to date.`}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 1, background: 'rgba(18,36,53,0.08)' }}>
                  {[
                    ['Profile', 'View details'],
                    ['Events', 'Crew activities'],
                    ['Badges', 'Track progress'],
                    ['Service', 'Log hours']
                  ].map(([title, text]) => (
                    <div key={title} style={{ background: C.forest900, padding: '14px 16px' }}>
                      <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 4 }}>{title}</div>
                      <div style={{ color: C.muted, fontSize: 11.5 }}>{text}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 4 }}>Quick info</div>
                <Row icon={User} label="Email" value={(session as any)?.user?.email || 'N/A'} />
                <Row icon={Target} label="Status" value="Active" />
              </div>
            </section>
          </div>
        )}

        {tab === 'events' && (
          <div style={{ padding: '48px 0', color: C.muted, borderTop: `1px solid rgba(18,36,53,0.08)` }}>
            <div style={{ fontSize: 15, color: C.text, marginBottom: 4 }}>Nothing on the trail yet</div>
            <div style={{ fontSize: 13 }}>Crew activities will appear here once they are scheduled.</div>
          </div>
        )}

        {tab === 'badges' && (
          <div className="responsive-split-even" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 2 }}>Compulsory</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Required to advance in rank</div>
              {compulsoryBadges.map(({ icon, name }) => (
                <div key={name}><BadgeRow icon={icon} name={name} status={badgeStatus(name)} required />{badges.some((badge) => badge.badgeName === name && badge.status !== 'REJECTED') ? <button onClick={() => undoBadge(name)} style={{ border: 'none', background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: 11, padding: '0 0 10px' }}>Withdraw report</button> : reportUpload(name, 'Compulsory')}</div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 2 }}>Elective</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Choose your own trail</div>
              {nonCompBadges.map(({ icon, name }) => (
                <div key={name}><BadgeRow icon={icon} name={name} status={badgeStatus(name)} required={false} />{badges.some((badge) => badge.badgeName === name && badge.status !== 'REJECTED') ? <button onClick={() => undoBadge(name)} style={{ border: 'none', background: 'transparent', color: C.muted, cursor: 'pointer', fontSize: 11, padding: '0 0 10px' }}>Withdraw report</button> : reportUpload(name, 'Elective')}</div>
              ))}
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div style={{ maxWidth: 520 }}>
            <Row icon={User} label="Name" value={(session as any)?.user?.name || '—'} />
            <Row icon={User} label="Email" value={(session as any)?.user?.email || '—'} />
            <Row icon={Target} label="Status" value="Active member" />
            <Row icon={Calendar} label="Joined" value="Recently" />
            <Row icon={Star} label="Service hours" value={serviceHours.toString()} />
          </div>
        )}
      </div>
    </main>
  )
}
