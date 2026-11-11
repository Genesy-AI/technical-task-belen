import { LeadsVerifyEmailsOutput } from '../api/types/leads/verifyEmails'

export type VerifyEmailsToast = { type: 'success' | 'error'; message: string }

const pluralizeEmails = (count: number) => `${count} ${count === 1 ? 'email' : 'emails'}`

/** Returns one toast per outcome (successes first, then failures) so mixed results stay readable. */
export const formatVerifyEmailsResult = ({
  verifiedCount,
  errors,
}: Pick<LeadsVerifyEmailsOutput, 'verifiedCount' | 'errors'>): VerifyEmailsToast[] => {
  const toasts: VerifyEmailsToast[] = []

  if (verifiedCount > 0 || errors.length === 0) {
    toasts.push({ type: 'success', message: `Verified ${pluralizeEmails(verifiedCount)}` })
  }

  if (errors.length > 0) {
    const failedNames = errors.map((error) => error.leadName).join(', ')
    toasts.push({
      type: 'error',
      message: `Couldn't verify ${pluralizeEmails(errors.length)}: ${failedNames}`,
    })
  }

  return toasts
}
