import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/lib/prisma'
import { isSameOriginRequest, isSafeReportDataUrl } from '@/lib/security'
import { isBadgeProgressStatus, resolveBadgeProgressStatus } from '@/lib/badge-progress'

const PROGRESS_VIEW_ROLES = ['SYSTEM_ADMIN', 'SECRETARY', 'RSL']

export const config = {
  api: {
    bodyParser: { sizeLimit: '14mb' }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any)
  const email = (session as any)?.user?.email
  const role = (session as any)?.user?.role
  if (!email) return res.status(401).json({ error: 'Unauthorized' })

  try {
    if (req.method === 'GET') {
      if (PROGRESS_VIEW_ROLES.includes(role)) {
        const completions = await prisma.badgeCompletion.findMany({ orderBy: { completedAt: 'desc' } })
        return res.status(200).json(completions.map((completion) => ({
          ...completion,
          progressStatus: resolveBadgeProgressStatus(completion.progressStatus, completion.status)
        })))
      }
      const user = await prisma.user.findUnique({ where: { email } })
      const completions = user ? await prisma.badgeCompletion.findMany({ where: { userId: user.id }, orderBy: { completedAt: 'desc' } }) : []
      return res.status(200).json(completions.map((completion) => ({
        ...completion,
        progressStatus: resolveBadgeProgressStatus(completion.progressStatus, completion.status)
      })))
    }

    if (req.method === 'POST') {
      if (!isSameOriginRequest(req.headers.origin, req.headers.host)) return res.status(403).json({ error: 'Cross-origin request blocked' })
      const { badgeName, category, progressStatus, reportUrl, reportName } = req.body || {}
      const normalizedBadgeName = typeof badgeName === 'string' ? badgeName.trim() : ''
      const normalizedCategory = typeof category === 'string' ? category.trim() : ''
      if (!normalizedBadgeName || normalizedBadgeName.length > 120 || !normalizedCategory || normalizedCategory.length > 80) {
        return res.status(400).json({ error: 'Badge and category are required.' })
      }
      if (!isBadgeProgressStatus(progressStatus)) return res.status(400).json({ error: 'Choose a valid badge progress stage.' })
      if (reportUrl !== undefined && !isSafeReportDataUrl(reportUrl)) {
        return res.status(400).json({ error: 'Evidence must be a supported PDF, Word document, or image under 10 MB.' })
      }
      if (reportName !== undefined && (typeof reportName !== 'string' || reportName.length > 255)) {
        return res.status(400).json({ error: 'Evidence filename is invalid.' })
      }
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) return res.status(404).json({ error: 'Account not found' })
      const existing = await prisma.badgeCompletion.findUnique({
        where: { userId_badgeName: { userId: user.id, badgeName: normalizedBadgeName } }
      })
      const updateData = {
        progressStatus,
        ...(reportUrl !== undefined ? { reportUrl: String(reportUrl), reportName: reportName ? String(reportName) : null } : {}),
        ...(progressStatus === 'COMPLETED' && existing?.progressStatus !== 'COMPLETED' ? { completedAt: new Date() } : {})
      }
      const completion = await prisma.badgeCompletion.upsert({
        where: { userId_badgeName: { userId: user.id, badgeName: normalizedBadgeName } },
        update: updateData,
        create: {
          userId: user.id,
          badgeName: normalizedBadgeName,
          category: normalizedCategory,
          progressStatus,
          status: progressStatus,
          ...(reportUrl !== undefined ? { reportUrl: String(reportUrl), reportName: reportName ? String(reportName) : null } : {})
        }
      })
      return res.status(201).json(completion)
    }

    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('badges api error', error)
    return res.status(500).json({ error: 'Unable to process badge progress' })
  }
}
