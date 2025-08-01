'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, Eye, MoreHorizontal, Building2, Users } from 'lucide-react'
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

export type CompanyColumn = {
   id: string
   name: string
   registrationNumber: string
   taxId: string
   industry: 'MEDICAL' | 'MANUFACTURING' | 'FOOD' | 'OTHER'
   email: string | null
   phone: string | null
   contactPerson: string
   address: string
   customersCount: number
   taxInvoicesCount: number
   createdAt: Date
}

const columns: ColumnDef<CompanyColumn>[] = [
   {
      accessorKey: 'name',
      header: ({ column }) => {
         return (
            <Button
               variant="ghost"
               onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
               Company Name
               <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
         )
      },
      cell: ({ row }) => {
         const company = row.original
         return (
            <div className="flex flex-col">
               <span className="font-medium">{company.name}</span>
               <span className="text-sm text-muted-foreground">
                  Contact: {company.contactPerson}
               </span>
            </div>
         )
      },
   },
   {
      accessorKey: 'industry',
      header: 'Industry',
      cell: ({ row }) => {
         const industry = row.getValue('industry') as string
         return (
            <Badge variant="outline">
               {industry.toLowerCase()}
            </Badge>
         )
      },
   },
   {
      accessorKey: 'registrationNumber',
      header: 'Registration',
      cell: ({ row }) => {
         const company = row.original
         return (
            <div className="flex flex-col text-sm">
               <span className="font-mono">{company.registrationNumber}</span>
               <span className="text-muted-foreground font-mono">
                  NPWP: {company.taxId}
               </span>
            </div>
         )
      },
   },
   {
      accessorKey: 'contact',
      header: 'Contact Info',
      cell: ({ row }) => {
         const company = row.original
         return (
            <div className="flex flex-col text-sm">
               {company.email && (
                  <span>{company.email}</span>
               )}
               {company.phone && (
                  <span className="text-muted-foreground">{company.phone}</span>
               )}
               {!company.email && !company.phone && (
                  <span className="text-muted-foreground">No contact info</span>
               )}
            </div>
         )
      },
   },
   {
      accessorKey: 'stats',
      header: 'Activity',
      cell: ({ row }) => {
         const company = row.original
         return (
            <div className="flex flex-col text-sm">
               <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {company.customersCount} customers
               </span>
               <span className="text-muted-foreground">
                  {company.taxInvoicesCount} tax invoices
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
         const company = row.original

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
                     <Link href={`/companies/${company.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                     </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                     <Link href={`/companies/${company.id}/edit`}>
                        <Building2 className="mr-2 h-4 w-4" />
                        Edit Company
                     </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                     <Link href={`/companies/${company.id}/customers`}>
                        <Users className="mr-2 h-4 w-4" />
                        View Customers
                     </Link>
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         )
      },
   },
]

interface CompaniesTableProps {
   data: CompanyColumn[]
}

export function CompaniesTable({ data }: CompaniesTableProps) {
   const [searchTerm, setSearchTerm] = useState('')
   const [industryFilter, setIndustryFilter] = useState<string>('all')

   const filteredData = data.filter((company) => {
      const matchesSearch = 
         company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         company.registrationNumber.includes(searchTerm) ||
         company.taxId.includes(searchTerm) ||
         company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
         (company.email && company.email.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesIndustry = industryFilter === 'all' || company.industry === industryFilter

      return matchesSearch && matchesIndustry
   })

   return (
      <div className="space-y-4">
         <div className="flex items-center gap-4">
            <Input
               placeholder="Search companies..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="max-w-sm"
            />
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