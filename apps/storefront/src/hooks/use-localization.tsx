/**
 * Indonesian Localization Hook for Storefront
 * Provides easy access to localization functions in React components
 */

import { useMemo } from 'react'
import {
  formatIDR,
  formatIDRNumber,
  formatIDRCompact,
  formatIDRRange,
  formatPercentage,
} from '@/lib/localization/currency'
import {
  formatIndonesianDate,
  formatIndonesianDateTime,
  formatRelativeTime,
  formatBusinessDate,
  formatDateRange,
} from '@/lib/localization/date'
import {
  formatIndonesianNumber,
  formatCompactNumber,
  formatIndonesianPercentage,
  formatQuantity,
  formatFileSize,
  formatIndonesianPhoneNumber,
} from '@/lib/localization/number'
import {
  getErrorMessage,
  getSuccessMessage,
  getStatusMessage,
  getUILabel,
  getFormLabel,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  STATUS_MESSAGES,
  UI_LABELS,
  FORM_LABELS,
  VALIDATION_MESSAGES,
} from '@/lib/localization/messages'
import {
  formatBusinessDocument,
  generateQuotationNumber,
  generateOrderNumber,
  generateInvoiceNumber,
} from '@/lib/localization/business-documents'

export function useLocalization() {
  const localization = useMemo(() => ({
    // Currency formatting
    currency: {
      format: formatIDR,
      formatNumber: formatIDRNumber,
      formatCompact: formatIDRCompact,
      formatRange: formatIDRRange,
      formatPercentage,
    },

    // Date formatting
    date: {
      format: formatIndonesianDate,
      formatDateTime: formatIndonesianDateTime,
      formatRelative: formatRelativeTime,
      formatBusiness: formatBusinessDate,
      formatRange: formatDateRange,
    },

    // Number formatting
    number: {
      format: formatIndonesianNumber,
      formatCompact: formatCompactNumber,
      formatPercentage: formatIndonesianPercentage,
      formatQuantity,
      formatFileSize,
      formatPhone: formatIndonesianPhoneNumber,
    },

    // Messages and labels
    messages: {
      error: getErrorMessage,
      success: getSuccessMessage,
      status: getStatusMessage,
      ui: getUILabel,
      formLabel: getFormLabel,
      // Direct access to message constants
      ERROR_MESSAGES,
      SUCCESS_MESSAGES,
      STATUS_MESSAGES,
      UI_LABELS,
      FORM_LABELS,
      VALIDATION_MESSAGES,
    },

    // Business documents
    documents: {
      format: formatBusinessDocument,
      generateQuotationNumber,
      generateOrderNumber,
      generateInvoiceNumber,
    },
  }), [])

  return localization
}

// Type definitions for better TypeScript support
export type LocalizationHook = ReturnType<typeof useLocalization>
export type CurrencyFormatter = LocalizationHook['currency']
export type DateFormatter = LocalizationHook['date']
export type NumberFormatter = LocalizationHook['number']
export type MessageProvider = LocalizationHook['messages']
export type DocumentFormatter = LocalizationHook['documents']