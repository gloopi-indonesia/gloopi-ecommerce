/**
 * Legacy currency utilities - use localization/currency.ts for new code
 * These functions are kept for backward compatibility
 */

// Re-export from the new localization system
export {
  formatIDR,
  formatIDRNumber,
  formatIDRCompact,
  parseIDRToCents,
  rupiahToCents,
  centsToRupiah,
  formatIDRRange,
  formatPercentage,
} from '../localization/currency'

// Import for internal use
import { formatIDR as formatIDRInternal } from '../localization/currency'

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

/**
 * Get best price from pricing tiers
 * @param pricingTiers Array of pricing tiers
 * @param quantity Quantity to check
 * @returns Best price in cents
 */
export function getBestPrice(pricingTiers: Array<{ minQuantity: number; maxQuantity?: number; pricePerUnit: number }>, quantity: number): number {
  // Find the appropriate pricing tier for the given quantity
  const applicableTier = pricingTiers
    .filter(tier => 
      quantity >= tier.minQuantity && 
      (tier.maxQuantity === undefined || quantity <= tier.maxQuantity)
    )
    .sort((a, b) => a.pricePerUnit - b.pricePerUnit)[0]
  
  return applicableTier ? applicableTier.pricePerUnit : pricingTiers[0]?.pricePerUnit || 0
}

/**
 * Format price range
 * @param minPrice Minimum price in cents
 * @param maxPrice Maximum price in cents
 * @returns Formatted price range string
 */
export function formatPriceRange(minPrice: number, maxPrice: number): string {
  if (minPrice === maxPrice) {
    return formatIDRInternal(minPrice)
  }
  return `${formatIDRInternal(minPrice)} - ${formatIDRInternal(maxPrice)}`
}