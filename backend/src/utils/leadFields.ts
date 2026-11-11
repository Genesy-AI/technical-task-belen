// Normalizers for optional lead fields. Each returns null when the value is empty or invalid.
// Keep in sync with frontend/src/utils/leadFields.ts

const MAX_YEARS_IN_ROLE = 100
const MIN_PHONE_DIGITS = 7

/** Whole number of years between 0 and 100, given as a number or a numeric string. */
export const normalizeYearsInRole = (value: unknown): number | null => {
  const text = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : ''
  if (!/^\d+$/.test(text)) return null

  const years = Number(text)
  return years <= MAX_YEARS_IN_ROLE ? years : null
}

/** A linkedin.com URL (any subdomain). Adds https:// when no scheme is given. */
export const normalizeLinkedinUrl = (value?: string | null): string | null => {
  const text = value?.trim()
  if (!text) return null

  const withScheme = /^https?:\/\//i.test(text) ? text : `https://${text}`
  try {
    const { hostname } = new URL(withScheme)
    const isLinkedin = hostname === 'linkedin.com' || hostname.endsWith('.linkedin.com')
    return isLinkedin ? withScheme : null
  } catch {
    return null
  }
}

/** Keeps the original format; allows digits, spaces, + - ( ) . and an optional x/ext extension. */
export const normalizePhoneNumber = (value?: string | null): string | null => {
  const text = value?.trim()
  if (!text) return null

  const match = text.match(/^(\+?[\d\s().-]+?)\s*(?:(?:x|ext\.?)\s*\d+)?$/i)
  if (!match) return null

  const digitCount = match[1].replace(/\D/g, '').length
  return digitCount >= MIN_PHONE_DIGITS ? text : null
}
