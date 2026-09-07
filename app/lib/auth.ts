import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

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

    if (dbUser.role?.name) return dbUser.role.name

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
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
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
