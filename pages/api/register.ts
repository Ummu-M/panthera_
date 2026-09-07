import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, name, phone, registrationNumber, school, course, yearOfStudy } = req.body || {}
  if (!email) return res.status(400).json({ error: 'Email is required' })

  try {
    const existing = await prisma.user.findUnique({ where: { email } })

    if (existing) {
      const status = String(existing.membershipStatus || '').toLowerCase()
      if (status === 'pending') {
        return res.status(409).json({ error: 'An account already exists for this email and is already pending review.' })
      }

      if (status === 'approved') {
        return res.status(409).json({ error: 'An account already exists for this email and is already approved. Please sign in.' })
      }

      const updated = await prisma.user.update({
        where: { email },
        data: {
          name: name || existing.name,
          phone: phone || existing.phone,
          registrationNumber: registrationNumber || existing.registrationNumber,
          school: school || existing.school,
          course: course || existing.course,
          yearOfStudy: yearOfStudy !== undefined && yearOfStudy !== null && yearOfStudy !== '' ? Number(yearOfStudy) : existing.yearOfStudy,
          membershipStatus: 'pending',
          registrationFeePaid: false
        }
      })

      return res.status(200).json({ user: updated, message: 'Registration updated and resubmitted for review.' })
    }

    const role = await prisma.role.findUnique({ where: { name: 'MEMBER' } })
    if (!role) return res.status(500).json({ error: 'Default role not found' })

    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone: phone || null,
        registrationNumber: registrationNumber || null,
        school: school || null,
        course: course || null,
        yearOfStudy: yearOfStudy !== undefined && yearOfStudy !== null && yearOfStudy !== '' ? Number(yearOfStudy) : null,
        role: { connect: { id: role.id } },
        membershipStatus: 'pending',
        registrationFeePaid: false
      }
    })

    return res.status(201).json({ user, message: 'Registration submitted successfully. Pending verification.' })
  } catch (err: any) {
    console.error('register error', err)
    if (err?.code === 'P2002') {
      const field = Array.isArray(err?.meta?.target) && err.meta.target.includes('registrationNumber')
        ? 'KU registration number'
        : 'email'
      return res.status(409).json({ error: `An account already exists with this ${field}. Please sign in instead.` })
    }
    return res.status(500).json({ error: err.message || 'Server error' })
  }
}
