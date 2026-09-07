import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/lib/prisma'

const REVIEW_ROLES = ['SYSTEM_ADMIN', 'SECRETARY', 'RSL']

export const config = {
  api: {
    bodyParser: { sizeLimit: '10mb' }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any)
  const email = (session as any)?.user?.email
  const role = (session as any)?.user?.role
  if (!email) return res.status(401).json({ error: 'Unauthorized' })

  try {
    if (req.method === 'GET') {
      if (REVIEW_ROLES.includes(role)) {
        const completions = await prisma.badgeCompletion.findMany({ orderBy: { completedAt: 'desc' } })
        return res.status(200).json(completions)
      }
      const user = await prisma.user.findUnique({ where: { email } })
      const completions = user ? await prisma.badgeCompletion.findMany({ where: { userId: user.id }, orderBy: { completedAt: 'desc' } }) : []
      return res.status(200).json(completions)
    }

    if (req.method === 'POST') {
      const { badgeName, category, reportUrl, reportName } = req.body || {}
      if (!badgeName || !category || !reportUrl) return res.status(400).json({ error: 'Badge, category, and report are required' })
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) return res.status(404).json({ error: 'Account not found' })
      const completion = await prisma.badgeCompletion.upsert({
        where: { userId_badgeName: { userId: user.id, badgeName: String(badgeName) } },
        update: { reportUrl: String(reportUrl), reportName: reportName ? String(reportName) : null, status: 'PENDING', reviewedBy: null, reviewedAt: null },
        create: { userId: user.id, badgeName: String(badgeName), category: String(category), reportUrl: String(reportUrl), reportName: reportName ? String(reportName) : null, status: 'PENDING' }
      })
      return res.status(201).json(completion)
    }

    if (req.method === 'PATCH') {
      if (!REVIEW_ROLES.includes(role)) return res.status(403).json({ error: 'Only the RSL or an administrator can review badges' })
      const { id, status } = req.body || {}
      if (!id || !['APPROVED', 'REJECTED'].includes(status)) return res.status(400).json({ error: 'Badge id and review status are required' })
      const completion = await prisma.badgeCompletion.update({ where: { id: String(id) }, data: { status, reviewedBy: email, reviewedAt: new Date(), ...(status === 'APPROVED' ? {} : { completedAt: new Date() }) } })
      return res.status(200).json(completion)
    }

    if (req.method === 'DELETE') {
      const { badgeName } = req.body || {}
      if (!badgeName) return res.status(400).json({ error: 'Badge name is required' })
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) return res.status(404).json({ error: 'Account not found' })
      await prisma.badgeCompletion.delete({ where: { userId_badgeName: { userId: user.id, badgeName: String(badgeName) } } })
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('badges api error', error)
    return res.status(500).json({ error: 'Unable to process badge completion' })
  }
}
