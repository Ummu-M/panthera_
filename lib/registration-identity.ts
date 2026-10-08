import { createHash } from 'node:crypto'

function normalizeName(value: unknown) {
  return typeof value === 'string'
    ? value.normalize('NFKC').toLowerCase().replace(/[^a-z0-9]/g, '')
    : ''
}

function normalizeRegistrationNumber(value: unknown) {
  return typeof value === 'string'
    ? value.normalize('NFKC').toUpperCase().replace(/[^A-Z0-9]/g, '')
    : ''
}

function normalizePhone(value: unknown) {
  const digits = typeof value === 'string' ? value.replace(/\D/g, '') : ''
  if (digits.startsWith('254')) return digits
  if (digits.startsWith('0')) return `254${digits.slice(1)}`
  return digits
}

export function createRegistrationIdentityKey(details: {
  name?: unknown
  phone?: unknown
  registrationNumber?: unknown
}) {
  const registrationNumber = normalizeRegistrationNumber(details.registrationNumber)
  const name = normalizeName(details.name)
  const phone = normalizePhone(details.phone)
  const identity = registrationNumber
    ? `registration:${registrationNumber}`
    : name && phone
      ? `person:${name}:${phone}`
      : ''

  return identity ? createHash('sha256').update(identity).digest('hex') : null
}

export function isSameRegistrant(
  first: { name?: unknown; phone?: unknown; registrationNumber?: unknown },
  second: { name?: unknown; phone?: unknown; registrationNumber?: unknown }
) {
  const firstRegistrationNumber = normalizeRegistrationNumber(first.registrationNumber)
  const secondRegistrationNumber = normalizeRegistrationNumber(second.registrationNumber)
  if (firstRegistrationNumber && firstRegistrationNumber === secondRegistrationNumber) return true

  const firstName = normalizeName(first.name)
  const secondName = normalizeName(second.name)
  const firstPhone = normalizePhone(first.phone)
  const secondPhone = normalizePhone(second.phone)

  return !!firstName && !!firstPhone && firstName === secondName && firstPhone === secondPhone
}