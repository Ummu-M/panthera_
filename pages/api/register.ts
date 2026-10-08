import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { createRegistrationIdentityKey, isSameRegistrant } from '@/lib/registration-identity'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, name, phone, registrationNumber, school, course, yearOfStudy } = req.body || {}
  const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  if (!normalizedEmail) return res.status(400).json({ error: 'Email is required' })

  try {
    const existing = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } }
    })
    const status = String(existing?.membershipStatus || '').toLowerCase()

    if (existing) {
      if (status === 'pending') {
        return res.status(409).json({ error: 'An account already exists for this email and is already pending review.' })
      }

      if (status === 'approved') {
        return res.status(409).json({ error: 'An account already exists for this email and is already approved. Please sign in.' })
      }
    }

    const registrantDetails = {
      name: name || existing?.name,
      phone: phone || existing?.phone,
      registrationNumber: registrationNumber || existing?.registrationNumber
    }
    const identityCandidates = await prisma.user.findMany({
      where: {
        OR: [
          ...(registrantDetails.registrationNumber ? [{ registrationNumber: { equals: registrantDetails.registrationNumber, mode: 'insensitive' as const } }] : []),
          ...(registrantDetails.name ? [{ name: { equals: registrantDetails.name, mode: 'insensitive' as const } }] : [])
        ]
      },
      select: { id: true, name: true, phone: true, registrationNumber: true }
    })
    const duplicate = identityCandidates.some((candidate) =>
      candidate.id !== existing?.id && isSameRegistrant(registrantDetails, candidate)
    )

    if (duplicate) {
      return res.status(409).json({ error: 'An account already exists with these registration details. Please sign in or contact an administrator.' })
    }

    const registrationIdentityKey = createRegistrationIdentityKey(registrantDetails)

    if (existing) {
      const updated = await prisma.user.update({
        where: { email: existing.email },
        data: {
          name: name || existing.name,
          phone: phone || existing.phone,
          registrationNumber: registrationNumber || existing.registrationNumber,
          registrationIdentityKey,
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
        email: normalizedEmail,
        name,
        phone: phone || null,
        registrationNumber: registrationNumber || null,
        registrationIdentityKey,
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
      const target = Array.isArray(err?.meta?.target) ? err.meta.target : []
      if (target.includes('registrationIdentityKey')) {
        return res.status(409).json({ error: 'An account already exists with these registration details. Please sign in or contact an administrator.' })
      }
      const field = target.includes('registrationNumber')
        ? 'KU registration number'
        : 'email'
      return res.status(409).json({ error: `An account already exists with this ${field}. Please sign in instead.` })
    }
    return res.status(500).json({ error: err.message || 'Server error' })
  }
}
