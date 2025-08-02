/**
 * Indonesian Currency Formatting Utilities
 * Handles IDR currency formatting with proper Indonesian conventions
 */

/**
 * Format IDR currency with proper Indonesian formatting
 * @param amountInCents - Amount in cents (to avoid floating point issues)
 * @param options - Formatting options
 */
export function formatIDR(
  amountInCents: number,
  options: {
    showSymbol?: boolean
    showDecimals?: boolean
    compact?: boolean
  } = {}
): string {
  const { showSymbol = true, showDecimals = false, compact = false } = options
  const amount = amountInCents / 100

  if (compact && amount >= 1000000) {
    const millions = amount / 1000000
    const formatted = new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(millions)
    return showSymbol ? `Rp ${formatted} jt` : `${formatted} jt`
  }

  if (compact && amount >= 1000) {
    const thousands = amount / 1000
    const formatted = new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(thousands)
    return showSymbol ? `Rp ${formatted} rb` : `${formatted} rb`
  }

  const formatter = new Intl.NumberFormat('id-ID', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'IDR',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  })

  return formatter.format(amount)
}

/**
 * Format IDR currency without currency symbol
 */
export function formatIDRNumber(amountInCents: number): string {
  return formatIDR(amountInCents, { showSymbol: false })
}

/**
 * Format IDR currency in compact form (e.g., "1,2 jt" for 1.2 million)
 */
export function formatIDRCompact(amountInCents: number): string {
  return formatIDR(amountInCents, { compact: true })
}

/**
 * Parse IDR string to cents
 * Handles various Indonesian currency formats
 */
export function parseIDRToCents(idrString: string): number {
  // Handle compact formats
  if (idrString.includes('jt')) {
    const value = parseFloat(idrString.replace(/[^0-9,]/g, '').replace(',', '.'))
    return Math.round(value * 1000000 * 100)
  }
  
  if (idrString.includes('rb')) {
    const value = parseFloat(idrString.replace(/[^0-9,]/g, '').replace(',', '.'))
    return Math.round(value * 1000 * 100)
  }

  // Remove currency symbols and separators, handle Indonesian decimal separator
  const cleanString = idrString
    .replace(/[Rp\s]/g, '')
    .replace(/\./g, '') // Remove thousand separators
    .replace(',', '.') // Convert decimal separator
  
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

/**
 * Format price range in IDR
 */
export function formatIDRRange(minCents: number, maxCents: number): string {
  const min = formatIDR(minCents)
  const max = formatIDR(maxCents)
  return `${min} - ${max}`
}

/**
 * Format percentage in Indonesian format
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}