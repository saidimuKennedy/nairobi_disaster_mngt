
export function isValidPhone(phone: string): boolean {
  return /^\+?254\d{9}$/.test(phone);
}

export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}
