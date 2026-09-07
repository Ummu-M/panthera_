'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { theme } from '@/lib/theme'

const C = theme

const KU_SCHOOLS = [
  'School of Agriculture and Enterprise Development',
  'School of Business, Economics and Tourism',
  'School of Creative Arts, Film and Media Studies',
  'School of Education',
  'School of Engineering',
  'School of Health Sciences',
  'School of Hospitality and Tourism',
  'School of Humanities and Social Sciences',
  'School of Law',
  'School of Nursing',
  'School of Pure and Applied Sciences',
  'School of Public Health',
  'School of Security, Diplomacy and International Affairs'
]

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

type ProfileData = {
  name?: string | null
  email?: string | null
  registrationNumber?: string | null
  phone?: string | null
  school?: string | null
  course?: string | null
  yearOfStudy?: number | null
  membershipStatus?: string | null
}

export default function ProfileForm({ profile }: { profile: ProfileData }) {
  const router = useRouter()
  const [form, setForm] = useState({
    name: profile.name || '',
    registrationNumber: profile.registrationNumber || '',
    phone: profile.phone || '',
    school: profile.school || '',
    course: profile.course || '',
    yearOfStudy: profile.yearOfStudy ? String(profile.yearOfStudy) : ''
  })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setSaving(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, membershipStatus: 'pending' })
      })
      const data = await response.json()
      if (!response.ok) {
        setMessage(data?.error || 'Unable to save your profile.')
        return
      }
      setMessage('Profile submitted. Your membership is now pending admin review.')
      router.refresh()
    } catch {
      setMessage('Unable to save your profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const isComplete = String(profile.membershipStatus || '').toLowerCase() === 'pending' || String(profile.membershipStatus || '').toLowerCase() === 'approved'

  return (
    <section style={{ background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, marginTop: 24, boxShadow: '0 14px 36px rgba(18,36,53,0.08)' }}>
      <h2 style={{ margin: '0 0 8px', color: C.text, fontSize: 21, fontFamily: 'var(--font-display)', fontWeight: 500 }}>
        {isComplete ? 'Profile details' : 'Complete your profile'}
      </h2>
      <p style={{ margin: '0 0 20px', color: C.muted, lineHeight: 1.6, fontSize: 14 }}>
        {isComplete ? 'Keep your Kenyatta University Panthera Rover Crew membership details up to date.' : 'Complete these details to submit your Kenyatta University Panthera Rover Crew membership application.'}
      </p>

      <form onSubmit={submit} style={{ display: 'grid', gap: 14 }}>
        <input value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Full name" required style={inputStyle} />
        <input value={profile.email || ''} readOnly placeholder="Email" style={{ ...inputStyle, opacity: 0.7 }} />
        <input value={form.registrationNumber} onChange={(event) => updateField('registrationNumber', event.target.value)} placeholder="KU registration / student number" required style={inputStyle} />
        <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="Phone number" type="tel" required style={inputStyle} />
        <select value={form.school} onChange={(event) => updateField('school', event.target.value)} required style={inputStyle}>
          <option value="">Select your KU school</option>
          {KU_SCHOOLS.map((school) => <option key={school} value={school}>{school}</option>)}
        </select>
        <input value={form.course} onChange={(event) => updateField('course', event.target.value)} placeholder="Course / programme" required style={inputStyle} />
        <select value={form.yearOfStudy} onChange={(event) => updateField('yearOfStudy', event.target.value)} required style={inputStyle}>
          <option value="">Select year of study</option>
          <option value="1">1st Year</option>
          <option value="2">2nd Year</option>
          <option value="3">3rd Year</option>
          <option value="4">4th Year</option>
          <option value="5">Postgraduate</option>
        </select>
        <button type="submit" disabled={saving} style={{ width: '100%', border: 'none', background: saving ? C.muted : `linear-gradient(135deg, ${C.gold500}, ${C.gold600})`, color: '#fff', borderRadius: 10, padding: '14px 16px', fontWeight: 700, fontSize: 14, cursor: saving ? 'wait' : 'pointer' }}>
          {saving ? 'Saving...' : isComplete ? 'Save profile' : 'Submit profile'}
        </button>
      </form>

      {message ? <div style={{ marginTop: 16, color: C.gold600, fontSize: 13 }}>{message}</div> : null}
    </section>
  )
}
