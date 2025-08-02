/**
 * Format currency in Indonesian Rupiah
 * @param amount Amount in cents (smallest currency unit)
 * @returns Formatted currency string
 */
export function formatIDR(amount: number): string {
  // Convert from cents to rupiah
  const rupiah = amount / 100
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rupiah)
}

/**
 * Format number with Indonesian thousand separators
 * @param amount Amount to format
 * @returns Formatted number string
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount)
}

/**
 * Parse formatted IDR string back to cents
 * @param formatted Formatted currency string
 * @returns Amount in cents
 */
export function parseIDR(formatted: string): number {
  // Remove currency symbol and separators, then convert to number
  const cleaned = formatted.replace(/[^\d]/g, '')
  const rupiah = parseInt(cleaned, 10) || 0
  
  // Convert to cents
  return rupiah * 100
}