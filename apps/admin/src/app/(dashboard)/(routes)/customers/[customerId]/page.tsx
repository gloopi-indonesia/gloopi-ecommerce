import { notFound } from 'next/navigation'
import { Heading } from '@/components/ui/heading'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
   Building2, 
   Mail, 
   Phone, 
   MapPin, 
   Calendar,
   ShoppingCart,
   FileText,
   MessageCircle,
   Edit
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import prisma from '@/lib/prisma'

import { CustomerOrderHistory } from '../components/customer-order-history'
import { CustomerCommunications } from '../components/customer-communications'
import { CustomerQuotations } from '../components/customer-quotations'

interface CustomerDetailPageProps {
   params: {
      customerId: string
   }
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
   const customer = await prisma.customer.findUnique({
      where: {
         id: params.customerId,
      },
      include: {
         company: true,
         addresses: true,
         orders: {
            include: {
               items: {
                  include: {
                     product: true,
                  },
               },
               invoice: true,
            },
            orderBy: {
               createdAt: 'desc',
            },
         },
         quotations: {
            include: {
               items: {
                  include: {
                     product: true,
                  },
               },
            },
            orderBy: {
               createdAt: 'desc',
            },
         },
         communications: {
            include: {
               adminUser: true,
            },
            orderBy: {
               createdAt: 'desc',
            },
         },
         invoices: {
            include: {
               order: true,
            },
            orderBy: {
               createdAt: 'desc',
            },
         },
      },
   })

   if (!customer) {
      notFound()
   }

   const totalOrders = customer.orders.length
   const totalSpent = customer.orders.reduce((sum, order) => sum + order.totalAmount, 0)
   const pendingQuotations = customer.quotations.filter(q => q.status === 'PENDING').length
   const lastCommunication = customer.communications[0]

   return (
      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <Heading 
               title={customer.name} 
               description={`Customer ID: ${customer.id}`} 
            />
            <div className="flex gap-2">
               <Button variant="outline" asChild>
                  <Link href={`/customers/${customer.id}/edit`}>
                     <Edit className="mr-2 h-4 w-4" />
                     Edit Customer
                  </Link>
               </Button>
               <Button asChild>
                  <Link href={`/customers/${customer.id}/communications/new`}>
                     <MessageCircle className="mr-2 h-4 w-4" />
                     Contact Customer
                  </Link>
               </Button>
            </div>
         </div>

         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{totalOrders}</div>
               </CardContent>
            </Card>
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
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
                  <CardTitle className="text-sm font-medium">Pending Quotations</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-2xl font-bold">{pendingQuotations}</div>
               </CardContent>
            </Card>
            <Card>
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Last Contact</CardTitle>
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
               </CardHeader>
               <CardContent>
                  <div className="text-sm">
                     {lastCommunication 
                        ? format(lastCommunication.createdAt, 'MMM dd, yyyy')
                        : 'Never'
                     }
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1">
               <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                     <Badge variant={customer.type === 'B2B' ? 'default' : 'secondary'}>
                        {customer.type}
                     </Badge>
                     {customer.isEmailVerified && (
                        <Badge variant="outline">Email Verified</Badge>
                     )}
                     {customer.isPhoneVerified && (
                        <Badge variant="outline">Phone Verified</Badge>
                     )}
                  </div>
                  
                  <div className="space-y-3">
                     <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{customer.email}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{customer.phone}</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                           Joined {format(customer.createdAt, 'MMM dd, yyyy')}
                        </span>
                     </div>
                  </div>

                  {customer.company && (
                     <div className="pt-4 border-t">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                           <Building2 className="h-4 w-4" />
                           Company Information
                        </h4>
                        <div className="space-y-2 text-sm">
                           <div>
                              <span className="font-medium">{customer.company.name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                 {customer.company.industry.toLowerCase()}
                              </Badge>
                           </div>
                           <div className="text-muted-foreground">
                              Tax ID: {customer.company.taxId}
                           </div>
                           <div className="text-muted-foreground">
                              Registration: {customer.company.registrationNumber}
                           </div>
                           <div className="text-muted-foreground">
                              Contact: {customer.company.contactPerson}
                           </div>
                        </div>
                     </div>
                  )}

                  {customer.addresses.length > 0 && (
                     <div className="pt-4 border-t">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                           <MapPin className="h-4 w-4" />
                           Addresses
                        </h4>
                        <div className="space-y-2">
                           {customer.addresses.map((address) => (
                              <div key={address.id} className="text-sm">
                                 <div className="flex items-center gap-2">
                                    <span className="font-medium">{address.label || 'Address'}</span>
                                    {address.isDefault && (
                                       <Badge variant="outline" className="text-xs">Default</Badge>
                                    )}
                                 </div>
                                 <div className="text-muted-foreground">
                                    {address.address}, {address.city}, {address.province} {address.postalCode}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </CardContent>
            </Card>

            <div className="md:col-span-2">
               <Tabs defaultValue="orders" className="space-y-4">
                  <TabsList>
                     <TabsTrigger value="orders">Orders</TabsTrigger>
                     <TabsTrigger value="quotations">Quotations</TabsTrigger>
                     <TabsTrigger value="communications">Communications</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="orders">
                     <CustomerOrderHistory orders={customer.orders} />
                  </TabsContent>
                  
                  <TabsContent value="quotations">
                     <CustomerQuotations quotations={customer.quotations} />
                  </TabsContent>
                  
                  <TabsContent value="communications">
                     <CustomerCommunications 
                        communications={customer.communications}
                        customerId={customer.id}
                     />
                  </TabsContent>
               </Tabs>
            </div>
         </div>
      </div>
   )
}