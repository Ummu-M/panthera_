import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/lib/prisma'

const ALLOWED_ROLES = ['SYSTEM_ADMIN', 'QUARTERMASTER', 'RSL']

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any)
  const role = (session as any)?.user?.role

  if (!session) return res.status(401).json({ error: 'Unauthorized' })
  if (!ALLOWED_ROLES.includes(role)) return res.status(403).json({ error: 'Forbidden' })

  try {
    if (req.method === 'GET') {
      return res.status(200).json(await prisma.inventoryItem.findMany({ orderBy: { createdAt: 'desc' } }))
    }

    if (req.method === 'POST') {
      const { name, category, quantity, condition, location } = req.body || {}
      if (!name || !category || quantity === undefined || !condition) {
        return res.status(400).json({ error: 'Name, category, quantity, and condition are required' })
      }
      const item = await prisma.inventoryItem.create({
        data: {
          name: String(name),
          category: String(category),
          quantity: Number(quantity),
          condition: String(condition),
          location: location ? String(location) : null,
          createdBy: (session as any).user.email
        }
      })
      return res.status(201).json(item)
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const { id, name, category, quantity, condition, location } = req.body || {}
      if (!id) return res.status(400).json({ error: 'Inventory item id is required' })
      const item = await prisma.inventoryItem.update({ where: { id: String(id) }, data: { ...(name !== undefined ? { name: String(name) } : {}), ...(category !== undefined ? { category: String(category) } : {}), ...(quantity !== undefined ? { quantity: Number(quantity) } : {}), ...(condition !== undefined ? { condition: String(condition) } : {}), ...(location !== undefined ? { location: location ? String(location) : null } : {}) } })
      return res.status(200).json(item)
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {}
      if (!id) return res.status(400).json({ error: 'Inventory item id is required' })
      await prisma.inventoryItem.delete({ where: { id: String(id) } })
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('inventory api error', error)
    return res.status(500).json({ error: 'Unable to process inventory request' })
  }
}
