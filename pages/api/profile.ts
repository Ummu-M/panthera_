import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any)
  const email = (session as any)?.user?.email
  if (!email) return res.status(401).json({ error: 'Unauthorized' })

  if (req.method === 'GET') {
    const user = await prisma.user.findUnique({ where: { email } })
    return res.status(200).json({ user })
  }

  if (req.method === 'PUT' || req.method === 'PATCH') {
    const { name, phone, school, course, yearOfStudy, membershipStatus } = req.body || {}
    const data: any = {}
    if (name !== undefined) data.name = name
    if (phone !== undefined) data.phone = phone
    if (school !== undefined) data.school = school
    if (course !== undefined) data.course = course
    if (yearOfStudy !== undefined) data.yearOfStudy = Number(yearOfStudy)
    if (membershipStatus !== undefined) data.membershipStatus = membershipStatus

    try {
      const updated = await prisma.user.update({ where: { email }, data })
      return res.status(200).json({ user: updated })
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('profile update error', err)
      return res.status(500).json({ error: 'Unable to update profile' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
