import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

async function resolveUserRole(email?: string | null) {
  if (!email) return 'MEMBER'

  try {
    const dbUser = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    })

    if (dbUser?.role?.name) return dbUser.role.name

    if (process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) {
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
    // Keep sign-in/session usable when the database is temporarily unavailable.
    console.error('resolveUserRole error', err)
  }

  return 'MEMBER'
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
        token.role = await resolveUserRole(email)
      }
      return token
    },
    async session({ session, token }) {
      const role = (token as any)?.role || 'MEMBER'
      ;(session as any).user = (session as any).user || {}
      ;(session as any).user.role = role
      return session
    }
  }
}

export default NextAuth(authOptions as any)
