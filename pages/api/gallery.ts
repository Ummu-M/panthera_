import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/lib/auth'
import { prisma } from '@/lib/prisma'
import { isSameOriginRequest } from '@/lib/security'

const ALLOWED_ROLES = ['SYSTEM_ADMIN', 'SECRETARY', 'RSL']

// Photos are stored as base64 data URLs directly in the `url` column
// (Photo.url is @db.Text, so it fits). Fine for a crew-sized photo count;
// if the gallery grows large, move to object storage (S3/Supabase Storage)
// and store just the resulting URL here instead.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === 'GET') {
      const photos = await prisma.photo.findMany({ orderBy: { createdAt: 'desc' } })
      return res.status(200).json(photos)
    }

    const session = await getServerSession(req, res, authOptions as any)
    const role = (session as any)?.user?.role
    if (!session) return res.status(401).json({ error: 'Unauthorized' })
    if (!ALLOWED_ROLES.includes(role)) return res.status(403).json({ error: 'Forbidden' })
    if (!isSameOriginRequest(req.headers.origin, req.headers.host)) return res.status(403).json({ error: 'Cross-origin request blocked' })

    if (req.method === 'POST') {
      const { url, caption } = req.body || {}
      if (!url) return res.status(400).json({ error: 'Image data is required' })

      const photo = await prisma.photo.create({
        data: {
          url,
          caption: caption || null,
          createdBy: (session as any).user.email
        }
      })
      return res.status(201).json(photo)
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const { id, url, caption } = req.body || {}
      if (!id) return res.status(400).json({ error: 'Photo id is required' })
      const photo = await prisma.photo.update({ where: { id: String(id) }, data: { ...(url !== undefined ? { url } : {}), ...(caption !== undefined ? { caption } : {}) } })
      return res.status(200).json(photo)
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {}
      if (!id) return res.status(400).json({ error: 'Photo id is required' })
      await prisma.photo.delete({ where: { id } })
      return res.status(200).json({ ok: true })
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'])
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (err) {
    console.error('gallery API error', err)
    return res.status(500).json({ error: 'Unable to process gallery request' })
  }
}

// Default Next.js body limit is 1MB — too small for a base64-encoded photo.
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb'
    }
  }
}
