const REPORT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp'
])

export const MAX_REPORT_FILE_SIZE_BYTES = 10 * 1024 * 1024

export function isSafeReportDataUrl(value: unknown) {
  if (typeof value !== 'string') return false
  const prefix = value.match(/^data:([^;,]+);base64,/i)
  if (!prefix || !REPORT_MIME_TYPES.has(prefix[1].toLowerCase())) return false

  const encoded = value.slice(prefix[0].length)
  if (!encoded || encoded.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) return false
  const padding = encoded.endsWith('==') ? 2 : encoded.endsWith('=') ? 1 : 0
  const fileSize = encoded.length * 3 / 4 - padding
  return fileSize <= MAX_REPORT_FILE_SIZE_BYTES
}

export function canAssignRole(actorRole: string, requestedRole: string, membershipStatus: string | null | undefined) {
  return ANNUAL_ROLE_ASSIGNER_ROLES.some((role) => role === actorRole)
    && requestedRole.length > 0
    && requestedRole !== 'SYSTEM_ADMIN'
    && membershipStatus?.toLowerCase() === 'approved'
}

export function isSameOriginRequest(origin: string | undefined, host: string | undefined) {
  if (!origin || !host) return true
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}
import { ANNUAL_ROLE_ASSIGNER_ROLES } from '@/lib/leadership'
