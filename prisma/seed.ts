import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const roles = [
    { name: 'SYSTEM_ADMIN', label: 'System Administrator' },
    { name: 'MEMBER', label: 'Member' },
    { name: 'SECRETARY', label: 'Secretary' },
    { name: 'OG', label: 'Organizing Secretary' },
    { name: 'TREASURER', label: 'Treasurer' },
    { name: 'QUARTERMASTER', label: 'Quartermaster' },
    { name: 'DISCIPLINARIAN', label: 'Disciplinarian' },
    { name: 'CREW_LEADER', label: 'Crew Leader' },
    { name: 'ASSISTANT_CREW_LEADER', label: 'Assistant Crew Leader' }
  ]

  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: r
    })
  }

  // Create a hidden system admin user (use env var for email)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'System Admin',
      role: { connect: { name: 'SYSTEM_ADMIN' } }
    }
  })

  console.log('Seed finished')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
