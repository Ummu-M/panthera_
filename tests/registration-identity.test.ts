import test from 'node:test'
import assert from 'node:assert/strict'
import { createRegistrationIdentityKey, isSameRegistrant } from '../lib/registration-identity'

test('identity keys normalize registration numbers and Kenyan phone formats', () => {
  assert.equal(
    createRegistrationIdentityKey({ registrationNumber: ' ab/123 ', name: 'Alex', phone: '0712 345 678' }),
    createRegistrationIdentityKey({ registrationNumber: 'AB123', name: 'Different Name', phone: '+254 712 345 678' })
  )
})

test('name and phone identify a registrant when no registration number is supplied', () => {
  assert.equal(
    createRegistrationIdentityKey({ name: 'Alex Kimani', phone: '0712 345 678' }),
    createRegistrationIdentityKey({ name: ' alex-kimani ', phone: '+254712345678' })
  )
  assert.equal(isSameRegistrant(
    { name: 'Alex Kimani', phone: '0712 345 678' },
    { name: 'alex-kimani', phone: '+254712345678' }
  ), true)
})

test('incomplete details do not create a secondary identity key', () => {
  assert.equal(createRegistrationIdentityKey({ name: 'Alex Kimani' }), null)
  assert.equal(createRegistrationIdentityKey({ phone: '0712 345 678' }), null)
})