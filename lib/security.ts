const REPORT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/webp'
])

const MAX_REPORT_DATA_URL_LENGTH = 10 * 1024 * 1024

export function isSafeReportDataUrl(value: unknown) {
  if (typeof value !== 'string' || value.length > MAX_REPORT_DATA_URL_LENGTH) return false
  const match = value.match(/^data:([^;,]+);base64,[A-Za-z0-9+/=]+$/i)
  return !!match && REPORT_MIME_TYPES.has(match[1].toLowerCase())
}

export function canAssignRole(actorRole: string, requestedRole: string) {
  return actorRole === 'SYSTEM_ADMIN' && requestedRole !== 'SYSTEM_ADMIN'
}

export function isSameOriginRequest(origin: string | undefined, host: string | undefined) {
  if (!origin || !host) return true
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}