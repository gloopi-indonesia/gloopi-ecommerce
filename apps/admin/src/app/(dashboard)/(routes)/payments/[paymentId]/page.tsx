import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import prisma from '@/lib/prisma'

export default async function PaymentPage() {

   return (
      <div className="block space-y-4 my-6">
         <Heading
            title="Payment Data"
            description="Items in this order and data about the user."
         />
         <Separator />
      </div>
   )
}
