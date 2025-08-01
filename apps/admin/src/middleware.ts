import { verifyJWT } from '@/lib/jwt'
import { getErrorResponse } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
   // Skip authentication for auth routes
   if (req.nextUrl.pathname.startsWith('/api/auth')) {
      return NextResponse.next()
   }

   // Skip authentication for login page
   if (req.nextUrl.pathname === '/login') {
      return NextResponse.next()
   }

   function isTargetingAPI() {
      return req.nextUrl.pathname.startsWith('/api')
   }

   function getToken() {
      let token: string | undefined

      if (req.cookies.has('token')) {
         token = req.cookies.get('token')?.value
      } else if (req.headers.get('Authorization')?.startsWith('Bearer ')) {
         token = req.headers.get('Authorization')?.substring(7)
      }

      return token
   }

   if (!process.env.JWT_SECRET_KEY) {
      console.error('JWT secret key is missing')
      return getErrorResponse(500, 'Internal Server Error')
   }

   const token = getToken()

   if (!token) {
      if (isTargetingAPI()) {
         return getErrorResponse(401, 'Token tidak ditemukan')
      }

      return NextResponse.redirect(new URL('/login', req.url))
   }

   const response = NextResponse.next()

   try {
      const { sub } = await verifyJWT<{ sub: string }>(token)
      response.headers.set('X-USER-ID', sub)
   } catch (error) {
      console.error('JWT verification failed:', error)
      
      if (isTargetingAPI()) {
         return getErrorResponse(401, 'Token tidak valid')
      }

      const redirect = NextResponse.redirect(new URL('/login', req.url))
      redirect.cookies.delete('token')
      redirect.cookies.delete('logged-in')
      return redirect
   }

   return response
}

export const config = {
   matcher: [
      '/',
      '/products/:path*',
      '/banners/:path*',
      '/orders/:path*',
      '/categories/:path*',
      '/payments/:path*',
      '/codes/:path*',
      '/users/:path*',
      '/api/:path*',
   ],
}
