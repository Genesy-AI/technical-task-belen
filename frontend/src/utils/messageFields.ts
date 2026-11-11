// Lead fields that can be used as {placeholders} in message templates.
// Keep in sync with `availableFields` in backend/src/utils/messageGenerator.ts
export const MESSAGE_FIELDS: readonly string[] = [
  'companyName',
  'countryCode',
  'email',
  'firstName',
  'jobTitle',
  'lastName',
  'linkedinUrl',
  'phoneNumber',
  'yearsInRole',
]

/** Case-insensitive match on the field key. An empty query returns all fields. */
export const filterMessageFields = (query: string): string[] => {
  const search = query.trim().toLowerCase()
  return MESSAGE_FIELDS.filter((field) => field.toLowerCase().includes(search))
}
