import { type ClassValue, clsx } from 'clsx'
import { NextResponse } from 'next/server'
import { twMerge } from 'tailwind-merge'
import { ZodError } from 'zod'

export function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs))
}

export const formatter = new Intl.NumberFormat('en-US', {
   style: 'currency',
   currency: 'USD',
   maximumFractionDigits: 2,
})

// Indonesian Rupiah formatter
export const idrFormatter = new Intl.NumberFormat('id-ID', {
   style: 'currency',
   currency: 'IDR',
   maximumFractionDigits: 0,
})

// Format IDR from cents (stored as integers)
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
