/**
 * Indonesian Number Formatting Utilities
 * Handles number formatting according to Indonesian conventions
 */

/**
 * Format number with Indonesian thousand separators
 * @param value - Number to format
 * @param decimals - Number of decimal places
 */
export function formatIndonesianNumber(
  value: number,
  decimals: number = 0
): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format large numbers in compact Indonesian format
 * @param value - Number to format
 * @param decimals - Number of decimal places for compact notation
 */
export function formatCompactNumber(
  value: number,
  decimals: number = 1
): string {
  if (value >= 1000000000) {
    return `${formatIndonesianNumber(value / 1000000000, decimals)} M`
  } else if (value >= 1000000) {
    return `${formatIndonesianNumber(value / 1000000, decimals)} jt`
  } else if (value >= 1000) {
    return `${formatIndonesianNumber(value / 1000, decimals)} rb`
  }
  
  return formatIndonesianNumber(value, 0)
}

/**
 * Format percentage in Indonesian format
 */
export function formatIndonesianPercentage(
  value: number,
  decimals: number = 1
): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100)
}

/**
 * Format decimal number with Indonesian decimal separator (comma)
 */
export function formatDecimal(
  value: number,
  decimals: number = 2
): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: false,
  }).format(value)
}

/**
 * Parse Indonesian number string to number
 * Handles Indonesian thousand separators and decimal separators
 */
export function parseIndonesianNumber(numberString: string): number {
  // Remove thousand separators (dots) and convert decimal separator (comma to dot)
  const cleanString = numberString
    .replace(/\./g, '') // Remove thousand separators
    .replace(',', '.') // Convert decimal separator
    .replace(/[^\d.-]/g, '') // Remove any other non-numeric characters
  
  return parseFloat(cleanString) || 0
}

/**
 * Format ordinal numbers in Indonesian
 */
export function formatOrdinal(value: number): string {
  if (value === 1) {
    return `ke-${value} (pertama)`
  } else if (value === 2) {
    return `ke-${value} (kedua)`
  } else if (value === 3) {
    return `ke-${value} (ketiga)`
  } else {
    return `ke-${value}`
  }
}

/**
 * Format quantity with Indonesian unit names
 */
export function formatQuantity(
  value: number,
  unit: 'piece' | 'box' | 'pack' | 'kg' | 'gram' | 'liter' | 'meter'
): string {
  const unitNames = {
    piece: value === 1 ? 'buah' : 'buah',
    box: value === 1 ? 'kotak' : 'kotak',
    pack: value === 1 ? 'pak' : 'pak',
    kg: 'kg',
    gram: 'gram',
    liter: 'liter',
    meter: 'meter',
  }

  return `${formatIndonesianNumber(value)} ${unitNames[unit]}`
}

/**
 * Format file size in Indonesian
 */
export function formatFileSize(bytes: number): string {
  const units = ['byte', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${formatIndonesianNumber(size, unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

/**
 * Format phone number in Indonesian format
 */
export function formatIndonesianPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '')
  
  // Handle different Indonesian phone number formats
  if (digits.startsWith('62')) {
    // International format: +62
    const number = digits.slice(2)
    if (number.length >= 9) {
      return `+62 ${number.slice(0, 3)} ${number.slice(3, 7)} ${number.slice(7)}`
    }
  } else if (digits.startsWith('0')) {
    // Domestic format: 0xxx
    if (digits.length >= 10) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 8)} ${digits.slice(8)}`
    }
  }
  
  return phoneNumber // Return original if format not recognized
}

/**
 * Format Indonesian postal code
 */
export function formatPostalCode(postalCode: string): string {
  const digits = postalCode.replace(/\D/g, '')
  
  if (digits.length === 5) {
    return digits
  }
  
  return postalCode // Return original if not 5 digits
}