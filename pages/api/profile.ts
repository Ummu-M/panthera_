import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/lib/prisma'
import { isSameOriginRequest } from '@/lib/security'
import { createRegistrationIdentityKey, getMissingRequiredRegistrationFields, isSameRegistrant } from '@/lib/registration-identity'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any)
  const email = (session as any)?.user?.email
  if (!email) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    const user = await prisma.user.findUnique({ where: { email } })
    return res.status(200).json({ user })
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    if (!isSameOriginRequest(req.headers.origin, req.headers.host)) return res.status(403).json({ error: 'Cross-origin request blocked' })
    if ((session as any)?.user?.role === 'SYSTEM_ADMIN') {
      return res.status(403).json({ error: 'System administrator accounts do not use student profiles.' })
    }

    const { name, registrationNumber, phone, school, course, yearOfStudy } = req.body || {}
    const missingRequired = getMissingRequiredRegistrationFields({
      name,
      email,
      phone,
      registrationNumber,
      school,
      course,
      yearOfStudy
    })
    if (missingRequired.length > 0) {
      return res.status(400).json({ error: `Please complete the required fields: ${missingRequired.join(', ')}.` })
    }

    try {
      const currentUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true, membershipStatus: true, role: { select: { name: true } } }
      })
      if (!currentUser) return res.status(404).json({ error: 'Account not found' })

      const normalizedName = name.trim()
      const normalizedPhone = phone.trim()
      const normalizedRegistrationNumber = registrationNumber.trim()
      const normalizedSchool = school.trim()
      const normalizedCourse = course.trim()
      const registrantDetails = {
        name: normalizedName,
        phone: normalizedPhone,
        registrationNumber: normalizedRegistrationNumber
      }
      const identityCandidates = await prisma.user.findMany({
        where: {
          OR: [
            { registrationNumber: { equals: normalizedRegistrationNumber, mode: 'insensitive' } },
            { name: { equals: normalizedName, mode: 'insensitive' } }
          ],
          role: { isNot: { name: 'SYSTEM_ADMIN' } }
        },
        select: { id: true, name: true, phone: true, registrationNumber: true }
      })
      if (identityCandidates.some((candidate) =>
        candidate.id !== currentUser.id && isSameRegistrant(registrantDetails, candidate)
      )) {
        return res.status(409).json({ error: 'An account already exists with these registration details.' })
      }

      const status = String(currentUser.membershipStatus || '').toLowerCase()
      const data: Record<string, unknown> = {
        name: normalizedName,
        phone: normalizedPhone,
        registrationNumber: normalizedRegistrationNumber,
        registrationIdentityKey: createRegistrationIdentityKey(registrantDetails),
        school: normalizedSchool,
        course: normalizedCourse,
        yearOfStudy: Number(yearOfStudy)
      }
      if (status !== 'approved') data.membershipStatus = 'pending'

      const updated = await prisma.user.update({ where: { email }, data })
      const message = status === 'approved'
        ? 'Profile changes saved.'
        : 'Profile saved and submitted for admin review.'
      return res.status(200).json({ user: updated, message })
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('profile update error', err)
      if (err?.code === 'P2002') {
        return res.status(409).json({ error: 'That KU registration number is already linked to another account.' })
      }
      return res.status(500).json({ error: 'Unable to update profile' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
