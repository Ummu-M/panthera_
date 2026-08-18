'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Home, User, Calendar, Star, Clock, Compass, BookOpen, Wrench, Stethoscope, Heart, Globe, Handshake, Apple, Smile, Users, Activity, AlertCircle, Droplet, Code, Leaf, Target } from 'lucide-react'

const C = {
  gold: '#E8B84B',
  dkGold: '#C49A2A',
  dark: '#1E2228',
  panel: '#252B35',
  border: '#353D4A',
  muted: '#8A9BB5',
  text: '#D8DCE5',
  green: '#3DD68C',
  red: '#FF6B6B'
}

const S = {
  card: { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14, marginBottom: 10 }
}

function StatCard({ icon: IconComponent, label, value, color }: any) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 14, padding: '14px 10px', textAlign: 'center', flex: 1 }}>
      <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'center' }}>
        <IconComponent size={24} color={color || C.gold} />
      </div>
      <div style={{ fontWeight: 900, fontSize: 20, color: color || C.gold }}>{value}</div>
      <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 2 }}>{label}</div>
    </div>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [tab, setTab] = useState('home')
  const [badges, setBadges] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [serviceHours, setServiceHours] = useState(0)

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

  return (
    <main style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${C.dark} 0%, #0d1d1b 100%)`, color: C.text, padding: 24 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, padding: '18px 22px', borderRadius: 18, background: 'rgba(16,24,27,0.86)', border: `1px solid rgba(231,184,74,0.18)` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', overflow: 'hidden', border: `2px solid rgba(231,184,74,0.7)` }}>
              <img src="/pantheralogo.png" alt="Panthera" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ letterSpacing: '0.18em', fontSize: 11, color: C.gold, textTransform: 'uppercase', fontWeight: 800 }}>Panthera</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>Crew Dashboard</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div style={{ padding: '8px 12px', borderRadius: 999, background: 'rgba(231,184,74,0.12)', color: '#f5d77d', border: `1px solid rgba(231,184,74,0.2)`, fontWeight: 700 }}>{role}</div>
            <div style={{ fontWeight: 700 }}>{userName}</div>
            {role === 'SYSTEM_ADMIN' && (
              <a href="/admin" style={{ padding: '8px 12px', borderRadius: 999, background: '#e7b84a', color: '#0d1714', textDecoration: 'none', fontWeight: 800 }}>Admin</a>
            )}
          </div>
        </header>

        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, background: 'rgba(8,8,8,.5)', marginBottom: 20 }}>
          {[
            { id: 'home', icon: Home, label: 'Home' },
            { id: 'events', icon: Calendar, label: 'Events' },
            { id: 'badges', icon: Star, label: 'Badges' },
            { id: 'profile', icon: User, label: 'Profile' }
          ].map(({ id, icon: IconComp, label }) => (
            <div key={id} onClick={() => setTab(id)} style={{ flex: 1, textAlign: 'center', padding: '10px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: tab === id ? C.gold : C.muted, borderBottom: tab === id ? `2px solid ${C.gold}` : '2px solid transparent', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <IconComp size={16} style={{ marginRight: 6 }} />
              {label}
            </div>
          ))}
        </div>

        {tab === 'home' && (
          <div>
            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 18, marginBottom: 28 }}>
              <StatCard icon={User} label="Profile" value={userName} />
              <StatCard icon={Calendar} label="Events" value={events.length} />
              <StatCard icon={Star} label="Badges" value={badges.length} color={C.gold} />
              <StatCard icon={Clock} label="Service Hrs" value={serviceHours} color={C.green} />
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 22 }}>
              <div style={{ background: 'rgba(17,24,24,0.86)', border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 22, padding: 24 }}>
                <div style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.gold, marginBottom: 12 }}>Overview</div>
                <h2 style={{ margin: '0 0 12px', fontSize: 28 }}>Welcome, {userName}</h2>
                <p style={{ margin: '0 0 18px', color: '#c1d0ce', lineHeight: 1.7 }}>
                  You are part of the Panthera Rover Crew. Explore your profile, upcoming events, and track your badges and service hours.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
                  {[
                    ['Profile', 'View details'],
                    ['Events', 'Crew activities'],
                    ['Badges', 'Track progress'],
                    ['Service', 'Log hours']
                  ].map(([title, text]) => (
                    <div key={title} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 14, padding: 16 }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
                      <div style={{ color: '#b7c7c3', fontSize: 12 }}>{text}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(17,24,24,0.86)', border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 22, padding: 24 }}>
                <div style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.gold, marginBottom: 12 }}>Quick info</div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
                  {[
                    [<User key="email-icon" size={18} />, 'Email', (session as any)?.user?.email || 'N/A'],
                    [<Users key="role-icon" size={18} />, 'Role', role],
                    [<Target key="status-icon" size={18} />, 'Status', 'Active']
                  ].map(([icon, label, value]) => (
                    <li key={label} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 14, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {icon}
                        {label}
                      </span>
                      <span style={{ fontWeight: 700, color: C.gold }}>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>
        )}

        {tab === 'events' && (
          <div>
            <div style={{ textAlign: 'center', padding: '60px 20px', color: C.muted }}>
              <div style={{ fontSize: 48, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                <Calendar size={48} color={C.gold} />
              </div>
              <div style={{ fontSize: 16 }}>No events scheduled yet</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Check back soon for upcoming crew activities</div>
            </div>
          </div>
        )}

        {tab === 'badges' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
              <div>
                <div style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.gold, marginBottom: 12 }}>Compulsory Badges</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {compulsoryBadges.map(({ icon: IconComp, name }) => (
                    <div key={name} style={{ ...S.card }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <IconComp size={20} color={C.gold} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
                          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Not earned</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.gold, marginBottom: 12 }}>Non-Compulsory Badges</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {nonCompBadges.map(({ icon: IconComp, name }) => (
                    <div key={name} style={{ ...S.card }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <IconComp size={20} color={C.gold} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
                          <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Available</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div>
            <div style={{ background: 'rgba(17,24,24,0.86)', border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 22, padding: 28 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18 }}>
                {[
                  [User, 'Name', (session as any)?.user?.name || '—'],
                  [User, 'Email', (session as any)?.user?.email || '—'],
                  [Users, 'Role', role],
                  [Target, 'Status', 'Active Member'],
                  [Calendar, 'Joined', 'Recently'],
                  [Clock, 'Service Hours', serviceHours.toString()]
                ].map(([IconComp, label, value]) => {
                  const Icon = IconComp as any
                  return (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ea9a8', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      <Icon size={16} />
                      {label}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{value}</div>
                  </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
