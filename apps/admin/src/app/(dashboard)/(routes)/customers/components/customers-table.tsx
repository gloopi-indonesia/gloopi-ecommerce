'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Eye, MessageCircle, MoreHorizontal, Phone } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DataTable } from '@/components/ui/data-table'
import { Input } from '@/components/ui/input'
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from '@/components/ui/select'

export type CustomerColumn = {
   id: string
   name: string
   email: string
   phone: string
   type: 'B2B' | 'B2C'
   companyName: string | null
   industry: 'MEDICAL' | 'MANUFACTURING' | 'FOOD' | 'OTHER' | null
   ordersCount: number
   quotationsCount: number
   communicationsCount: number
   isEmailVerified: boolean
   isPhoneVerified: boolean
   createdAt: Date
}

const columns: ColumnDef<CustomerColumn>[] = [
   {
      accessorKey: 'name',
      header: ({ column }) => {
         return (
            <Button
               variant="ghost"
               onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
               Name
               <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
         )
      },
      cell: ({ row }) => {
         const customer = row.original
         return (
            <div className="flex flex-col">
               <span className="font-medium">{customer.name}</span>
               <span className="text-sm text-muted-foreground">{customer.email}</span>
            </div>
         )
      },
   },
   {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
         const type = row.getValue('type') as string
         return (
            <Badge variant={type === 'B2B' ? 'default' : 'secondary'}>
               {type}
            </Badge>
         )
      },
   },
   {
      accessorKey: 'companyName',
      header: 'Company',
      cell: ({ row }) => {
         const companyName = row.getValue('companyName') as string | null
         const industry = row.original.industry
         
         if (!companyName) {
            return <span className="text-muted-foreground">-</span>
         }
         
         return (
            <div className="flex flex-col">
               <span className="font-medium">{companyName}</span>
               {industry && (
                  <Badge variant="outline" className="w-fit text-xs">
                     {industry.toLowerCase()}
                  </Badge>
               )}
            </div>
         )
      },
   },
   {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => {
         const phone = row.getValue('phone') as string
         const isVerified = row.original.isPhoneVerified
         
         return (
            <div className="flex items-center gap-2">
               <span className="text-sm">{phone}</span>
               {isVerified && (
                  <Badge variant="outline" className="text-xs">
                     Verified
                  </Badge>
               )}
            </div>
         )
      },
   },
   {
      accessorKey: 'stats',
      header: 'Activity',
      cell: ({ row }) => {
         const customer = row.original
         return (
            <div className="flex flex-col text-sm">
               <span>{customer.ordersCount} orders</span>
               <span className="text-muted-foreground">
                  {customer.quotationsCount} quotations
               </span>
            </div>
         )
      },
   },
   {
      accessorKey: 'createdAt',
      header: ({ column }) => {
         return (
            <Button
               variant="ghost"
               onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
               Created
               <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
         )
      },
      cell: ({ row }) => {
         const date = row.getValue('createdAt') as Date
         return format(date, 'MMM dd, yyyy')
      },
   },
   {
      id: 'actions',
      cell: ({ row }) => {
         const customer = row.original

         return (
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                     <span className="sr-only">Open menu</span>
                     <MoreHorizontal className="h-4 w-4" />
                  </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                     <Link href={`/customers/${customer.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                     </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                     <Link href={`/customers/${customer.id}/communications`}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Communications
                     </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                     <Phone className="mr-2 h-4 w-4" />
                     Call Customer
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         )
      },
   },
]

interface CustomersTableProps {
   data: CustomerColumn[]
}

export function CustomersTable({ data }: CustomersTableProps) {
   const [searchTerm, setSearchTerm] = useState('')
   const [typeFilter, setTypeFilter] = useState<string>('all')
   const [industryFilter, setIndustryFilter] = useState<string>('all')

   const filteredData = data.filter((customer) => {
      const matchesSearch = 
         customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
         customer.phone.includes(searchTerm) ||
         (customer.companyName && customer.companyName.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesType = typeFilter === 'all' || customer.type === typeFilter
      const matchesIndustry = industryFilter === 'all' || customer.industry === industryFilter

      return matchesSearch && matchesType && matchesIndustry
   })

   return (
      <div className="space-y-4">
         <div className="flex items-center gap-4">
            <Input
               placeholder="Search customers..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="max-w-sm"
            />
            <Select value={typeFilter} onValueChange={setTypeFilter}>
               <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="B2B">B2B</SelectItem>
                  <SelectItem value="B2C">B2C</SelectItem>
               </SelectContent>
            </Select>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
               <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by industry" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  <SelectItem value="MEDICAL">Medical</SelectItem>
                  <SelectItem value="MANUFACTURING">Manufacturing</SelectItem>
                  <SelectItem value="FOOD">Food</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
               </SelectContent>
            </Select>
         </div>
         <DataTable columns={columns} data={filteredData} />
      </div>
   )
}