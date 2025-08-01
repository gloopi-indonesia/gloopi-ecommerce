'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Users, Plus, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface Order {
   id: string
   orderNumber: string
   totalAmount: number
   status: string
}

interface Quotation {
   id: string
   quotationNumber: string
   status: string
}

interface Invoice {
   id: string
   invoiceNumber: string
   status: string
}

interface Customer {
   id: string
   name: string
   email: string
   phone: string
   type: 'B2B' | 'B2C'
   isEmailVerified: boolean
   isPhoneVerified: boolean
   createdAt: Date
   orders: Order[]
   quotations: Quotation[]
   invoices: Invoice[]
}

interface CompanyCustomersProps {
   customers: Customer[]
   companyId: string
}

export function CompanyCustomers({ customers, companyId }: CompanyCustomersProps) {
   if (customers.length === 0) {
      return (
         <Card>
            <CardHeader>
               <div className="flex items-center justify-between">
                  <CardTitle>Company Customers</CardTitle>
                  <Button asChild>
                     <Link href={`/customers/new?companyId=${companyId}`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Customer
                     </Link>
                  </Button>
               </div>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-8">
               <div className="text-center">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium">No customers yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                     Add the first customer for this company.
                  </p>
                  <Button className="mt-4" asChild>
                     <Link href={`/customers/new?companyId=${companyId}`}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Customer
                     </Link>
                  </Button>
               </div>
            </CardContent>
         </Card>
      )
   }

   return (
      <Card>
         <CardHeader>
            <div className="flex items-center justify-between">
               <CardTitle>Company Customers ({customers.length})</CardTitle>
               <Button asChild>
                  <Link href={`/customers/new?companyId=${companyId}`}>
                     <Plus className="mr-2 h-4 w-4" />
                     Add Customer
                  </Link>
               </Button>
            </div>
         </CardHeader>
         <CardContent>
            <div className="space-y-4">
               {customers.map((customer) => {
                  const totalOrders = customer.orders.length
                  const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0)
                  const pendingQuotations = customer.quotations.filter(q => q.status === 'PENDING').length
                  const unpaidInvoices = customer.invoices.filter(i => i.status === 'PENDING' || i.status === 'OVERDUE').length

                  return (
                     <div key={customer.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                           <div>
                              <h4 className="font-medium">{customer.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                 <Badge variant={customer.type === 'B2B' ? 'default' : 'secondary'}>
                                    {customer.type}
                                 </Badge>
                                 {customer.isEmailVerified && (
                                    <Badge variant="outline" className="text-xs">
                                       Email Verified
                                    </Badge>
                                 )}
                                 {customer.isPhoneVerified && (
                                    <Badge variant="outline" className="text-xs">
                                       Phone Verified
                                    </Badge>
                                 )}
                              </div>
                           </div>
                           <Button variant="outline" size="sm" asChild>
                              <Link href={`/customers/${customer.id}`}>
                                 <Eye className="mr-2 h-4 w-4" />
                                 View
                              </Link>
                           </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 mb-4">
                           <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                 <Mail className="h-4 w-4 text-muted-foreground" />
                                 <span>{customer.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                 <Phone className="h-4 w-4 text-muted-foreground" />
                                 <span>{customer.phone}</span>
                              </div>
                           </div>
                           
                           <div className="text-sm text-muted-foreground">
                              Joined {format(customer.createdAt, 'MMM dd, yyyy')}
                           </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-4 text-sm">
                           <div>
                              <span className="text-muted-foreground">Orders:</span>
                              <div className="font-medium">{totalOrders}</div>
                           </div>
                           <div>
                              <span className="text-muted-foreground">Total Spent:</span>
                              <div className="font-medium">
                                 Rp {(totalSpent / 100).toLocaleString('id-ID')}
                              </div>
                           </div>
                           <div>
                              <span className="text-muted-foreground">Pending Quotations:</span>
                              <div className="font-medium">{pendingQuotations}</div>
                           </div>
                           <div>
                              <span className="text-muted-foreground">Unpaid Invoices:</span>
                              <div className={`font-medium ${unpaidInvoices > 0 ? 'text-red-600' : ''}`}>
                                 {unpaidInvoices}
                              </div>
                           </div>
                        </div>
                     </div>
                  )
               })}
            </div>
         </CardContent>
      </Card>
   )
}