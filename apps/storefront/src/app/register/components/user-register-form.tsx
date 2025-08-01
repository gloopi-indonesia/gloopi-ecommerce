'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { isEmailValid } from '@persepolis/regex'
import { EyeIcon, EyeOffIcon, Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { toast } from 'react-hot-toast'

interface UserRegisterFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserRegisterForm({ className, ...props }: UserRegisterFormProps) {
   const [isLoading, setIsLoading] = React.useState<boolean>(false)
   const [showPassword, setShowPassword] = React.useState(false)
   const [error, setError] = React.useState('')
   const router = useRouter()

   // Form data
   const [formData, setFormData] = React.useState({
      email: '',
      name: '',
      phone: '',
      password: '',
      confirmPassword: '',
      type: 'B2C' as 'B2B' | 'B2C',
      // Company fields for B2B
      companyName: '',
      companyRegistrationNumber: '',
      companyTaxId: '',
      industry: 'OTHER' as 'MEDICAL' | 'MANUFACTURING' | 'FOOD' | 'OTHER',
      companyAddress: '',
      companyCity: '',
      companyProvince: '',
      companyPostalCode: '',
      contactPerson: '',
   })

   const handleInputChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }))
   }

   const validateForm = () => {
      if (!isEmailValid(formData.email)) {
         setError('Email tidak valid')
         return false
      }

      if (formData.name.length < 2) {
         setError('Nama minimal 2 karakter')
         return false
      }

      if (formData.phone.length < 10) {
         setError('Nomor telepon tidak valid')
         return false
      }

      if (formData.password.length < 6) {
         setError('Password minimal 6 karakter')
         return false
      }

      if (formData.password !== formData.confirmPassword) {
         setError('Konfirmasi password tidak cocok')
         return false
      }

      if (formData.type === 'B2B') {
         if (!formData.companyName) {
            setError('Nama perusahaan diperlukan untuk akun B2B')
            return false
         }
         if (!formData.companyRegistrationNumber) {
            setError('Nomor registrasi perusahaan diperlukan')
            return false
         }
         if (!formData.companyTaxId) {
            setError('NPWP perusahaan diperlukan')
            return false
         }
      }

      return true
   }

   async function onSubmit(event: React.FormEvent) {
      event.preventDefault()
      setError('')
      
      if (!validateForm()) {
         return
      }

      try {
         setIsLoading(true)

         const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
         })

         const data = await response.json()

         if (response.ok) {
            toast.success(data.message || 'Registrasi berhasil')
            router.push('/')
            router.refresh()
         } else {
            setError(data.error || 'Registrasi gagal')
         }
      } catch (error) {
         console.error('Registration error:', error)
         setError('Terjadi kesalahan. Silakan coba lagi.')
      } finally {
         setIsLoading(false)
      }
   }

   return (
      <div className={cn('grid gap-6', className)} {...props}>
         <form onSubmit={onSubmit}>
            <div className="grid gap-4">
               {/* Customer Type */}
               <div className="grid gap-1">
                  <Label className="text-sm font-light text-foreground/60">
                     Jenis Akun
                  </Label>
                  <Select
                     value={formData.type}
                     onValueChange={(value: 'B2B' | 'B2C') => handleInputChange('type', value)}
                     disabled={isLoading}
                  >
                     <SelectTrigger>
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="B2C">Individu (B2C)</SelectItem>
                        <SelectItem value="B2B">Perusahaan (B2B)</SelectItem>
                     </SelectContent>
                  </Select>
               </div>

               {/* Personal Information */}
               <div className="grid gap-1">
                  <Label className="text-sm font-light text-foreground/60" htmlFor="name">
                     Nama Lengkap
                  </Label>
                  <Input
                     id="name"
                     placeholder="Nama lengkap Anda"
                     type="text"
                     disabled={isLoading}
                     value={formData.name}
                     onChange={(e) => handleInputChange('name', e.target.value)}
                     required
                  />
               </div>

               <div className="grid gap-1">
                  <Label className="text-sm font-light text-foreground/60" htmlFor="email">
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
                     value={formData.email}
                     onChange={(e) => handleInputChange('email', e.target.value)}
                     required
                  />
               </div>

               <div className="grid gap-1">
                  <Label className="text-sm font-light text-foreground/60" htmlFor="phone">
                     Nomor Telepon
                  </Label>
                  <Input
                     id="phone"
                     placeholder="08123456789"
                     type="tel"
                     disabled={isLoading}
                     value={formData.phone}
                     onChange={(e) => handleInputChange('phone', e.target.value)}
                     required
                  />
               </div>

               {/* Company Information for B2B */}
               {formData.type === 'B2B' && (
                  <>
                     <div className="border-t pt-4">
                        <h3 className="text-sm font-medium mb-3">Informasi Perusahaan</h3>
                        
                        <div className="grid gap-4">
                           <div className="grid gap-1">
                              <Label className="text-sm font-light text-foreground/60" htmlFor="companyName">
                                 Nama Perusahaan
                              </Label>
                              <Input
                                 id="companyName"
                                 placeholder="PT. Nama Perusahaan"
                                 type="text"
                                 disabled={isLoading}
                                 value={formData.companyName}
                                 onChange={(e) => handleInputChange('companyName', e.target.value)}
                                 required
                              />
                           </div>

                           <div className="grid grid-cols-2 gap-2">
                              <div className="grid gap-1">
                                 <Label className="text-sm font-light text-foreground/60" htmlFor="companyRegistrationNumber">
                                    No. Registrasi
                                 </Label>
                                 <Input
                                    id="companyRegistrationNumber"
                                    placeholder="123456789"
                                    type="text"
                                    disabled={isLoading}
                                    value={formData.companyRegistrationNumber}
                                    onChange={(e) => handleInputChange('companyRegistrationNumber', e.target.value)}
                                    required
                                 />
                              </div>

                              <div className="grid gap-1">
                                 <Label className="text-sm font-light text-foreground/60" htmlFor="companyTaxId">
                                    NPWP
                                 </Label>
                                 <Input
                                    id="companyTaxId"
                                    placeholder="12.345.678.9-012.345"
                                    type="text"
                                    disabled={isLoading}
                                    value={formData.companyTaxId}
                                    onChange={(e) => handleInputChange('companyTaxId', e.target.value)}
                                    required
                                 />
                              </div>
                           </div>

                           <div className="grid gap-1">
                              <Label className="text-sm font-light text-foreground/60">
                                 Industri
                              </Label>
                              <Select
                                 value={formData.industry}
                                 onValueChange={(value: 'MEDICAL' | 'MANUFACTURING' | 'FOOD' | 'OTHER') => handleInputChange('industry', value)}
                                 disabled={isLoading}
                              >
                                 <SelectTrigger>
                                    <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent>
                                    <SelectItem value="MEDICAL">Medis</SelectItem>
                                    <SelectItem value="MANUFACTURING">Manufaktur</SelectItem>
                                    <SelectItem value="FOOD">Makanan</SelectItem>
                                    <SelectItem value="OTHER">Lainnya</SelectItem>
                                 </SelectContent>
                              </Select>
                           </div>

                           <div className="grid gap-1">
                              <Label className="text-sm font-light text-foreground/60" htmlFor="companyAddress">
                                 Alamat Perusahaan
                              </Label>
                              <Input
                                 id="companyAddress"
                                 placeholder="Jl. Nama Jalan No. 123"
                                 type="text"
                                 disabled={isLoading}
                                 value={formData.companyAddress}
                                 onChange={(e) => handleInputChange('companyAddress', e.target.value)}
                              />
                           </div>

                           <div className="grid grid-cols-2 gap-2">
                              <div className="grid gap-1">
                                 <Label className="text-sm font-light text-foreground/60" htmlFor="companyCity">
                                    Kota
                                 </Label>
                                 <Input
                                    id="companyCity"
                                    placeholder="Jakarta"
                                    type="text"
                                    disabled={isLoading}
                                    value={formData.companyCity}
                                    onChange={(e) => handleInputChange('companyCity', e.target.value)}
                                 />
                              </div>

                              <div className="grid gap-1">
                                 <Label className="text-sm font-light text-foreground/60" htmlFor="companyProvince">
                                    Provinsi
                                 </Label>
                                 <Input
                                    id="companyProvince"
                                    placeholder="DKI Jakarta"
                                    type="text"
                                    disabled={isLoading}
                                    value={formData.companyProvince}
                                    onChange={(e) => handleInputChange('companyProvince', e.target.value)}
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                  </>
               )}

               {/* Password */}
               <div className="grid gap-1">
                  <Label className="text-sm font-light text-foreground/60" htmlFor="password">
                     Password
                  </Label>
                  <div className="relative">
                     <Input
                        id="password"
                        placeholder="Password (minimal 6 karakter)"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        disabled={isLoading}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
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

               <div className="grid gap-1">
                  <Label className="text-sm font-light text-foreground/60" htmlFor="confirmPassword">
                     Konfirmasi Password
                  </Label>
                  <Input
                     id="confirmPassword"
                     placeholder="Ulangi password"
                     type="password"
                     autoComplete="new-password"
                     disabled={isLoading}
                     value={formData.confirmPassword}
                     onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                     required
                  />
               </div>

               {error && (
                  <p className="text-sm text-red-600">{error}</p>
               )}

               <Button disabled={isLoading} type="submit">
                  {isLoading && <Loader className="mr-2 h-4 animate-spin" />}
                  Daftar Akun
               </Button>
            </div>
         </form>
      </div>
   )
}