import { describe, it, expect } from 'vitest'
import { filterMessageFields, MESSAGE_FIELDS } from './messageFields'

describe('MESSAGE_FIELDS', () => {
  it('should be sorted alphabetically and include the new lead fields', () => {
    expect(MESSAGE_FIELDS).toEqual([...MESSAGE_FIELDS].sort())
    expect(MESSAGE_FIELDS).toEqual(expect.arrayContaining(['phoneNumber', 'yearsInRole', 'linkedinUrl']))
  })
})

describe('filterMessageFields', () => {
  it('should match fields case-insensitively', () => {
    expect(filterMessageFields('PHONE')).toEqual(['phoneNumber'])
  })

  it('should return an empty list when nothing matches', () => {
    expect(filterMessageFields('xyz')).toEqual([])
  })
})
