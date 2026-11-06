import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type TreasuryQuery = {
  q: string
  type: 'all' | 'income' | 'expense'
  status: 'all' | 'recorded' | 'pending'
  from: string
  to: string
  sort: 'createdAt' | 'amount' | 'purpose'
  direction: 'asc' | 'desc'
  page: number
  pageSize: number
}

type QueryInput = Record<string, string | string[] | undefined>

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || '' : value || ''
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00.000Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

export function normalizeTreasuryQuery(input: QueryInput): TreasuryQuery {
  const typeValue = firstValue(input.type)
  const statusValue = firstValue(input.status)
  const sortValue = firstValue(input.sort)
  const directionValue = firstValue(input.direction)
  const pageValue = Number.parseInt(firstValue(input.page), 10)

  return {
    q: firstValue(input.q).trim().slice(0, 100),
    type: typeValue === 'income' || typeValue === 'expense' ? typeValue : 'all',
    status: statusValue === 'recorded' || statusValue === 'pending' ? statusValue : 'all',
    from: isValidDate(firstValue(input.from)) ? firstValue(input.from) : '',
    to: isValidDate(firstValue(input.to)) ? firstValue(input.to) : '',
    sort: sortValue === 'amount' || sortValue === 'purpose' ? sortValue : 'createdAt',
    direction: directionValue === 'asc' ? 'asc' : 'desc',
    page: Number.isFinite(pageValue) && pageValue > 0 ? Math.min(pageValue, 100000) : 1,
    pageSize: 20
  }
}

function treasuryWhere(query: TreasuryQuery): Prisma.PaymentWhereInput {
  const clauses: Prisma.PaymentWhereInput[] = []

  if (query.type !== 'all') clauses.push({ type: query.type })
  if (query.status !== 'all') clauses.push({ status: query.status })

  if (query.from || query.to) {
    clauses.push({
      createdAt: {
        ...(query.from ? { gte: new Date(`${query.from}T00:00:00.000Z`) } : {}),
        ...(query.to ? { lte: new Date(`${query.to}T23:59:59.999Z`) } : {})
      }
    })
  }

  if (query.q) {
    const numericQuery = Number(query.q)
    clauses.push({
      OR: [
        { purpose: { contains: query.q, mode: 'insensitive' } },
        { category: { contains: query.q, mode: 'insensitive' } },
        { userId: { contains: query.q, mode: 'insensitive' } },
        ...(Number.isFinite(numericQuery) ? [{ amount: numericQuery }] : [])
      ]
    })
  }

  return clauses.length ? { AND: clauses } : {}
}

export async function getTreasuryEntries(query: TreasuryQuery) {
  const where = treasuryWhere(query)
  const [total, payments] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      orderBy: query.sort === 'createdAt'
        ? [{ createdAt: query.direction }, { id: 'desc' }]
        : [{ [query.sort]: query.direction }, { createdAt: 'desc' }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize
    })
  ])
  const page = Math.min(query.page, Math.max(1, Math.ceil(total / query.pageSize)))
  const entries = page === query.page ? payments : await prisma.payment.findMany({
    where,
    orderBy: query.sort === 'createdAt'
      ? [{ createdAt: query.direction }, { id: 'desc' }]
      : [{ [query.sort]: query.direction }, { createdAt: 'desc' }],
    skip: (page - 1) * query.pageSize,
    take: query.pageSize
  })

  const userIds = [...new Set(entries.map((payment) => payment.userId))]
  const users = userIds.length
    ? await prisma.user.findMany({
      where: { OR: [{ email: { in: userIds } }, { id: { in: userIds } }] },
      select: { id: true, email: true, name: true }
    })
    : []
  const usersByIdentifier = new Map<string, (typeof users)[number]>()
  for (const user of users) {
    usersByIdentifier.set(user.id, user)
    usersByIdentifier.set(user.email, user)
  }

  return {
    items: entries.map((payment) => {
      const recorder = usersByIdentifier.get(payment.userId)
      return { ...payment, recordedBy: recorder?.name?.trim() || recorder?.email || payment.userId }
    }),
    total,
    page,
    pageSize: query.pageSize
  }
}
