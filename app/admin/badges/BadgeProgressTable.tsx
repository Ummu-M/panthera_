'use client'

import { theme } from '@/lib/theme'
import { badgeProgressLabel } from '@/lib/badge-progress'
import { formatCrewDate } from '@/lib/admin-formatters'

const C = theme

type BadgeProgressRecord = {
  id: string
  badgeName: string
  category: string
  reportUrl: string | null
  reportName: string | null
  status: string
  progressStatus: string
  updatedAt: string
  memberName: string
  memberEmail: string
}

export default function BadgeProgressTable({ initialRecords }: { initialRecords: BadgeProgressRecord[] }) {
  return (
    <section style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, marginTop: 24, overflow: 'hidden' }}>
      <div className="admin-table-desktop" style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', color: C.text, minWidth: 850, width: '100%' }}>
          <thead>
            <tr style={{ background: 'rgba(46,155,236,.06)' }}>
              {['Member', 'Badge', 'Category', 'Progress', 'Evidence', 'Last updated'].map((heading) => (
                <th key={heading} scope="col" style={{ padding: 14, textAlign: 'left' }}>{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {initialRecords.map((record) => (
              <tr key={record.id}>
                <td style={{ padding: 14 }}>
                  {record.memberName}
                  <div style={{ color: C.muted, fontSize: 12 }}>{record.memberEmail}</div>
                </td>
                <td style={{ padding: 14 }}>{record.badgeName}</td>
                <td style={{ padding: 14 }}>{record.category}</td>
                <td style={{ padding: 14 }}>{badgeProgressLabel(record.progressStatus, record.status)}</td>
                <td style={{ padding: 14 }}>
                  {record.reportUrl
                    ? <a href={record.reportUrl} download={record.reportName || 'badge-evidence'} target="_blank" rel="noreferrer" style={{ color: C.gold600 }}>{record.reportName || 'Open evidence'}</a>
                    : 'No evidence attached'}
                </td>
                <td style={{ padding: 14 }}>{formatCrewDate(record.updatedAt)}</td>
              </tr>
            ))}
            {initialRecords.length === 0 ? (
              <tr><td colSpan={6} style={{ color: C.muted, padding: 18 }}>No badge progress has been recorded yet.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
      <div className="admin-table-mobile responsive-card-list">
        {initialRecords.map((record) => (
          <article key={record.id} className="responsive-card">
            <div style={{ fontSize: 14, fontWeight: 700 }}>{record.badgeName}</div>
            <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>{record.memberName} · {record.memberEmail}</div>
            <div className="responsive-card-details">
              <div><span className="responsive-card-label">Category</span><span className="responsive-card-value">{record.category}</span></div>
              <div><span className="responsive-card-label">Progress</span><span className="responsive-card-value">{badgeProgressLabel(record.progressStatus, record.status)}</span></div>
              <div><span className="responsive-card-label">Last updated</span><span className="responsive-card-value">{formatCrewDate(record.updatedAt)}</span></div>
            </div>
            {record.reportUrl
              ? <a href={record.reportUrl} download={record.reportName || 'badge-evidence'} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, color: C.gold600, fontSize: 13, fontWeight: 600 }}>{record.reportName || 'Open evidence'}</a>
              : <div style={{ color: C.muted, fontSize: 12, marginTop: 10 }}>No evidence attached</div>}
          </article>
        ))}
        {initialRecords.length === 0 ? <p style={{ color: C.muted, fontSize: 13, margin: 4 }}>No badge progress has been recorded yet.</p> : null}
      </div>
    </section>
  )
}
