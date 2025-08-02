'use client'

import { validateBoolean } from '@/lib/utils'
import { useEffect, useState } from 'react'

export function useAuthenticated() {
   const [authenticated, setAuthenticated] = useState(null)

   useEffect(() => {
      try {
         if (typeof window !== 'undefined' && window.localStorage) {
            const cookies = document.cookie.split(';')
            const loggedInCookie =
               cookies
                  .find((cookie) => cookie.startsWith('logged-in'))
                  .split('=')[1] === 'true'

            setAuthenticated(loggedInCookie ?? false)
         }
      } catch (error) {
         console.error({ error })
      }
   }, [])

   return { authenticated: validateBoolean(authenticated, true) }
}

export function useAuthentication() {
   const [customer, setCustomer] = useState<any>(null)
   const [isLoading, setIsLoading] = useState(true)

   useEffect(() => {
      fetchCustomer()
   }, [])

   const fetchCustomer = async () => {
      try {
         setIsLoading(true)
         const response = await fetch('/api/auth/me')
         
         if (response.ok) {
            const data = await response.json()
            setCustomer(data.customer)
         } else {
            setCustomer(null)
         }
      } catch (error) {
         console.error('Auth check error:', error)
         setCustomer(null)
      } finally {
         setIsLoading(false)
      }
   }

   return { customer, isLoading, refetch: fetchCustomer }
}
