import { type ClassValue, clsx } from 'clsx'
import { NextResponse } from 'next/server'
import { twMerge } from 'tailwind-merge'
import { ZodError } from 'zod'

export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs))
}

// Re-export localization utilities for backward compatibility
export { formatIDR, formatIDRNumber, formatIDRCompact } from './localization/currency'
export { formatIndonesianDate, formatIndonesianDateTime, formatRelativeTime } from './localization/date'
export { formatIndonesianNumber, formatCompactNumber } from './localization/number'

// Legacy formatters for backward compatibility
export const formatter = new Intl.NumberFormat('en-US', {
   style: 'currency',
   currency: 'USD',
   maximumFractionDigits: 2,
})

export const idrFormatter = new Intl.NumberFormat('id-ID', {
   style: 'currency',
   currency: 'IDR',
   maximumFractionDigits: 0,
})

// Format IDR from cents (stored as integers) - legacy function
export const formatIDRFromCents = (cents: number): string => {
   return idrFormatter.format(cents / 100)
}

export function getErrorResponse(
   status: number = 500,
   message: string,
   errors: ZodError | null = null
) {
   console.error({ errors, status, message })

   return new NextResponse(
      JSON.stringify({
         status: status < 500 ? 'fail' : 'error',
         message,
         errors: errors ? errors.flatten() : null,
      }),
      {
         status,
         headers: { 'Content-Type': 'application/json' },
      }
   )
}

export function isVariableValid(variable) {
   return variable !== null && variable !== undefined
}
