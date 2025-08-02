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