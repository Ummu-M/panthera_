import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { createRegistrationIdentityKey, getMissingRequiredRegistrationFields, isSameRegistrant } from '@/lib/registration-identity'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, name, phone, registrationNumber, school, course, yearOfStudy } = req.body || {}
  const missingRequired = getMissingRequiredRegistrationFields({ email, name, phone, registrationNumber, school, course, yearOfStudy })
  if (missingRequired.length > 0) {
    return res.status(400).json({ error: `Please complete the required fields: ${missingRequired.join(', ')}.` })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const normalizedName = name.trim()
  const normalizedPhone = phone.trim()
  const normalizedRegistrationNumber = registrationNumber.trim()
  const normalizedSchool = school.trim()
  const normalizedCourse = course.trim()
  const normalizedYear = Number(yearOfStudy)

  try {
    const existing = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
      include: { role: true }
    })
    const status = String(existing?.membershipStatus || '').toLowerCase()

    if (existing) {
      if (existing.role?.name === 'SYSTEM_ADMIN') {
        return res.status(403).json({ error: 'System administrator accounts do not use student registration.' })
      }

      if (status === 'pending') {
        return res.status(409).json({ error: 'An account already exists for this email and is already pending review.' })
      }

      if (status === 'approved') {
        return res.status(409).json({ error: 'An account already exists for this email and is already approved. Please sign in.' })
      }
    }

    const registrantDetails = {
      name: normalizedName,
      phone: normalizedPhone,
      registrationNumber: normalizedRegistrationNumber
    }
    const identityCandidates = await prisma.user.findMany({
      where: {
        OR: [
          { registrationNumber: { equals: registrantDetails.registrationNumber, mode: 'insensitive' as const } },
          { name: { equals: registrantDetails.name, mode: 'insensitive' as const } }
        ],
        role: { isNot: { name: 'SYSTEM_ADMIN' } }
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
          name: normalizedName,
          phone: normalizedPhone,
          registrationNumber: normalizedRegistrationNumber,
          registrationIdentityKey,
          school: normalizedSchool,
          course: normalizedCourse,
          yearOfStudy: normalizedYear,
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
        name: normalizedName,
        phone: normalizedPhone,
        registrationNumber: normalizedRegistrationNumber,
        registrationIdentityKey,
        school: normalizedSchool,
        course: normalizedCourse,
        yearOfStudy: normalizedYear,
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
