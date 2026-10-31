'use client'

import { FormEvent, useState } from 'react'
import { Send } from 'lucide-react'
import { theme } from '@/lib/theme'

const C = theme

export default function NotificationComposer() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('/dashboard')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setMessage('')
    setIsError(false)
    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, body, url })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Could not send notifications.')
      setMessage(`Sent to ${data.sent} device${data.sent === 1 ? '' : 's'}${data.failed ? `; ${data.failed} failed` : ''}.`)
      setTitle('')
      setBody('')
    } catch (error) {
      setIsError(true)
      setMessage(error instanceof Error ? error.message : 'Could not send notifications.')
    } finally {
      setBusy(false)
    }
  }

  const labelStyle = { display: 'block', marginBottom: 7, color: C.text, fontSize: 13, fontWeight: 600 } as const
  const fieldStyle = { width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, background: '#fff', color: C.text, padding: '12px 14px', font: 'inherit', fontSize: 14, outlineColor: C.gold600 } as const

  return (
    <form onSubmit={send} style={{ maxWidth: 620, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, boxShadow: '0 14px 36px rgba(18,36,53,0.08)' }}>
      <p style={{ margin: '0 0 20px', color: C.muted, fontSize: 13, lineHeight: 1.6 }}>Send a browser notification to members who have enabled crew notifications on their devices.</p>
      <div style={{ display: 'grid', gap: 16 }}>
        <div>
          <label htmlFor="notification-title" style={labelStyle}>Title</label>
          <input id="notification-title" required maxLength={80} value={title} onChange={(event) => setTitle(event.target.value)} style={fieldStyle} />
          <div style={{ marginTop: 4, color: C.muted, fontSize: 11, textAlign: 'right' }}>{title.length}/80</div>
        </div>
        <div>
          <label htmlFor="notification-body" style={labelStyle}>Message</label>
          <textarea id="notification-body" required maxLength={240} rows={4} value={body} onChange={(event) => setBody(event.target.value)} style={{ ...fieldStyle, minHeight: 108, resize: 'vertical' }} />
          <div style={{ marginTop: 4, color: C.muted, fontSize: 11, textAlign: 'right' }}>{body.length}/240</div>
        </div>
        <div>
          <label htmlFor="notification-url" style={labelStyle}>Open this page when tapped</label>
          <input id="notification-url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="/dashboard" style={fieldStyle} />
          <div style={{ marginTop: 4, color: C.muted, fontSize: 11 }}>Use an internal path such as /dashboard or /events.</div>
        </div>
        <button type="submit" disabled={busy || !title.trim() || !body.trim()} style={{ display: 'inline-flex', minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 9, border: 0, borderRadius: 8, padding: '0 16px', background: C.gold600, color: '#fff', fontWeight: 600, fontSize: 14, cursor: busy ? 'wait' : 'pointer' }}>
          <Send size={16} aria-hidden="true" />
          {busy ? 'Sending…' : 'Send notification'}
        </button>
      </div>
      {message && <p role={isError ? 'alert' : 'status'} aria-live="polite" style={{ margin: '16px 0 0', color: isError ? '#8c2f26' : '#1f6849', fontSize: 13 }}>{message}</p>}
    </form>
  )
}