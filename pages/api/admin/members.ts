import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

type TableRows = Record<string, any[]>

function getValue(row: any, keys: string[], fallback: any = '') {
  for (const key of keys) {
    if (row?.[key] !== undefined && row?.[key] !== null && row?.[key] !== '') return row[key]
  }
  return fallback
}

function scoutId(row: any) {
  return String(getValue(row, ['scout_id', 'scoutId', 'member_id', 'memberId', 'user_id', 'userId', 'id'], ''))
}

async function readTable(table: string) {
  return prisma.$queryRawUnsafe<any[]>(`select * from ${table}`)
}

async function updateScout(id: string, data: Record<string, any>) {
  const allowedFields = ['full_name', 'name', 'email', 'phone', 'patrol', 'rank', 'status', 'join_date']
  const entries = Object.entries(data).filter(([key]) => allowedFields.includes(key))
  if (!entries.length) return null

  const assignments = entries.map(([key], index) => `"${key}" = $${index + 1}`).join(', ')
  const values = entries.map(([, value]) => value)

  const rows = await prisma.$queryRawUnsafe<any[]>(
    `update scouts set ${assignments} where id = $${entries.length + 1} returning *`,
    ...values,
    id
  )

  return rows[0] || null
}

function normalizeMember(scout: any, rows: TableRows) {
  const id = String(getValue(scout, ['id', 'scout_id', 'member_id']))
  const attendanceRows = rows.attendance.filter((row) => scoutId(row) === id)
  const duesRows = rows.dues.filter((row) => scoutId(row) === id)
  const financeRows = rows.financial_records.filter((row) => scoutId(row) === id)
  const scoutBadgeRows = rows.scout_badges.filter((row) => scoutId(row) === id)
  const badgeById = new Map(rows.badges.map((badge) => [String(getValue(badge, ['id', 'badge_id'])), badge]))
  const attended = attendanceRows.filter((row) => {
    const status = String(getValue(row, ['status', 'attendance_status', 'present'], '')).toLowerCase()
    return status === 'present' || status === 'attended' || status === 'true' || status === '1' || row.present === true
  }).length
  const attendancePercent = attendanceRows.length ? Math.round((attended / attendanceRows.length) * 100) : 0
  const unpaidDues = duesRows.some((row) => String(getValue(row, ['status', 'payment_status', 'dues_status'], '')).toLowerCase() !== 'paid')
  const paidDues = duesRows.some((row) => String(getValue(row, ['status', 'payment_status', 'dues_status'], '')).toLowerCase() === 'paid')

  return {
    id,
    photoUrl: getValue(scout, ['photo_url', 'avatar_url', 'image', 'profile_photo']),
    fullName: getValue(scout, ['full_name', 'name', 'first_name'], 'Unnamed member'),
    email: getValue(scout, ['email', 'contact_email']),
    phone: getValue(scout, ['phone', 'phone_number', 'contact_phone']),
    patrol: getValue(scout, ['patrol', 'patrol_name'], 'Unassigned'),
    rank: getValue(scout, ['rank', 'current_rank'], 'Unranked'),
    joinDate: getValue(scout, ['join_date', 'joined_at', 'created_at']),
    status: String(getValue(scout, ['status', 'membership_status'], 'active')).toLowerCase(),
    duesStatus: unpaidDues ? 'unpaid' : paidDues ? 'paid' : String(getValue(scout, ['dues_status'], 'unpaid')).toLowerCase(),
    attendancePercent,
    badgesEarned: scoutBadgeRows.length,
    rawScout: scout,
    badgeHistory: scoutBadgeRows.map((row) => {
      const badge = badgeById.get(String(getValue(row, ['badge_id', 'badgeId']))) || {}
      return {
        id: getValue(row, ['id']),
        name: getValue(badge, ['name', 'title'], getValue(row, ['badge_name', 'name'], 'Badge')),
        status: getValue(row, ['status', 'progress_status'], 'earned'),
        earnedAt: getValue(row, ['earned_at', 'awarded_at', 'created_at'])
      }
    }),
    attendanceHistory: attendanceRows.map((row) => ({
      id: getValue(row, ['id']),
      date: getValue(row, ['date', 'meeting_date', 'created_at']),
      event: getValue(row, ['event_name', 'event', 'meeting'], 'Meeting'),
      status: getValue(row, ['status', 'attendance_status'], row.present === true ? 'present' : 'absent')
    })),
    duesHistory: duesRows.map((row) => ({
      id: getValue(row, ['id']),
      period: getValue(row, ['period', 'term', 'month'], 'Dues'),
      amount: getValue(row, ['amount', 'amount_due'], 0),
      status: getValue(row, ['status', 'payment_status'], 'unpaid'),
      paidAt: getValue(row, ['paid_at', 'payment_date'])
    })),
    paymentHistory: financeRows.map((row) => ({
      id: getValue(row, ['id']),
      date: getValue(row, ['date', 'created_at', 'paid_at']),
      description: getValue(row, ['description', 'desc', 'memo', 'category'], 'Payment'),
      amount: getValue(row, ['amount'], 0),
      status: getValue(row, ['status'], 'recorded')
    }))
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'PATCH') {
      const { id, data } = req.body || {}
      if (!id || !data) return res.status(400).json({ error: 'Missing member id or data' })
      const scout = await updateScout(String(id), data)
      return res.status(200).json({ scout })
    }

    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

    const [scouts, badges, scoutBadges, attendance, dues, financialRecords] = await Promise.all([
      readTable('scouts'),
      readTable('badges'),
      readTable('scout_badges'),
      readTable('attendance'),
      readTable('dues'),
      readTable('financial_records')
    ])

    const rows = { scouts, badges, scout_badges: scoutBadges, attendance, dues, financial_records: financialRecords }
    const members = scouts.map((scout) => normalizeMember(scout, rows))

    res.status(200).json({ members })
  } catch (err: any) {
    console.error('members api error', err)
    res.status(500).json({ error: err?.message || 'Unable to load members from Neon' })
  }
}
