'use client'

import { useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { Home, Calendar, Star, User, Compass, BookOpen, Wrench, Stethoscope, Heart, Globe, Handshake, Apple, Smile, Users, Activity, AlertCircle, Droplet, Code, Leaf, CalendarDays, BadgeCheck, Clock3, MapPin, ArrowRight, PartyPopper, LogOut } from 'lucide-react'
import { theme } from '@/lib/theme'
import { MAX_REPORT_FILE_SIZE_BYTES } from '@/lib/security'
import PushNotificationSettings from '@/app/components/PushNotificationSettings'
import { badgeProgressLabel, isBadgeProgressStatus, resolveBadgeProgressStatus, type BadgeProgressStatus } from '@/lib/badge-progress'
import { useCrewAlert } from '@/app/components/CrewAlertProvider'

const C = theme

type CrewEvent = {
  id: string
  title: string
  tag: string | null
  description: string | null
  startAt: string
  endAt: string
}

function StatCard({
  icon: Icon,
  label,
  value,
  caption,
  action
}: {
  icon: typeof CalendarDays
  label: string
  value: string | number
  caption: string
  action?: { label: string; onClick: () => void }
}) {
  return (
    <article className="member-stat-card">
      <span className="member-stat-icon"><Icon size={20} aria-hidden="true" /></span>
      <span className="member-stat-label">{label}</span>
      <span className="member-stat-value">{value}</span>
      <span className="member-stat-caption">{caption}</span>
      {action ? (
        <button type="button" className="member-stat-action" onClick={action.onClick}>
          {action.label}<ArrowRight size={14} aria-hidden="true" />
        </button>
      ) : null}
    </article>
  )
}

function formatEventDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Date to be confirmed'
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Africa/Nairobi'
  }).format(date)
}

function formatEventTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Africa/Nairobi'
  }).format(date)
}

function EventCard({ event }: { event: CrewEvent }) {
  const subject = encodeURIComponent(`RSVP: ${event.title}`)
  const body = encodeURIComponent(`Hello Panthera Rover Crew,\n\nI would like to RSVP for ${event.title} on ${formatEventDate(event.startAt)}.\n\nName:\n`)
  return (
    <article className="member-event-card">
      <div className="member-event-date-icon"><CalendarDays size={19} aria-hidden="true" /></div>
      <div className="member-event-content">
        <div className="member-event-meta">
          <span>{formatEventDate(event.startAt)}</span>
          {formatEventTime(event.startAt) ? <span>{formatEventTime(event.startAt)}</span> : null}
          {event.tag ? <span className="member-event-tag">{event.tag}</span> : null}
        </div>
        <h3>{event.title}</h3>
        <p className="member-event-place"><MapPin size={14} aria-hidden="true" />Location to be confirmed</p>
        {event.description ? <p className="member-event-description">{event.description}</p> : null}
        <a className="member-event-rsvp" href={`mailto:kupantherascouts@gmail.com?subject=${subject}&body=${body}`}>
          RSVP by email<ArrowRight size={15} aria-hidden="true" />
        </a>
      </div>
    </article>
  )
}

