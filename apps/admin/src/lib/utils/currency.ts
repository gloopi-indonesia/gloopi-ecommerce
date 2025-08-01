/**
 * Format IDR currency with proper Indonesian formatting
 */
export function formatIDR(amountInCents: number): string {
  const amount = amountInCents / 100
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format IDR currency without currency symbol
 */
export function formatIDRNumber(amountInCents: number): string {
  const amount = amountInCents / 100
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Parse IDR string to cents
 */
export function parseIDRToCents(idrString: string): number {
  // Remove currency symbols and separators
  const cleanString = idrString.replace(/[Rp\s.,]/g, '')
  const amount = parseFloat(cleanString) || 0
  return Math.round(amount * 100)
}

/**
 * Convert rupiah to cents
 */
export function rupiahToCents(rupiah: number): number {
  return Math.round(rupiah * 100)
}

/**
 * Convert cents to rupiah
 */
export function centsToRupiah(cents: number): number {
  return cents / 100
}