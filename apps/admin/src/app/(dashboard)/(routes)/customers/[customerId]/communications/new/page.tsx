import { notFound } from 'next/navigation'
import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'

import { CommunicationForm } from './components/communication-form'

interface NewCommunicationPageProps {
   params: {
      customerId: string
   }
}

export default async function NewCommunicationPage({ params }: NewCommunicationPageProps) {
   const customer = await prisma.customer.findUnique({
      where: {
         id: params.customerId,
      },
      include: {
         company: true,
         quotations: {
            where: {
               status: {
                  in: ['PENDING', 'APPROVED']
               }
            },
            orderBy: {
               createdAt: 'desc'
            }
         }
      },
   })

   if (!customer) {
      notFound()
   }

   return (
      <div className="space-y-4">
         <div>
            <Heading 
               title="New Communication" 
               description={`Send a message to ${customer.name}`} 
            />
         </div>
         <Separator />
         <CommunicationForm 
            customer={customer}
            quotations={customer.quotations}
         />
      </div>
   )
}