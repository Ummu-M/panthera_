export const BADGE_PROGRESS_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'] as const
const badgeProgressStatusSet: ReadonlySet<string> = new Set(BADGE_PROGRESS_STATUSES)

export type BadgeProgressStatus = (typeof BADGE_PROGRESS_STATUSES)[number]

export function isBadgeProgressStatus(value: unknown): value is BadgeProgressStatus {
  return typeof value === 'string' && badgeProgressStatusSet.has(value)
}

export function resolveBadgeProgressStatus(
  progressStatus: unknown,
  legacyStatus?: unknown
): BadgeProgressStatus {
  if (isBadgeProgressStatus(progressStatus)) return progressStatus
  return legacyStatus === 'APPROVED' ? 'COMPLETED' : 'IN_PROGRESS'
}

export function badgeProgressLabel(value: unknown, legacyStatus?: unknown): string {
  const status = resolveBadgeProgressStatus(value, legacyStatus)
  if (status === 'COMPLETED') return 'Completed'
  return status === 'NOT_STARTED' ? 'Not started' : 'In progress'
}
