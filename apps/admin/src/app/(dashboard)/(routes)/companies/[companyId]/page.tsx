import { notFound } from 'next/navigation'
import { Heading } from '@/components/ui/heading'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
   Building2, 
   Mail, 
   Phone, 
   MapPin, 
   Calendar,
   Users,
   FileText,
   Edit,
   Plus
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import prisma from '@/lib/prisma'

import { CompanyCustomers } from '../components/company-customers'

interface CompanyDetailPageProps {
   params: {
      companyId: string
   }
}

export default async function CompanyDetailPage({ params }: CompanyDetailPageProps) {
   const company = await prisma.company.findUnique({
      where: {
         id: params.companyId,
      },
      include: {
         customers: {
            include: {
               orders: true,
               quotations: true,
               invoices: true,
            },
            orderBy: {
               createdAt: 'desc',
            },
         },
         taxInvoices: {
            include: {
               invoice: {
                  include: {
                     order: true,
                  },
               },
               customer: true,
            },
            orderBy: {
               createdAt: 'desc',
            },
         },
      },
   })

   if (!company) {
      notFound()
   }

   const totalCustomers = company.customers.length
   const totalOrders = company.customers.reduce((sum, customer) => sum + customer.orders.length, 0)
   const totalSpent = company.customers.reduce((sum, customer) => 
      sum + customer.orders.reduce((orderSum, order) => orderSum + order.totalAmount, 0), 0
   )
   const totalTaxInvoices = company.taxInvoices.length

   return (
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <Heading 
               title={company.name} 
               description={`Company ID: ${company.id}`} 
            />
            <div className="flex gap-2">
               <Button variant="outline" asChild>
                  <Link href={`/companies/${company.id}/edit`}>
                     <Edit className="mr-2 h-4 w-4" />
                     Edit Company
                  </Link>
               </Button>
               <Button asChild>
                  <Link href={`/customers/new?companyId=${company.id}`}>
                     <Plus className="mr-2 h-4 w-4" />
                     Add Customer
                  </Link>
               </Button>
            </div>
         </div>

         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{totalCustomers}</div>
               </CardContent>
            </Card>
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{totalOrders}</div>
               </CardContent>
            </Card>
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">
                     Rp {(totalSpent / 100).toLocaleString('id-ID')}
                  </div>
               </CardContent>
            </Card>
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tax Invoices</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{totalTaxInvoices}</div>
               </CardContent>
            </Card>
         </div>

         <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
               <CardHeader>
                  <CardTitle>Company Information</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                     <Badge variant="outline">
                        {company.industry.toLowerCase()}
                     </Badge>
                  </div>
                  
                  <div className="space-y-3">
                     <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="text-sm">
                           <div className="font-medium">{company.name}</div>
                           <div className="text-muted-foreground">
                              Contact: {company.contactPerson}
                           </div>
                        </div>
                     </div>
                     
                     {company.email && (
                        <div className="flex items-center gap-2">
                           <Mail className="h-4 w-4 text-muted-foreground" />
                           <span className="text-sm">{company.email}</span>
                        </div>
                     )}
                     
                     {company.phone && (
                        <div className="flex items-center gap-2">
                           <Phone className="h-4 w-4 text-muted-foreground" />
                           <span className="text-sm">{company.phone}</span>
                        </div>
                     )}
                     
                     <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="text-sm">
                           <div>{company.address}</div>
                           <div className="text-muted-foreground">
                              {company.city}, {company.province} {company.postalCode}
                           </div>
                           <div className="text-muted-foreground">{company.country}</div>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                           Registered {format(company.createdAt, 'MMM dd, yyyy')}
                        </span>
                     </div>
                  </div>

                  <div className="pt-4 border-t">
                     <h4 className="font-medium mb-2">Legal Information</h4>
                     <div className="space-y-2 text-sm">
                        <div>
                           <span className="text-muted-foreground">Registration Number:</span>
                           <div className="font-mono">{company.registrationNumber}</div>
                        </div>
                        <div>
                           <span className="text-muted-foreground">Tax ID (NPWP):</span>
                           <div className="font-mono">{company.taxId}</div>
                        </div>
                        {company.website && (
                           <div>
                              <span className="text-muted-foreground">Website:</span>
                              <div>
                                 <a 
                                    href={company.website} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                 >
                                    {company.website}
                                 </a>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               </CardContent>
            </Card>

            <div className="md:col-span-2">
               <CompanyCustomers 
                  customers={company.customers} 
                  companyId={company.id}
               />
            </div>
         </div>
      </div>
   )
}