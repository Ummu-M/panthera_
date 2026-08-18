import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, name, phone, school, course, yearOfStudy } = req.body || {}
  if (!email) return res.status(400).json({ error: 'Email is required' })

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'User already exists' })

    const role = await prisma.role.findUnique({ where: { name: 'MEMBER' } })
    if (!role) return res.status(500).json({ error: 'Default role not found' })

    const user = await prisma.user.create({
      data: {
        email,
        name,
        phone: phone || null,
        school: school || null,
        course: course || null,
        yearOfStudy: yearOfStudy ? Number(yearOfStudy) : null,
        role: { connect: { id: role.id } },
        membershipStatus: 'Pending',
        registrationFeePaid: false
      }
    })

    return res.status(201).json({ user })
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('register error', err)
    return res.status(500).json({ error: err.message || 'Server error' })
  }
}
