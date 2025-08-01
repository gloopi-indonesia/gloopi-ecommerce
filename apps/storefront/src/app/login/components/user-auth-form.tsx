'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { isEmailValid } from '@persepolis/regex'
import { EyeIcon, EyeOffIcon, Loader, UserPlusIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { toast } from 'react-hot-toast'

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
   const [isLoading, setIsLoading] = React.useState<boolean>(false)
   const [email, setEmail] = React.useState('')
   const [password, setPassword] = React.useState('')
   const [showPassword, setShowPassword] = React.useState(false)
   const [error, setError] = React.useState('')
   const router = useRouter()

   async function onSubmit(event: React.FormEvent) {
      event.preventDefault()
      setError('')
      
      if (!isEmailValid(email)) {
         setError('Email tidak valid')
         return
      }

      if (!password) {
         setError('Password diperlukan')
         return
      }

      try {
         setIsLoading(true)

         const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
         })

         const data = await response.json()

         if (response.ok) {
            toast.success(data.message || 'Login berhasil')
            router.push('/')
            router.refresh()
         } else {
            setError(data.error || 'Login gagal')
         }
      } catch (error) {
         console.error('Login error:', error)
         setError('Terjadi kesalahan. Silakan coba lagi.')
      } finally {
         setIsLoading(false)
      }
   }

   return (
      <div className={cn('grid gap-6', className)} {...props}>
         <form onSubmit={onSubmit}>
            <div className="grid gap-4">
               <div className="grid gap-1">
                  <Label
                     className="text-sm font-light text-foreground/60"
                     htmlFor="email"
                  >
                     Email
                  </Label>
                  <Input
                     id="email"
                     placeholder="nama@email.com"
                     type="email"
                     autoCapitalize="none"
                     autoComplete="email"
                     autoCorrect="off"
                     disabled={isLoading}
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                  />
               </div>
               <div className="grid gap-1">
                  <Label
                     className="text-sm font-light text-foreground/60"
                     htmlFor="password"
                  >
                     Password
                  </Label>
                  <div className="relative">
                     <Input
                        id="password"
                        placeholder="Password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        disabled={isLoading}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                     />
                     <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                     >
                        {showPassword ? (
                           <EyeOffIcon className="h-4 w-4" />
                        ) : (
                           <EyeIcon className="h-4 w-4" />
                        )}
                     </Button>
                  </div>
               </div>
               {error && (
                  <p className="text-sm text-red-600">{error}</p>
               )}
               <Button disabled={isLoading} type="submit">
                  {isLoading && <Loader className="mr-2 h-4 animate-spin" />}
                  Masuk
               </Button>
            </div>
         </form>
         
         <div className="relative">
            <div className="absolute inset-0 flex items-center">
               <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
               <span className="bg-background px-2 text-muted-foreground">
                  Atau
               </span>
            </div>
         </div>
         
         <Button variant="outline" asChild>
            <Link href="/register">
               <UserPlusIcon className="mr-2 h-4 w-4" />
               Daftar Akun Baru
            </Link>
         </Button>
      </div>
   )
}
