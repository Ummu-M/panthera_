import type { NextApiRequest, NextApiResponse } from 'next'
import { createTransport } from 'nodemailer'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { createEmailLoginCode, EMAIL_LOGIN_CODE_COOLDOWN_MS, EMAIL_LOGIN_CODE_MAX_ATTEMPTS, EMAIL_LOGIN_CODE_TTL_MS, hashEmailLoginCode, normalizeLoginEmail } from '@/lib/email-login-code'
import { isSameOriginRequest } from '@/lib/security'

const genericResponse = { message: 'If an account exists for that email, a sign-in code has been sent.' }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isSameOriginRequest(req.headers.origin, req.headers.host)) {
    return res.status(403).json({ error: 'Cross-origin request blocked' })
  }

  const email = normalizeLoginEmail(req.body?.email)
  if (!email) return res.status(400).json({ error: 'Enter a valid email address.' })
  if (!process.env.EMAIL_SERVER || !process.env.EMAIL_FROM || !process.env.NEXTAUTH_SECRET) {
    return res.status(503).json({ error: 'Email sign-in is not configured.' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { email: true } })
    if (!user) return res.status(200).json(genericResponse)

    const now = new Date()
    const cooldownCutoff = new Date(now.getTime() - EMAIL_LOGIN_CODE_COOLDOWN_MS)
    const existingCode = await prisma.emailLoginCode.findUnique({ where: { email } })
    const code = createEmailLoginCode()
    const tokenHash = hashEmailLoginCode(email, code, process.env.NEXTAUTH_SECRET)
    const codeRecord = {
      tokenHash,
      expiresAt: new Date(now.getTime() + EMAIL_LOGIN_CODE_TTL_MS),
      attempts: 0,
      lastSentAt: now
    }

    if (existingCode) {
      const claimed = await prisma.emailLoginCode.updateMany({
        where: { email, lastSentAt: { lte: cooldownCutoff } },
        data: codeRecord
      })
      if (claimed.count !== 1) return res.status(200).json(genericResponse)
    } else {
      try {
        await prisma.emailLoginCode.create({ data: { email, ...codeRecord } })
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
          return res.status(200).json(genericResponse)
        }
        throw error
      }
    }

    try {
      const transport = createTransport(process.env.EMAIL_SERVER)
      await transport.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Your Panthera Rover Crew sign-in code',
        text: `Your Panthera Rover Crew sign-in code is ${code}. It expires in 10 minutes. If you did not request it, you can ignore this email.`,
        html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:32px auto;padding:28px;border:1px solid #dce5ec;border-radius:12px;color:#122435"><p style="margin:0 0 8px;color:#1d74b3;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase">Panthera Rover Crew</p><h1 style="margin:0 0 16px;font-size:22px">Your sign-in code</h1><p style="margin:0 0 20px;color:#5b7286">Enter this one-time code to sign in. It expires in 10 minutes.</p><div style="padding:16px;border-radius:10px;background:#eef5fb;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px">${code}</div><p style="margin:20px 0 0;color:#5b7286;font-size:13px">If you did not request this code, you can ignore this email.</p></div>`
      })
    } catch (error) {
      await prisma.emailLoginCode.updateMany({
        where: { email, tokenHash },
        data: { attempts: EMAIL_LOGIN_CODE_MAX_ATTEMPTS, expiresAt: now }
      })
      console.error('email sign-in code delivery failed', error)
      return res.status(502).json({ error: 'Unable to send a sign-in code right now. Please try again later.' })
    }

    return res.status(200).json(genericResponse)
  } catch (error) {
    console.error('email sign-in code request failed', error)
    return res.status(500).json({ error: 'Unable to request a sign-in code right now.' })
  }
}
