import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { EMAIL_LOGIN_CODE_MAX_ATTEMPTS, normalizeLoginEmail, verifyEmailLoginCode } from '@/lib/email-login-code'

async function resolveUserRole(email?: string | null) {
  if (!email) return 'PENDING'

  try {
    const isConfiguredAdmin = !!process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()

    if (isConfiguredAdmin) {
      const adminRole = await prisma.role.findUnique({ where: { name: 'SYSTEM_ADMIN' } })
      if (adminRole) {
        await prisma.user.upsert({
          where: { email },
          update: { role: { connect: { id: adminRole.id } } },
          create: {
            email,
            name: 'System Admin',
            role: { connect: { id: adminRole.id } }
          }
        })
        return 'SYSTEM_ADMIN'
      }
    }

    const dbUser = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    })

    if (!dbUser) return 'PENDING'

    const status = String(dbUser.membershipStatus || '').toLowerCase()
    if (status === 'approved') {
      return dbUser.role?.name || 'MEMBER'
    }

    if (status === 'pending' || status === 'rejected') {
      return 'PENDING'
    }

    if (dbUser.role?.name && dbUser.role.name !== 'MEMBER') return dbUser.role.name

    const memberRole = await prisma.role.findUnique({ where: { name: 'MEMBER' } })
    if (memberRole) {
      await prisma.user.upsert({
        where: { email },
        update: { role: { connect: { id: memberRole.id } } },
        create: {
          email,
          name: 'Member',
          role: { connect: { id: memberRole.id } }
        }
      })
    }
  } catch (err) {
    console.error('resolveUserRole error', err)
  }

  return 'PENDING'
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET, 
   logger: {
    error(code, metadata: any) {
      console.error('>>> NEXTAUTH ERROR:', code)
      console.error('>>> DETAILS:', metadata?.message || metadata)
    },
  },
  providers: [
    ...(process.env.EMAIL_SERVER && process.env.EMAIL_FROM
      ? [CredentialsProvider({
          id: 'email-code',
          name: 'Email verification code',
          credentials: {
            email: { label: 'Email', type: 'email' },
            code: { label: 'Verification code', type: 'text' }
          },
          async authorize(credentials) {
            const email = normalizeLoginEmail(credentials?.email)
            const code = credentials?.code
            const secret = process.env.NEXTAUTH_SECRET
            if (!email || !code || !secret) return null

            const codeRecord = await prisma.emailLoginCode.findUnique({ where: { email } })
            if (!codeRecord || codeRecord.expiresAt <= new Date() || codeRecord.attempts >= EMAIL_LOGIN_CODE_MAX_ATTEMPTS) {
              return null
            }

            if (!verifyEmailLoginCode(email, code, codeRecord.tokenHash, secret)) {
              await prisma.emailLoginCode.updateMany({
                where: {
                  email,
                  tokenHash: codeRecord.tokenHash,
                  attempts: { lt: EMAIL_LOGIN_CODE_MAX_ATTEMPTS }
                },
                data: { attempts: { increment: 1 } }
              })
              return null
            }

            const consumed = await prisma.emailLoginCode.deleteMany({
              where: {
                email,
                tokenHash: codeRecord.tokenHash,
                expiresAt: { gt: new Date() },
                attempts: { lt: EMAIL_LOGIN_CODE_MAX_ATTEMPTS }
              }
            })
            if (consumed.count !== 1) return null

            const isConfiguredAdmin = !!process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.trim().toLowerCase()
            if (isConfiguredAdmin) await resolveUserRole(email)

            const user = await prisma.user.findUnique({
              where: { email },
              select: { id: true, email: true, name: true }
            })
            if (!user) return null

            await prisma.user.update({
              where: { id: user.id },
              data: { emailVerified: new Date() }
            })
            return user
          }
        })]
      : []),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        if (!profile.email || profile.email_verified !== true) {
          throw new Error('Google sign-in requires a verified email address')
        }

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture
        }
      }
    })
  ],
  adapter: PrismaAdapter(prisma as any),
  session: {
    strategy: 'jwt' as const
  },
  events: {
    async createUser(message: any) {
      try {
        const userId = message.user?.id
        const email = message.user?.email
        if (!userId || !email) return

        const existingUser = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } })
        if (!existingUser) return

        const roleName = await resolveUserRole(email)
        const role = await prisma.role.findUnique({ where: { name: roleName } })

        if (!existingUser.roleId && role) {
          await prisma.user.update({
            where: { id: userId },
            data: { role: { connect: { id: role.id } } }
          })
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('createUser event error', err)
      }
    }
  },
  callbacks: {
    async jwt({ token, user }) {
      const email = user?.email || token.email || (token as any)?.sub
      if (email) {
        const dbUser = await prisma.user.findUnique({ where: { email } })
        token.role = await resolveUserRole(email)
        token.membershipStatus = dbUser?.membershipStatus || 'not_started'
        token.needsRegistration = !dbUser
      }
      return token
    },
    async session({ session, token }) {
      const role = (token as any)?.role || 'PENDING'
      const membershipStatus = (token as any)?.membershipStatus || 'not_started'
      const needsRegistration = !!(token as any)?.needsRegistration
      ;(session as any).user = (session as any).user || {}
      ;(session as any).user.role = role
      ;(session as any).user.membershipStatus = membershipStatus
      ;(session as any).user.needsRegistration = needsRegistration
      return session
    }
  }
}

export default NextAuth(authOptions as any)
