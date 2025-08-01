import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import prisma from '@/lib/prisma'

import { CompaniesTable } from './components/companies-table'
import { CompanyColumn } from './components/companies-table'

export default async function CompaniesPage() {
   const companies = await prisma.company.findMany({
      include: {
         customers: true,
         _count: {
            select: {
               customers: true,
               taxInvoices: true,
            }
         }
      },
      orderBy: {
         updatedAt: 'desc',
      },
   })

   const formattedCompanies: CompanyColumn[] = companies.map((company) => ({
      id: company.id,
      name: company.name,
      registrationNumber: company.registrationNumber,
      taxId: company.taxId,
      industry: company.industry,
      email: company.email,
      phone: company.phone,
      contactPerson: company.contactPerson,
      address: `${company.address}, ${company.city}, ${company.province}`,
      customersCount: company._count.customers,
      taxInvoicesCount: company._count.taxInvoices,
      createdAt: company.createdAt,
   }))

   return (
      <div className="block space-y-4 my-6">
         <div className="flex items-center justify-between">
            <Heading 
               title={`Companies (${companies.length})`} 
               description="Manage B2B company profiles and information" 
            />
            <Link href="/companies/new">
               <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Company
               </Button>
            </Link>
         </div>
         <Separator />
         <CompaniesTable data={formattedCompanies} />
      </div>
   )
}