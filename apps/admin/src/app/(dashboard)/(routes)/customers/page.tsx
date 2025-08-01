import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import prisma from '@/lib/prisma'

import { CustomersTable } from './components/customers-table'
import { CustomerColumn } from './components/customers-table'

export default async function CustomersPage() {
   const customers = await prisma.customer.findMany({
      include: {
         company: true,
         orders: true,
         quotations: true,
         invoices: true,
         _count: {
            select: {
               orders: true,
               quotations: true,
               communications: true,
            }
         }
      },
      orderBy: {
         updatedAt: 'desc',
      },
   })

   const formattedCustomers: CustomerColumn[] = customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      type: customer.type,
      companyName: customer.company?.name || null,
      industry: customer.company?.industry || null,
      ordersCount: customer._count.orders,
      quotationsCount: customer._count.quotations,
      communicationsCount: customer._count.communications,
      isEmailVerified: customer.isEmailVerified,
      isPhoneVerified: customer.isPhoneVerified,
      createdAt: customer.createdAt,
   }))

   return (
      <div className="block space-y-4 my-6">
         <div className="flex items-center justify-between">
            <Heading 
               title={`Customers (${customers.length})`} 
               description="Manage customer profiles and company information" 
            />
            <div className="flex gap-2">
               <Link href="/companies/new">
                  <Button>
                     <Plus className="mr-2 h-4 w-4" />
                     Add Company
                  </Button>
               </Link>
               <Link href="/customers/new">
                  <Button>
                     <Plus className="mr-2 h-4 w-4" />
                     Add Customer
                  </Button>
               </Link>
            </div>
         </div>
         <Separator />
         <CustomersTable data={formattedCustomers} />
      </div>
   )
}