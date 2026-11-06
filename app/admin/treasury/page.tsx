import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/auth'
import { prisma } from '@/lib/prisma'
import { theme } from '@/lib/theme'
import TreasuryPanel from './TreasuryPanel'
import { getTreasuryEntries, normalizeTreasuryQuery } from '@/lib/treasury-list'
import { PageHeader } from '@/app/components/admin/AdminUI'

const C = theme

type TreasuryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function TreasuryPage({ searchParams }: TreasuryPageProps) {
  const session = await getServerSession(authOptions as any)
  const role = (session as any)?.user?.role

  if (role !== 'SYSTEM_ADMIN' && role !== 'SECRETARY' && role !== 'TREASURER' && role !== 'RSL') {
    return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: C.forest950, color: C.text }}>Access denied</main>
  }

  const query = normalizeTreasuryQuery(await searchParams)
  const [result, summary, entryCount] = await Promise.all([
    getTreasuryEntries(query),
    prisma.payment.groupBy({
      by: ['type'],
      where: { status: { not: 'pending' } },
      _sum: { amount: true }
    }),
    prisma.payment.count()
  ])
  const income = summary.filter((item) => item.type !== 'expense').reduce((total, item) => total + (item._sum.amount || 0), 0)
  const expenses = summary.filter((item) => item.type === 'expense').reduce((total, item) => total + (item._sum.amount || 0), 0)

  return (
    <main style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${C.forest950} 0%, ${C.forest900} 100%)`, color: C.text, padding: '32px 24px', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <PageHeader eyebrow="Kenyatta University Panthera Rover Crew" title="Treasury" description="Track income, expenses, and the crew balance." />
        <TreasuryPanel
          initialPayments={result.items.map((payment) => ({ ...payment, createdAt: payment.createdAt.toISOString() }))}
          initialTotal={result.total}
          entryCount={entryCount}
          income={income}
          expenses={expenses}
          page={result.page}
          pageSize={result.pageSize}
        />
      </div>
    </main>
  )
}
