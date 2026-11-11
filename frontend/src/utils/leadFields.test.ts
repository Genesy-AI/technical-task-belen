import { describe, it, expect } from 'vitest'
import {
  getLinkedinHandle,
  normalizeLinkedinUrl,
  normalizePhoneNumber,
  normalizeYearsInRole,
} from './leadFields'

describe('normalizeYearsInRole', () => {
  it('should parse a whole number', () => {
    expect(normalizeYearsInRole('10')).toBe(10)
  })

  it('should return null for a non-numeric value', () => {
    expect(normalizeYearsInRole('abc')).toBeNull()
  })
})

describe('normalizeLinkedinUrl', () => {
  it('should accept a LinkedIn URL and add the scheme', () => {
    expect(normalizeLinkedinUrl('linkedin.com/in/johndoe')).toBe('https://linkedin.com/in/johndoe')
  })

  it('should return null for a non-LinkedIn URL', () => {
    expect(normalizeLinkedinUrl('https://example.com/johndoe')).toBeNull()
  })
})

describe('normalizePhoneNumber', () => {
  it('should keep a valid phone number as-is', () => {
    expect(normalizePhoneNumber('(760)551-9973x6454')).toBe('(760)551-9973x6454')
  })

  it('should return null for text that is not a phone number', () => {
    expect(normalizePhoneNumber('call me')).toBeNull()
  })
})

describe('getLinkedinHandle', () => {
  it('should return the last path segment as the handle', () => {
    expect(getLinkedinHandle('https://www.linkedin.com/in/johndoe/')).toBe('/johndoe')
  })
})
