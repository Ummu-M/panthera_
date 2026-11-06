export const TREASURY_TYPE_LABELS = {
  income: 'Income',
  expense: 'Expense'
} as const

export function formatCrewDate(value: Date | string | null | undefined): string {
  if (!value) return '—'

  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Nairobi' }).format(date)
}

export function formatKSh(value: number): string {
  const amount = Number.isFinite(value) ? value : 0
  return `KSh ${new Intl.NumberFormat('en-KE', { maximumFractionDigits: 2 }).format(amount)}`
}
