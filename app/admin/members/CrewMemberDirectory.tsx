'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BadgeCheck, CalendarDays, ChevronRight, Mail, Minus, Phone, School, UserRound } from 'lucide-react'
import { theme } from '@/lib/theme'

const C = theme

type MemberTag = { id: string; name: string; badgeCount: number }

type MemberDetails = {
  name: string | null
  email: string
  phone: string | null
  registrationNumber: string | null
  school: string | null
  course: string | null
  yearOfStudy: number | null
  membershipStatus: string | null
  dateJoined: string | null
  createdAt: string
  role: { label: string; name: string } | null
}

type UploadedBadge = {
  id: string
  badgeName: string
  category: string
  reportName: string | null
  reportUrl: string | null
  status: string
  completedAt: string
}

type MemberResponse = { member: MemberDetails; badges: UploadedBadge[] }

function Detail({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 0', borderBottom: `1px solid ${C.border}` }}>
      <Icon size={15} color={C.gold600} style={{ marginTop: 2, flexShrink: 0 }} />
      <div>
        <div style={{ color: C.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</div>
        <div style={{ marginTop: 3, fontSize: 13.5 }}>{value}</div>
      </div>
    </div>
  )
}

export default function CrewMemberDirectory({ members, canManageAccounts }: { members: MemberTag[]; canManageAccounts: boolean }) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [details, setDetails] = useState<MemberResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!selectedId) return

    const controller = new AbortController()
    setDetails(null)
    setError('')
    setLoading(true)

    const loadDetails = async () => {
      try {
        const response = await fetch(`/api/leadership/members?memberId=${encodeURIComponent(selectedId)}`, { signal: controller.signal })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.error || 'Unable to load member details.')
        setDetails(data)
      } catch (requestError) {
        if (!controller.signal.aborted) {
          setError(requestError instanceof Error ? requestError.message : 'Unable to load member details.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void loadDetails()
    return () => controller.abort()
  }, [selectedId])

  const selectedMember = members.find((member) => member.id === selectedId)
  const member = details?.member
  const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('')

  return (
    <main style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${C.forest950} 0%, ${C.forest900} 100%)`, color: C.text, padding: '32px 24px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <header style={{ paddingBottom: 20, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ letterSpacing: '.16em', fontSize: 10.5, color: C.gold500, textTransform: 'uppercase', fontWeight: 600 }}>Kenyatta University Panthera Rover Crew</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
            <h1 style={{ margin: '4px 0 0', fontSize: 27, fontFamily: 'var(--font-display)', fontWeight: 500 }}>Members</h1>
            {canManageAccounts ? <Link href="/admin/users" style={{ color: C.gold600, fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}>Manage accounts</Link> : null}
          </div>
          <p style={{ margin: '6px 0 0', color: C.muted, fontSize: 13 }}>Select a member tag to view their details and uploaded badge reports.</p>
        </header>

        <section className="member-directory-panel" aria-label="Approved crew members" style={{ marginTop: 24, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 600 }}>Approved members <span style={{ color: C.muted, fontWeight: 400 }}>({members.length})</span></h2>
          {members.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', gap: 12 }}>
              {members.map((item) => {
                const active = selectedId === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    aria-label={`View ${item.name}, ${item.badgeCount} badge reports`}
                    onClick={() => setSelectedId(active ? null : item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      minHeight: 82,
                      border: `1px solid ${active ? C.gold600 : C.border}`,
                      borderRadius: 12,
                      padding: '13px 15px',
                      background: active ? 'rgba(40,127,186,0.08)' : '#fff',
                      color: C.text,
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: active ? '0 5px 16px rgba(18,36,53,0.08)' : '0 2px 8px rgba(18,36,53,0.04)',
                      transition: 'border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease'
                    }}
                  >
                    <span aria-hidden="true" style={{
                      width: 44,
                      height: 44,
                      flexShrink: 0,
                      display: 'grid',
                      placeItems: 'center',
                      clipPath: 'polygon(50% 0%, 100% 20%, 100% 66%, 50% 100%, 0% 66%, 0% 20%)',
                      background: active ? C.gold500 : 'rgba(40,127,186,0.12)',
                      color: active ? '#fff' : C.gold600,
                      fontSize: 13,
                      fontWeight: 700
                    }}>{initials(item.name)}</span>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13.5, fontWeight: 650 }}>{item.name}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 6, color: C.muted, fontSize: 11.5 }}>
                        <BadgeCheck size={13} color={C.gold600} />
                        {item.badgeCount} report{item.badgeCount === 1 ? '' : 's'}
                      </span>
                    </span>
                    <span aria-hidden="true" style={{ color: C.gold600, display: 'flex' }}>{active ? <Minus size={17} /> : <ChevronRight size={17} />}</span>
                  </button>
                )
              })}
            </div>
          ) : <p style={{ margin: 0, color: C.muted, fontSize: 13 }}>No approved members yet.</p>}
        </section>

        {selectedId && (
          <section aria-live="polite" style={{ marginTop: 18, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
            {loading ? <p style={{ margin: 0, color: C.muted }}>Loading {selectedMember?.name || 'member'}…</p> : null}
            {error ? <p role="alert" style={{ margin: 0, color: '#9b2c2c' }}>{error}</p> : null}
            {member ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${C.border}`, paddingBottom: 14 }}>
                  <UserRound size={20} color={C.gold600} />
                  <div>
                    <h2 style={{ margin: 0, fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 500 }}>{member.name || 'Unnamed member'}</h2>
                    <div style={{ marginTop: 3, color: C.muted, fontSize: 12 }}>{member.role?.label || member.role?.name || 'Member'}</div>
                  </div>
                </div>

                <div className="responsive-split-even" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, marginTop: 12 }}>
                  <div>
                    <h3 style={{ margin: '4px 0', fontSize: 14 }}>Member details</h3>
                    <Detail icon={Mail} label="Email" value={member.email} />
                    <Detail icon={Phone} label="Phone" value={member.phone || 'Not provided'} />
                    <Detail icon={School} label="School / course" value={[member.school, member.course].filter(Boolean).join(' · ') || 'Not provided'} />
                    <Detail icon={School} label="Year of study" value={member.yearOfStudy ? String(member.yearOfStudy) : 'Not provided'} />
                    <Detail icon={UserRound} label="Registration number" value={member.registrationNumber || 'Not provided'} />
                    <Detail icon={CalendarDays} label="Joined" value={new Date(member.dateJoined || member.createdAt).toLocaleDateString()} />
                  </div>

                  <div>
                    <h3 style={{ margin: '4px 0', fontSize: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
                      <BadgeCheck size={16} color={C.gold600} /> Uploaded badge reports ({details.badges.length})
                    </h3>
                    {details.badges.length ? details.badges.map((badge) => (
                      <article key={badge.id} style={{ padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{badge.badgeName}</div>
                            <div style={{ marginTop: 3, color: C.muted, fontSize: 11.5 }}>{badge.category} · {new Date(badge.completedAt).toLocaleDateString()}</div>
                          </div>
                          <span style={{ border: `1px solid ${C.border}`, borderRadius: 999, padding: '3px 8px', color: C.muted, fontSize: 10, whiteSpace: 'nowrap' }}>{badge.status}</span>
                        </div>
                        {badge.reportUrl ? <a href={badge.reportUrl} download={badge.reportName || 'badge-report'} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 8, color: C.gold600, fontSize: 12 }}>{badge.reportName || 'Open uploaded report'}</a> : <div style={{ marginTop: 8, color: C.muted, fontSize: 12 }}>No report file attached</div>}
                      </article>
                    )) : <p style={{ color: C.muted, fontSize: 13 }}>No badge reports uploaded yet.</p>}
                  </div>
                </div>
              </>
            ) : null}
          </section>
        )}
      </div>
    </main>
  )
}
