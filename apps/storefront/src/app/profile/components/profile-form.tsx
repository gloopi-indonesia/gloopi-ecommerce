'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { isEmailValid } from '@persepolis/regex'
import { EyeIcon, EyeOffIcon, Loader, SaveIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import * as React from 'react'
import { toast } from 'react-hot-toast'

interface Customer {
   id: string
   email: string
   name: string
   phone: string
   type: 'B2B' | 'B2C'
   isEmailVerified: boolean
   isPhoneVerified: boolean
   taxInformation?: any
   communicationPreferences?: any
   company?: {
      id: string
      name: string
      registrationNumber: string
      taxId: string
      industry: 'MEDICAL' | 'MANUFACTURING' | 'FOOD' | 'OTHER'
      email?: string
      phone?: string
      website?: string
      contactPerson: string
      address: string
      city: string
      province: string
      postalCode: string
      country: string
   }
   addresses: any[]
   createdAt: string
}

export function ProfileForm() {
   const [isLoading, setIsLoading] = React.useState(false)
   const [customer, setCustomer] = React.useState<Customer | null>(null)
   const [showPassword, setShowPassword] = React.useState(false)
   const [activeTab, setActiveTab] = React.useState('profile')
   const router = useRouter()

   // Form states
   const [profileData, setProfileData] = React.useState({
      name: '',
      phone: '',
   })

   const [companyData, setCompanyData] = React.useState({
      name: '',
      registrationNumber: '',
      taxId: '',
      industry: 'OTHER' as 'MEDICAL' | 'MANUFACTURING' | 'FOOD' | 'OTHER',
      email: '',
      phone: '',
      website: '',
      contactPerson: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
   })

   const [passwordData, setPasswordData] = React.useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
   })

   // Fetch customer data
   React.useEffect(() => {
      fetchCustomerData()
   }, [])

   const fetchCustomerData = async () => {
      try {
         const response = await fetch('/api/auth/me')
         const data = await response.json()

         if (response.ok) {
            setCustomer(data.customer)
            setProfileData({
               name: data.customer.name,
               phone: data.customer.phone,
            })

            if (data.customer.company) {
               setCompanyData({
                  name: data.customer.company.name,
                  registrationNumber: data.customer.company.registrationNumber,
                  taxId: data.customer.company.taxId,
                  industry: data.customer.company.industry,
                  email: data.customer.company.email || '',
                  phone: data.customer.company.phone || '',
                  website: data.customer.company.website || '',
                  contactPerson: data.customer.company.contactPerson,
                  address: data.customer.company.address,
                  city: data.customer.company.city,
                  province: data.customer.company.province,
                  postalCode: data.customer.company.postalCode,
               })
            }
         } else {
            toast.error('Gagal memuat data profil')
            router.push('/login')
         }
      } catch (error) {
         console.error('Fetch customer error:', error)
         toast.error('Terjadi kesalahan')
      }
   }

   const updateProfile = async () => {
      try {
         setIsLoading(true)

         const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(profileData),
         })

         const data = await response.json()

         if (response.ok) {
            toast.success('Profil berhasil diperbarui')
            setCustomer(data.customer)
         } else {
            toast.error(data.error || 'Gagal memperbarui profil')
         }
      } catch (error) {
         console.error('Update profile error:', error)
         toast.error('Terjadi kesalahan')
      } finally {
         setIsLoading(false)
      }
   }

   const updateCompany = async () => {
      try {
         setIsLoading(true)

         const response = await fetch('/api/profile/company', {
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(companyData),
         })

         const data = await response.json()

         if (response.ok) {
            toast.success('Profil perusahaan berhasil diperbarui')
            await fetchCustomerData() // Refresh data
         } else {
            toast.error(data.error || 'Gagal memperbarui profil perusahaan')
         }
      } catch (error) {
         console.error('Update company error:', error)
         toast.error('Terjadi kesalahan')
      } finally {
         setIsLoading(false)
      }
   }

   const changePassword = async () => {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
         toast.error('Konfirmasi password tidak cocok')
         return
      }

      if (passwordData.newPassword.length < 6) {
         toast.error('Password baru minimal 6 karakter')
         return
      }

      try {
         setIsLoading(true)

         const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               currentPassword: passwordData.currentPassword,
               newPassword: passwordData.newPassword,
            }),
         })

         const data = await response.json()

         if (response.ok) {
            toast.success('Password berhasil diubah')
            setPasswordData({
               currentPassword: '',
               newPassword: '',
               confirmPassword: '',
            })
         } else {
            toast.error(data.error || 'Gagal mengubah password')
         }
      } catch (error) {
         console.error('Change password error:', error)
         toast.error('Terjadi kesalahan')
      } finally {
         setIsLoading(false)
      }
   }

   if (!customer) {
      return (
         <div className="flex items-center justify-center py-8">
            <Loader className="h-6 w-6 animate-spin" />
         </div>
      )
   }

   return (
      <Tabs value={activeTab} onValueChange={setActiveTab}>
         <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profil</TabsTrigger>
            {customer.type === 'B2B' && (
               <TabsTrigger value="company">Perusahaan</TabsTrigger>
            )}
            <TabsTrigger value="password">Password</TabsTrigger>
         </TabsList>

         <TabsContent value="profile">
            <Card>
               <CardHeader>
                  <CardTitle>Informasi Profil</CardTitle>
                  <CardDescription>
                     Kelola informasi dasar profil Anda
                  </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="grid gap-1">
                     <Label htmlFor="email">Email</Label>
                     <Input
                        id="email"
                        type="email"
                        value={customer.email}
                        disabled
                        className="bg-muted"
                     />
                     <p className="text-xs text-muted-foreground">
                        Email tidak dapat diubah
                     </p>
                  </div>

                  <div className="grid gap-1">
                     <Label htmlFor="name">Nama Lengkap</Label>
                     <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        disabled={isLoading}
                     />
                  </div>

                  <div className="grid gap-1">
                     <Label htmlFor="phone">Nomor Telepon</Label>
                     <Input
                        id="phone"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={isLoading}
                     />
                  </div>

                  <div className="grid gap-1">
                     <Label>Jenis Akun</Label>
                     <Input
                        value={customer.type === 'B2B' ? 'Perusahaan (B2B)' : 'Individu (B2C)'}
                        disabled
                        className="bg-muted"
                     />
                  </div>

                  <Button onClick={updateProfile} disabled={isLoading}>
                     {isLoading && <Loader className="mr-2 h-4 animate-spin" />}
                     <SaveIcon className="mr-2 h-4" />
                     Simpan Perubahan
                  </Button>
               </CardContent>
            </Card>
         </TabsContent>

         {customer.type === 'B2B' && (
            <TabsContent value="company">
               <Card>
                  <CardHeader>
                     <CardTitle>Informasi Perusahaan</CardTitle>
                     <CardDescription>
                        Kelola informasi perusahaan Anda
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="grid gap-1">
                        <Label htmlFor="companyName">Nama Perusahaan</Label>
                        <Input
                           id="companyName"
                           value={companyData.name}
                           onChange={(e) => setCompanyData(prev => ({ ...prev, name: e.target.value }))}
                           disabled={isLoading}
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1">
                           <Label htmlFor="registrationNumber">No. Registrasi</Label>
                           <Input
                              id="registrationNumber"
                              value={companyData.registrationNumber}
                              onChange={(e) => setCompanyData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                              disabled={isLoading}
                           />
                        </div>

                        <div className="grid gap-1">
                           <Label htmlFor="taxId">NPWP</Label>
                           <Input
                              id="taxId"
                              value={companyData.taxId}
                              onChange={(e) => setCompanyData(prev => ({ ...prev, taxId: e.target.value }))}
                              disabled={isLoading}
                           />
                        </div>
                     </div>

                     <div className="grid gap-1">
                        <Label>Industri</Label>
                        <Select
                           value={companyData.industry}
                           onValueChange={(value: 'MEDICAL' | 'MANUFACTURING' | 'FOOD' | 'OTHER') => 
                              setCompanyData(prev => ({ ...prev, industry: value }))
                           }
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

                     <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1">
                           <Label htmlFor="companyEmail">Email Perusahaan</Label>
                           <Input
                              id="companyEmail"
                              type="email"
                              value={companyData.email}
                              onChange={(e) => setCompanyData(prev => ({ ...prev, email: e.target.value }))}
                              disabled={isLoading}
                           />
                        </div>

                        <div className="grid gap-1">
                           <Label htmlFor="companyPhone">Telepon Perusahaan</Label>
                           <Input
                              id="companyPhone"
                              value={companyData.phone}
                              onChange={(e) => setCompanyData(prev => ({ ...prev, phone: e.target.value }))}
                              disabled={isLoading}
                           />
                        </div>
                     </div>

                     <div className="grid gap-1">
                        <Label htmlFor="website">Website</Label>
                        <Input
                           id="website"
                           type="url"
                           value={companyData.website}
                           onChange={(e) => setCompanyData(prev => ({ ...prev, website: e.target.value }))}
                           disabled={isLoading}
                           placeholder="https://www.perusahaan.com"
                        />
                     </div>

                     <div className="grid gap-1">
                        <Label htmlFor="contactPerson">Nama Kontak</Label>
                        <Input
                           id="contactPerson"
                           value={companyData.contactPerson}
                           onChange={(e) => setCompanyData(prev => ({ ...prev, contactPerson: e.target.value }))}
                           disabled={isLoading}
                        />
                     </div>

                     <div className="grid gap-1">
                        <Label htmlFor="address">Alamat</Label>
                        <Input
                           id="address"
                           value={companyData.address}
                           onChange={(e) => setCompanyData(prev => ({ ...prev, address: e.target.value }))}
                           disabled={isLoading}
                        />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-1">
                           <Label htmlFor="city">Kota</Label>
                           <Input
                              id="city"
                              value={companyData.city}
                              onChange={(e) => setCompanyData(prev => ({ ...prev, city: e.target.value }))}
                              disabled={isLoading}
                           />
                        </div>

                        <div className="grid gap-1">
                           <Label htmlFor="province">Provinsi</Label>
                           <Input
                              id="province"
                              value={companyData.province}
                              onChange={(e) => setCompanyData(prev => ({ ...prev, province: e.target.value }))}
                              disabled={isLoading}
                           />
                        </div>
                     </div>

                     <Button onClick={updateCompany} disabled={isLoading}>
                        {isLoading && <Loader className="mr-2 h-4 animate-spin" />}
                        <SaveIcon className="mr-2 h-4" />
                        Simpan Perubahan
                     </Button>
                  </CardContent>
               </Card>
            </TabsContent>
         )}

         <TabsContent value="password">
            <Card>
               <CardHeader>
                  <CardTitle>Ubah Password</CardTitle>
                  <CardDescription>
                     Pastikan password Anda aman dan mudah diingat
                  </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="grid gap-1">
                     <Label htmlFor="currentPassword">Password Saat Ini</Label>
                     <div className="relative">
                        <Input
                           id="currentPassword"
                           type={showPassword ? 'text' : 'password'}
                           value={passwordData.currentPassword}
                           onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                           disabled={isLoading}
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
                     <Label htmlFor="newPassword">Password Baru</Label>
                     <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        disabled={isLoading}
                        placeholder="Minimal 6 karakter"
                     />
                  </div>

                  <div className="grid gap-1">
                     <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
                     <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        disabled={isLoading}
                        placeholder="Ulangi password baru"
                     />
                  </div>

                  <Button onClick={changePassword} disabled={isLoading}>
                     {isLoading && <Loader className="mr-2 h-4 animate-spin" />}
                     <SaveIcon className="mr-2 h-4" />
                     Ubah Password
                  </Button>
               </CardContent>
            </Card>
         </TabsContent>
      </Tabs>
   )
}