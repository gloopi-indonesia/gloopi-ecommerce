'use client'

import { Button } from '@/components/ui/button'
import {
   Command,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from '@/components/ui/popover'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'
import { cn, isVariableValid } from '@/lib/utils'
import { UseCase } from '@prisma/client'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export function SearchInput({ initialValue }: { initialValue?: string }) {
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()
   const [value, setValue] = useState(initialValue || '')

   const handleSearch = (searchValue: string) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()))

      if (searchValue.trim()) {
         current.set('search', searchValue.trim())
      } else {
         current.delete('search')
      }

      // Reset to first page when searching
      current.delete('page')

      const search = current.toString()
      const query = search ? `?${search}` : ''

      router.replace(`${pathname}${query}`, { scroll: false })
   }

   const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
         handleSearch(value)
      }
   }

   return (
      <div className="relative">
         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
         <Input
            placeholder="Cari produk sarung tangan..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyPress={handleKeyPress}
            onBlur={() => handleSearch(value)}
            className="pl-10"
         />
      </div>
   )
}

export function SortBy({ initialData }: { initialData?: string }) {
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()
   const [value, setValue] = useState('featured')

   useEffect(() => {
      if (isVariableValid(initialData)) setValue(initialData)
   }, [initialData])

   return (
      <Select
         value={value}
         onValueChange={(currentValue) => {
            const current = new URLSearchParams(Array.from(searchParams.entries()))

            if (currentValue === 'featured') {
               current.delete('sort')
            } else {
               current.set('sort', currentValue)
            }

            setValue(currentValue)

            const search = current.toString()
            const query = search ? `?${search}` : ''

            router.replace(`${pathname}${query}`, { scroll: false })
         }}
      >
         <SelectTrigger className="w-full">
            <SelectValue placeholder="Urutkan" />
         </SelectTrigger>
         <SelectContent>
            <SelectItem value="featured">Unggulan</SelectItem>
            <SelectItem value="newest">Terbaru</SelectItem>
            <SelectItem value="name">Nama A-Z</SelectItem>
            <SelectItem value="price_low">Harga Terendah</SelectItem>
            <SelectItem value="price_high">Harga Tertinggi</SelectItem>
         </SelectContent>
      </Select>
   )
}

export function UseCaseFilter({ initialValue }: { initialValue?: UseCase }) {
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()
   const [value, setValue] = useState<UseCase | 'ALL'>('ALL')

   useEffect(() => {
      if (initialValue) setValue(initialValue)
      else setValue('ALL')
   }, [initialValue])

   return (
      <Select
         value={value}
         onValueChange={(currentValue: UseCase | 'ALL') => {
            const current = new URLSearchParams(Array.from(searchParams.entries()))

            if (currentValue && currentValue !== 'ALL') {
               current.set('useCase', currentValue)
            } else {
               current.delete('useCase')
            }

            setValue(currentValue)

            const search = current.toString()
            const query = search ? `?${search}` : ''

            router.replace(`${pathname}${query}`, { scroll: false })
         }}
      >
         <SelectTrigger className="w-full">
            <SelectValue placeholder="Kategori Penggunaan" />
         </SelectTrigger>
         <SelectContent>
            <SelectItem value="ALL">Semua Kategori</SelectItem>
            <SelectItem value="MEDICAL">Medis</SelectItem>
            <SelectItem value="MANUFACTURING">Manufaktur</SelectItem>
            <SelectItem value="FOOD">Makanan</SelectItem>
            <SelectItem value="GENERAL">Umum</SelectItem>
         </SelectContent>
      </Select>
   )
}

