import { describe, it, expect } from 'vitest'
import { normalizeCountryCode } from './countryCodes'

describe('normalizeCountryCode', () => {
  it('should return valid codes unchanged', () => {
    expect(normalizeCountryCode('ES')).toBe('ES')
    expect(normalizeCountryCode('US')).toBe('US')
  })

  it('should trim and uppercase', () => {
    expect(normalizeCountryCode(' es ')).toBe('ES')
    expect(normalizeCountryCode('Gb')).toBe('GB')
  })

  it('should return null for invalid codes', () => {
    expect(normalizeCountryCode('XXX')).toBeNull()
    expect(normalizeCountryCode('12')).toBeNull()
    expect(normalizeCountryCode('UK')).toBeNull()
    expect(normalizeCountryCode('Spain')).toBeNull()
  })

  it('should return null for empty input', () => {
    expect(normalizeCountryCode('')).toBeNull()
    expect(normalizeCountryCode('   ')).toBeNull()
    expect(normalizeCountryCode(undefined)).toBeNull()
    expect(normalizeCountryCode(null)).toBeNull()
  })
})
