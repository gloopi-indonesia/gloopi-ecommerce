import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SalesReports } from './components/sales-reports'
import { PaymentReports } from './components/payment-reports'

export default function ReportsPage() {
   return (
      <div className="flex-col">
         <div className="flex-1 space-y-4 pt-4">
            <Heading 
               title="Laporan" 
               description="Laporan penjualan dan pembayaran" 
            />
            <Separator />
            
            <Tabs defaultValue="sales" className="space-y-4">
               <TabsList>
                  <TabsTrigger value="sales">Laporan Penjualan</TabsTrigger>
                  <TabsTrigger value="payments">Laporan Pembayaran</TabsTrigger>
               </TabsList>
               
               <TabsContent value="sales" className="space-y-4">
                  <SalesReports />
               </TabsContent>
               
               <TabsContent value="payments" className="space-y-4">
                  <PaymentReports />
               </TabsContent>
            </Tabs>
         </div>
      </div>
   )
}