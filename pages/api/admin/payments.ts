import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/lib/prisma'

const ALLOWED_ROLES = ['SYSTEM_ADMIN', 'SECRETARY', 'TREASURER', 'RSL']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any)
  const role = (session as any)?.user?.role

  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  if (!ALLOWED_ROLES.includes(role)) return res.status(403).json({ error: 'Forbidden' })

  try {
    if (req.method === 'GET') {
      const payments = await prisma.payment.findMany({ orderBy: { createdAt: 'desc' } })
      return res.status(200).json(payments)
    }

    if (req.method === 'POST') {
      const { amount, type, purpose, userId } = req.body || {}
      if (!amount || !purpose) return res.status(400).json({ error: 'Amount and purpose are required' })

      const payment = await prisma.payment.create({
        data: {
          amount: Number(amount),
          category: type === 'expense' ? 'EXPENSE' : 'INCOME',
          purpose: String(purpose),
          type: type === 'expense' ? 'expense' : 'income',
          status: String(status || 'recorded'),
          userId: String(userId || (session as any).user.email)
        }
      })
      return res.status(201).json(payment)
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const { id, amount, purpose, type } = req.body || {}
      if (!id) return res.status(400).json({ error: 'Payment id is required' })
      const payment = await prisma.payment.update({ where: { id: String(id) }, data: { ...(amount !== undefined ? { amount: Number(amount) } : {}), ...(purpose !== undefined ? { purpose: String(purpose) } : {}), ...(type !== undefined ? { type: type === 'expense' ? 'expense' : 'income', category: type === 'expense' ? 'EXPENSE' : 'INCOME' } : {}) } })
      return res.status(200).json(payment)
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {}
      if (!id) return res.status(400).json({ error: 'Payment id is required' })
      await prisma.payment.delete({ where: { id: String(id) } })
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('payments api error', error)
    return res.status(500).json({ error: 'Unable to process treasury request' })
  }
}