function BadgeProgressCard({
  badge,
  onOpenBadges
}: {
  badge: any
  onOpenBadges: () => void
}) {
  const status = resolveBadgeProgressStatus(badge.progressStatus, badge.status)
  const progress = status === 'COMPLETED' ? 100 : status === 'IN_PROGRESS' ? 50 : 0
  return (
    <article className="member-progress-card">
      <div className="member-progress-heading">
        <span className="member-progress-icon"><BadgeCheck size={18} aria-hidden="true" /></span>
        <div>
          <h3>{badge.badgeName}</h3>
          <span>{badgeProgressLabel(status)}</span>
        </div>
        <button type="button" className="member-progress-edit" onClick={onOpenBadges}>Update</button>
      </div>
      <div className="member-progress-track" role="progressbar" aria-label={`${badge.badgeName} progress`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <span style={{ width: `${progress}%` }} />
      </div>
    </article>
  )
}

function SectionHeading({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="member-section-heading">
      <h2>{title}</h2>
      {action && onAction ? <button type="button" onClick={onAction}>{action}<ArrowRight size={15} aria-hidden="true" /></button> : null}
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
  const { showAlert } = useCrewAlert()
  const [tab, setTab] = useState('home')
  const [badges, setBadges] = useState<any[]>([])
  const [badgesLoading, setBadgesLoading] = useState(true)
  const [savingBadge, setSavingBadge] = useState<string | null>(null)
  const [events, setEvents] = useState<CrewEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)

  useEffect(() => {
    const readTabFromUrl = () => {
      const requestedTab = new URLSearchParams(window.location.search).get('tab')
      setTab(['home', 'events', 'badges', 'profile'].includes(requestedTab || '') ? requestedTab || 'home' : 'home')
    }
    const selectTabFromNavigation = (event: Event) => {
      if (!(event instanceof CustomEvent) || typeof event.detail !== 'string') return
      const requestedTab: string = event.detail
      if (['home', 'events', 'badges', 'profile'].includes(requestedTab)) setTab(requestedTab)
    }
    readTabFromUrl()
    window.addEventListener('popstate', readTabFromUrl)
    window.addEventListener('panthera-member-tab-change', selectTabFromNavigation)
    return () => {
      window.removeEventListener('popstate', readTabFromUrl)
      window.removeEventListener('panthera-member-tab-change', selectTabFromNavigation)
    }
  }, [])

  const changeTab = (nextTab: string) => {
    setTab(nextTab)
    const url = new URL(window.location.href)
    if (nextTab === 'home') url.searchParams.delete('tab')
    else url.searchParams.set('tab', nextTab)
    window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`)
  }

  useEffect(() => {
    const loadBadges = async () => {
      try {
        const response = await fetch('/api/badges')
        const data = await response.json()
        if (!response.ok) throw new Error('Badge progress request failed.')
        setBadges(Array.isArray(data) ? data : [])
      } catch {
        showAlert("Couldn't load badge progress. Try again.", 'error')
      } finally {
        setBadgesLoading(false)
      }
    }

    void loadBadges()
  }, [showAlert])

  useEffect(() => {
    let active = true
    const loadEvents = async () => {
      try {
        const response = await fetch('/api/events')
        const data = await response.json()
        if (!response.ok) throw new Error('Events request failed.')
        if (active) setEvents(Array.isArray(data) ? data : [])
      } catch {
        if (active) showAlert("Couldn't load upcoming events. Try again.", 'error')
      } finally {
        if (active) setEventsLoading(false)
      }
    }

    void loadEvents()
    return () => { active = false }
  }, [showAlert])

  const saveBadgeProgress = async (badgeName: string, category: string, progressStatus: BadgeProgressStatus, file?: File) => {
    setSavingBadge(badgeName)
    try {
      let reportUrl: string | undefined
      if (file) {
        if (file.size > MAX_REPORT_FILE_SIZE_BYTES) throw new Error('Choose a report under 10 MB.')
        reportUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(String(reader.result))
          reader.onerror = () => reject(new Error('Could not read the file.'))
          reader.readAsDataURL(file)
        })
      }
      const response = await fetch('/api/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          badgeName,
          category,
          progressStatus,
          ...(reportUrl ? { reportUrl, reportName: file?.name } : {})
        })
      })
      const data = await response.json()
      if (!response.ok) throw new Error('Badge progress request failed.')
      setBadges((current) => [...current.filter((badge) => badge.badgeName !== badgeName), data])
      showAlert(file ? 'Evidence attached and badge progress saved.' : 'Badge progress saved.', 'success')
    } catch (error) {
      const message = error instanceof Error && error.message === 'Choose a report under 10 MB.'
        ? error.message
        : "Couldn't save badge progress. Try again."
      showAlert(message, 'error')
    } finally {
      setSavingBadge(null)
    }
  }

  const badgeFor = (name: string) => badges.find((item) => item.badgeName === name)
  const badgeStatus = (name: string) => {
    const badge = badgeFor(name)
    return badge ? badgeProgressLabel(badge.progressStatus, badge.status) : 'Not started'
  }

  const badgeControls = (name: string, category: string) => {
    const badge = badgeFor(name)
    const currentStatus = badge
      ? resolveBadgeProgressStatus(badge.progressStatus, badge.status)
      : 'NOT_STARTED'
    const busy = savingBadge === name
    return (
      <div className="badge-progress-controls">
        <label className="badge-progress-select">
          <span>Progress</span>
          <select
            value={currentStatus}
            disabled={savingBadge !== null}
            onChange={(event) => {
              const status = event.currentTarget.value
              if (isBadgeProgressStatus(status)) void saveBadgeProgress(name, category, status)
            }}
          >
            <option value="NOT_STARTED">Not started</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </label>
        <label className="badge-evidence-upload" aria-disabled={savingBadge !== null}>
          <span>{busy ? 'Saving…' : badge?.reportName ? 'Update evidence' : 'Attach evidence'}</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png,image/webp"
            disabled={savingBadge !== null}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0]
              event.currentTarget.value = ''
              if (file) void saveBadgeProgress(name, category, currentStatus, file)
            }}
          />
        </label>
        {badge?.reportName ? <span className="badge-evidence-name">{badge.reportName}</span> : null}
      </div>
    )
  }

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
  const firstName = userName.trim().split(/\s+/)[0] || 'Rover'
  const userRole = (session as any)?.user?.role || 'MEMBER'
  const membershipStatus = (session as any)?.user?.membershipStatus
  const isPendingMember = userRole === 'PENDING' || membershipStatus === 'pending'
  const completedBadges = badges.filter((badge) => resolveBadgeProgressStatus(badge.progressStatus, badge.status) === 'COMPLETED')
  const inProgressBadges = badges.filter((badge) => resolveBadgeProgressStatus(badge.progressStatus, badge.status) === 'IN_PROGRESS')
  const recordedBadges = badges.filter((badge) => resolveBadgeProgressStatus(badge.progressStatus, badge.status) !== 'NOT_STARTED')
  const upcomingEvents = events
    .filter((event) => {
      const start = new Date(event.startAt).getTime()
      return Number.isFinite(start) && start >= Date.now()
    })
    .sort((left, right) => new Date(left.startAt).getTime() - new Date(right.startAt).getTime())
  const visibleEvents = upcomingEvents.slice(0, 3)
  const initials = userName.split(/\s+/).filter(Boolean).slice(0, 2).map((part: string) => part[0]?.toUpperCase()).join('')

  return (
    <main className="member-dashboard-main" style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${C.forest950} 0%, ${C.forest900} 100%)`, color: C.text, padding: '32px 24px', fontFamily: 'var(--font-body)' }}>
      <div className="member-dashboard-content">
        <h1 className="member-dashboard-title">Your crew overview</h1>

        <nav className="member-dashboard-tabs" style={{ display: 'flex', gap: 28, marginBottom: 32, marginTop: 4 }}>
          {[
            { id: 'home', icon: Home, label: 'Overview' },
            { id: 'events', icon: Calendar, label: 'Events' },
            { id: 'badges', icon: Star, label: 'Badges' },
            { id: 'profile', icon: User, label: 'Profile' }
          ].map(({ id, icon: IconComp, label }) => (
            <button
              key={id}
              onClick={() => changeTab(id)}
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
            <section className="member-greeting-card">
              <img className="member-greeting-paw" src="/pantheralogo.png" alt="" aria-hidden="true" />
              <div className="member-greeting-avatar" aria-label={`${userName} initials`}>{initials}</div>
              <div className="member-greeting-copy">
                <span className="member-greeting-eyebrow">Kenyatta University Panthera Rover Crew</span>
                <h2>Welcome, {firstName}</h2>
                <p>Good to have you here. Your crew journey, progress, and next steps are all in one place.</p>
              </div>
              {isPendingMember && (
                <span className="member-status-chip pending">
                  <span aria-hidden="true" />Pending
                </span>
              )}
            </section>

            <section className="member-stats-grid" aria-label="Crew activity summary">
              <StatCard
                icon={CalendarDays}
                label="Upcoming events"
                value={eventsLoading ? '—' : upcomingEvents.length}
                caption={eventsLoading ? 'Finding your next crew activity' : upcomingEvents.length ? 'A chance to learn and serve together' : 'No events scheduled yet'}
                action={!eventsLoading && upcomingEvents.length === 0 ? { label: 'Explore events', onClick: () => changeTab('events') } : undefined}
              />
              <StatCard
                icon={BadgeCheck}
                label="Badges completed"
                value={badgesLoading ? '—' : completedBadges.length}
                caption={badgesLoading ? 'Loading your progress' : completedBadges.length ? 'Great work, keep going' : recordedBadges.length ? 'Your first completion is ahead' : 'No badges yet'}
                action={!badgesLoading && recordedBadges.length === 0 ? { label: 'Start your first badge', onClick: () => changeTab('badges') } : undefined}
              />
              <StatCard
                icon={Clock3}
                label="Badges in progress"
                value={badgesLoading ? '—' : inProgressBadges.length}
                caption={badgesLoading ? 'Loading your progress' : inProgressBadges.length ? 'One step at a time' : 'Your next milestone is waiting'}
                action={!badgesLoading && inProgressBadges.length === 0 ? { label: 'Browse badges', onClick: () => changeTab('badges') } : undefined}
              />
            </section>

            <div className="member-overview-grid">
              <section className="member-dashboard-panel">
                <SectionHeading title="Badge progress" action="All badges" onAction={() => changeTab('badges')} />
                {badgesLoading ? (
                  <div className="member-dashboard-skeleton" aria-label="Loading badge progress"><span /><span /></div>
                ) : inProgressBadges.length ? (
                  <div className="member-progress-list">
                    {inProgressBadges.slice(0, 4).map((badge) => (
                      <BadgeProgressCard key={badge.id} badge={badge} onOpenBadges={() => changeTab('badges')} />
                    ))}
                  </div>
                ) : recordedBadges.length === badges.length && completedBadges.length > 0 ? (
                  <div className="member-dashboard-empty">
                    <span className="member-empty-icon"><PartyPopper size={20} aria-hidden="true" /></span>
                    <div><strong>All caught up</strong><p>You’ve completed your current badges. Pick another to keep learning.</p></div>
                    <button type="button" onClick={() => changeTab('badges')}>Explore badges</button>
                  </div>
                ) : (
                  <div className="member-dashboard-empty">
                    <span className="member-empty-icon"><BadgeCheck size={20} aria-hidden="true" /></span>
                    <div><strong>{badges.length ? 'No badges in progress' : 'No badges yet'}</strong><p>{badges.length ? 'Choose a badge to begin or continue your progress.' : 'Choose a badge and record your first step.'}</p></div>
                    <button type="button" onClick={() => changeTab('badges')}>{badges.length ? 'Browse badges' : 'Start your first badge'}</button>
                  </div>
                )}
              </section>

              <section className="member-dashboard-panel">
                <SectionHeading title="Upcoming events" action="See all" onAction={() => changeTab('events')} />
                {eventsLoading ? (
                  <div className="member-dashboard-skeleton" aria-label="Loading upcoming events"><span /><span /></div>
                ) : visibleEvents.length ? (
                  <div className="member-event-list">
                    {visibleEvents.map((event) => <EventCard key={event.id} event={event} />)}
                  </div>
                ) : (
                  <div className="member-dashboard-empty">
                    <span className="member-empty-icon"><CalendarDays size={20} aria-hidden="true" /></span>
                    <div><strong>No events on the calendar</strong><p>Check back soon for the next crew gathering.</p></div>
                  </div>
                )}
              </section>

              <section className="member-dashboard-panel member-quick-actions">
                <SectionHeading title="Quick actions" />
                <button type="button" className="member-quick-action" onClick={() => window.location.assign('/profile')}>
                  <span className="member-quick-action-icon"><User size={19} aria-hidden="true" /></span>
                  <span><strong>Update profile</strong><small>Keep your crew details current</small></span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
                <button type="button" className="member-quick-action" onClick={() => changeTab('badges')}>
                  <span className="member-quick-action-icon"><BadgeCheck size={19} aria-hidden="true" /></span>
                  <span><strong>Continue badge progress</strong><small>Update a badge or attach evidence</small></span>
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
              </section>
            </div>
          </div>
        )}

        {tab === 'events' && (
          <section className="member-dashboard-panel">
            <SectionHeading title="Upcoming events" />
            {eventsLoading ? <div className="member-dashboard-skeleton" aria-label="Loading upcoming events"><span /><span /></div> : visibleEvents.length ? (
              <div className="member-event-list">{visibleEvents.map((event) => <EventCard key={event.id} event={event} />)}</div>
            ) : <div className="member-dashboard-empty"><span className="member-empty-icon"><CalendarDays size={20} aria-hidden="true" /></span><div><strong>No events on the calendar</strong><p>Check back soon for the next crew gathering.</p></div></div>}
          </section>
        )}

        {tab === 'badges' && (
          <div className="responsive-split-even" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 2 }}>Compulsory</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Update your progress as you work through each badge.</div>
              {compulsoryBadges.map(({ icon, name }) => (
                <div key={name}><BadgeRow icon={icon} name={name} status={badgeStatus(name)} required />{badgeControls(name, 'Compulsory')}</div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.muted, marginBottom: 2 }}>Elective</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 12 }}>Choose your own trail and record your progress.</div>
              {nonCompBadges.map(({ icon, name }) => (
                <div key={name}><BadgeRow icon={icon} name={name} status={badgeStatus(name)} required={false} />{badgeControls(name, 'Elective')}</div>
              ))}
            </div>
          </div>
        )}

        {tab === 'profile' && (
          <div style={{ maxWidth: 520 }}>
            <Row icon={User} label="Name" value={(session as any)?.user?.name || '—'} />
            <Row icon={User} label="Email" value={(session as any)?.user?.email || '—'} />
            {isPendingMember && <Row icon={User} label="Status" value="Pending verification" />}
            <Row icon={Calendar} label="Joined" value="Recently" />
            <PushNotificationSettings />
            <button type="button" className="member-profile-signout" onClick={() => signOut({ callbackUrl: '/' })}>
              <LogOut size={17} aria-hidden="true" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