export function CategoriesCombobox({
   categories,
   initialCategory
}: {
   categories: Array<{ id: string; name: string }>
   initialCategory?: string
}) {
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()
   const [open, setOpen] = useState(false)
   const [value, setValue] = useState('')

   function getCategoryName() {
      const category = categories.find(cat =>
         cat.name.toLowerCase() === value.toLowerCase()
      )
      return category?.name
   }

   useEffect(() => {
      if (initialCategory) setValue(initialCategory)
   }, [initialCategory])

   return (
      <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger asChild>
            <Button
               variant="outline"
               role="combobox"
               aria-expanded={open}
               className="w-full justify-between"
            >
               {value ? getCategoryName() : 'Pilih kategori...'}
               <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
         </PopoverTrigger>
         <PopoverContent className="w-full p-0">
            <Command>
               <CommandInput placeholder="Cari kategori..." />
               <CommandEmpty>Kategori tidak ditemukan.</CommandEmpty>
               <CommandGroup>
                  <CommandItem
                     onSelect={() => {
                        const current = new URLSearchParams(Array.from(searchParams.entries()))
                        current.delete('category')
                        setValue('')

                        const search = current.toString()
                        const query = search ? `?${search}` : ''

                        router.replace(`${pathname}${query}`, { scroll: false })
                        setOpen(false)
                     }}
                  >
                     <Check
                        className={cn(
                           'mr-2 h-4 w-4',
                           !value ? 'opacity-100' : 'opacity-0'
                        )}
                     />
                     Semua Kategori
                  </CommandItem>
                  {categories.map((category) => (
                     <CommandItem
                        key={category.id}
                        onSelect={(currentValue) => {
                           const current = new URLSearchParams(Array.from(searchParams.entries()))

                           if (currentValue === value.toLowerCase()) {
                              current.delete('category')
                              setValue('')
                           } else {
                              current.set('category', category.name)
                              setValue(category.name)
                           }

                           const search = current.toString()
                           const query = search ? `?${search}` : ''

                           router.replace(`${pathname}${query}`, { scroll: false })
                           setOpen(false)
                        }}
                     >
                        <Check
                           className={cn(
                              'mr-2 h-4 w-4',
                              value === category.name ? 'opacity-100' : 'opacity-0'
                           )}
                        />
                        {category.name}
                     </CommandItem>
                  ))}
               </CommandGroup>
            </Command>
         </PopoverContent>
      </Popover>
   )
}

export function BrandCombobox({
   brands,
   initialBrand
}: {
   brands: Array<{ id: string; name: string }>
   initialBrand?: string
}) {
   const router = useRouter()
   const pathname = usePathname()
   const searchParams = useSearchParams()
   const [open, setOpen] = useState(false)
   const [value, setValue] = useState('')

   function getBrandName() {
      const brand = brands.find(b =>
         b.name.toLowerCase() === value.toLowerCase()
      )
      return brand?.name
   }

   useEffect(() => {
      if (initialBrand) setValue(initialBrand)
   }, [initialBrand])

   return (
      <Popover open={open} onOpenChange={setOpen}>
         <PopoverTrigger asChild>
            <Button
               variant="outline"
               role="combobox"
               aria-expanded={open}
               className="w-full justify-between"
            >
               {value ? getBrandName() : 'Pilih merek...'}
               <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
         </PopoverTrigger>
         <PopoverContent className="w-full p-0">
            <Command>
               <CommandInput placeholder="Cari merek..." />
               <CommandEmpty>Merek tidak ditemukan.</CommandEmpty>
               <CommandGroup>
                  <CommandItem
                     onSelect={() => {
                        const current = new URLSearchParams(Array.from(searchParams.entries()))
                        current.delete('brand')
                        setValue('')

                        const search = current.toString()
                        const query = search ? `?${search}` : ''

                        router.replace(`${pathname}${query}`, { scroll: false })
                        setOpen(false)
                     }}
                  >
                     <Check
                        className={cn(
                           'mr-2 h-4 w-4',
                           !value ? 'opacity-100' : 'opacity-0'
                        )}
                     />
                     Semua Merek
                  </CommandItem>
                  {brands.map((brand) => (
                     <CommandItem
                        key={brand.id}
                        onSelect={(currentValue) => {
                           const current = new URLSearchParams(Array.from(searchParams.entries()))

                           if (currentValue === value.toLowerCase()) {
                              current.delete('brand')
                              setValue('')
                           } else {
                              current.set('brand', brand.name)
                              setValue(brand.name)
                           }

                           const search = current.toString()
                           const query = search ? `?${search}` : ''

                           router.replace(`${pathname}${query}`, { scroll: false })
                           setOpen(false)
                        }}
                     >
                        <Check
                           className={cn(
                              'mr-2 h-4 w-4',
                              value === brand.name ? 'opacity-100' : 'opacity-0'
                           )}
                        />
                        {brand.name}
                     </CommandItem>
                  ))}
               </CommandGroup>
            </Command>
         </PopoverContent>
      </Popover>
   )
}
