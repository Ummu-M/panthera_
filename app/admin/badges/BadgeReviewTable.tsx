'use client'

import { useState } from 'react'
import { theme } from '@/lib/theme'

const C = theme

type Completion = {
  id: string
  badgeName: string
  category: string
  reportUrl: string | null
  reportName: string | null
  status: string
  completedAt: string
  reviewedAt: string | null
  memberName: string
  memberEmail: string
}

export default function BadgeReviewTable({ initialCompletions }: { initialCompletions: Completion[] }) {
  const [completions, setCompletions] = useState(initialCompletions)
  const [message, setMessage] = useState('')

  const review = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const response = await fetch('/api/badges', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    const data = await response.json()
    if (!response.ok) return setMessage(data?.error || 'Unable to review report.')
    setCompletions((current) => current.map((completion) => completion.id === id ? { ...completion, ...data, reviewedAt: data.reviewedAt, status } : completion))
    setMessage(`Report ${status.toLowerCase()}.`)
  }

  return <section style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, overflowX: 'auto', marginTop: 24 }}><table style={{ width: '100%', minWidth: 980, borderCollapse: 'collapse', color: C.text }}><thead><tr style={{ background: 'rgba(46,155,236,.06)' }}>{['Member', 'Badge', 'Category', 'Report', 'Status', 'Action'].map((heading) => <th key={heading} style={{ textAlign: 'left', padding: 14 }}>{heading}</th>)}</tr></thead><tbody>{completions.length === 0 ? <tr><td colSpan={6} style={{ padding: 18, color: C.muted }}>The review queue is clear. New badge reports will arrive here for the RSL.</td></tr> : completions.map((completion) => <tr key={completion.id}><td style={{ padding: 14 }}>{completion.memberName}<div style={{ color: C.muted, fontSize: 12 }}>{completion.memberEmail}</div></td><td style={{ padding: 14 }}>{completion.badgeName}</td><td style={{ padding: 14 }}>{completion.category}</td><td style={{ padding: 14 }}>{completion.reportUrl ? <a href={completion.reportUrl} download={completion.reportName || 'badge-report'} target="_blank" rel="noreferrer" style={{ color: C.gold600 }}>{completion.reportName || 'Open report'}</a> : 'Missing'}</td><td style={{ padding: 14 }}>{completion.status}</td><td style={{ padding: 14 }}>{completion.status === 'PENDING' ? <><button onClick={() => void review(completion.id, 'APPROVED')} style={{ border: 'none', borderRadius: 6, padding: '7px 10px', background: C.gold500, color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Approve</button><button onClick={() => void review(completion.id, 'REJECTED')} style={{ border: 'none', background: 'transparent', color: '#9b2c2c', cursor: 'pointer', marginLeft: 8 }}>Reject</button></> : 'Reviewed'}</td></tr>)}</tbody></table>{message ? <div style={{ padding: 14, color: C.gold600, fontSize: 13 }}>{message}</div> : null}</section>
}