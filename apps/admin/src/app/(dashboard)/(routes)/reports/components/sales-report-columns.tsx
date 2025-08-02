'use client'

import { ColumnDef } from '@tanstack/react-table'
import { formatIDRFromCents } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export type SalesReportRow = {
   id: string
   orderNumber: string
   customerName: string
   customerType: 'B2B' | 'B2C'
   companyName?: string
   totalAmount: number
   status: string
   createdAt: Date
   items: {
      productName: string
      quantity: number
      unitPrice: number
      useCase: string
   }[]
}

export const salesReportColumns: ColumnDef<SalesReportRow>[] = [
   {
      accessorKey: 'orderNumber',
      header: 'No. Order',
   },
   {
      accessorKey: 'customerName',
      header: 'Pelanggan',
      cell: ({ row }) => {
         const customerName = row.getValue('customerName') as string
         const customerType = row.original.customerType
         const companyName = row.original.companyName
         
         return (
            <div>
               <div className="font-medium">{customerName}</div>
               {customerType === 'B2B' && companyName && (
                  <div className="text-sm text-muted-foreground">{companyName}</div>
               )}
               <Badge variant={customerType === 'B2B' ? 'default' : 'secondary'} className="text-xs">
                  {customerType}
               </Badge>
            </div>
         )
      },
   },
   {
      accessorKey: 'totalAmount',
      header: 'Total',
      cell: ({ row }) => {
         const amount = row.getValue('totalAmount') as number
         return <div className="font-medium">{formatIDRFromCents(amount)}</div>
      },
   },
   {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
         const status = row.getValue('status') as string
         const statusMap = {
            'NEW': { label: 'Baru', variant: 'secondary' as const },
            'PROCESSING': { label: 'Diproses', variant: 'default' as const },
            'SHIPPED': { label: 'Dikirim', variant: 'default' as const },
            'DELIVERED': { label: 'Selesai', variant: 'default' as const },
            'CANCELLED': { label: 'Dibatalkan', variant: 'destructive' as const },
         }
         
         const statusInfo = statusMap[status] || { label: status, variant: 'secondary' as const }
         
         return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      },
   },
   {
      accessorKey: 'createdAt',
      header: 'Tanggal',
      cell: ({ row }) => {
         const date = row.getValue('createdAt') as Date
         return <div>{new Date(date).toLocaleDateString('id-ID')}</div>
      },
   },
   {
      id: 'products',
      header: 'Produk',
      cell: ({ row }) => {
         const items = row.original.items
         return (
            <div className="space-y-1">
               {items.map((item, index) => (
                  <div key={index} className="text-sm">
                     <div className="font-medium">{item.productName}</div>
                     <div className="text-muted-foreground">
                        {item.quantity}x @ {formatIDRFromCents(item.unitPrice)}
                     </div>
                     <Badge variant="outline" className="text-xs">
                        {item.useCase}
                     </Badge>
                  </div>
               ))}
            </div>
         )
      },
   },
]