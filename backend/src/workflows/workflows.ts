import { proxyActivities } from '@temporalio/workflow'
import type * as activities from './activities'

const { verifyEmail } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 second',
  // Without an explicit policy Temporal retries forever, so a slow provider would never return a result.
  retry: { maximumAttempts: 2, initialInterval: '200 milliseconds' },
})

export async function verifyEmailWorkflow(email: string): Promise<boolean> {
  return await verifyEmail(email)
}
