import { describe, it, expect } from 'vitest'
import { formatVerifyEmailsResult } from './verifyEmailsMessage'

const failed = (leadId: number, leadName: string) => ({
  leadId,
  leadName,
  error: 'Workflow execution failed',
})

describe('formatVerifyEmailsResult', () => {
  it('should report a single verified email', () => {
    expect(formatVerifyEmailsResult({ verifiedCount: 1, errors: [] })).toEqual([
      { type: 'success', message: 'Verified 1 email' },
    ])
  })

  it('should report several verified emails', () => {
    expect(formatVerifyEmailsResult({ verifiedCount: 3, errors: [] })).toEqual([
      { type: 'success', message: 'Verified 3 emails' },
    ])
  })

  it('should report successes and failures as separate toasts', () => {
    expect(formatVerifyEmailsResult({ verifiedCount: 2, errors: [failed(1, 'Jane Smith')] })).toEqual([
      { type: 'success', message: 'Verified 2 emails' },
      { type: 'error', message: "Couldn't verify 1 email: Jane Smith" },
    ])
  })

  it('should report only the failure when all verifications failed', () => {
    expect(
      formatVerifyEmailsResult({ verifiedCount: 0, errors: [failed(1, 'Jane Smith'), failed(2, 'John Doe')] })
    ).toEqual([{ type: 'error', message: "Couldn't verify 2 emails: Jane Smith, John Doe" }])
  })

  it('should report zero verified emails when there are no results', () => {
    expect(formatVerifyEmailsResult({ verifiedCount: 0, errors: [] })).toEqual([
      { type: 'success', message: 'Verified 0 emails' },
    ])
  })
})
