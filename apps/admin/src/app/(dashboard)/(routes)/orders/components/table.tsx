'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { ColumnDef } from '@tanstack/react-table'
import { CheckIcon, EditIcon, PackageIcon, TruckIcon, XIcon } from 'lucide-react'
import Link from 'next/link'

interface OrderTableProps {
   data: OrderColumn[]
}

export const OrderTable: React.FC<OrderTableProps> = ({ data }) => {
   return <DataTable columns={OrderColumns} data={data} />
}

export type OrderColumn = {
   id: string
   orderNumber: string
   quotationNumber: string
   customerName: string
   customerType: 'B2B' | 'B2C'
   status: 'NEW' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
   totalAmount: number // In cents
   trackingNumber: string | null
   hasInvoice: boolean
   invoiceStatus: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED' | null
   createdAt: string
   shippedAt: string | null
   deliveredAt: string | null
}

// Helper function to format IDR currency
function formatIDR(amountInCents: number): string {
   const amount = amountInCents / 100
   return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
   }).format(amount)
}

// Helper function to get status badge variant
function getStatusVariant(status: OrderColumn['status']) {
   switch (status) {
      case 'NEW':
         return 'secondary'
      case 'PROCESSING':
         return 'default'
      case 'SHIPPED':
         return 'outline'
      case 'DELIVERED':
         return 'default'
      case 'CANCELLED':
         return 'destructive'
      default:
         return 'secondary'
   }
}

// Helper function to get invoice status badge variant
function getInvoiceStatusVariant(status: OrderColumn['invoiceStatus']) {
   switch (status) {
      case 'PENDING':
         return 'secondary'
      case 'PAID':
         return 'default'
      case 'OVERDUE':
         return 'destructive'
      case 'CANCELLED':
         return 'outline'
      default:
         return 'secondary'
   }
}

export const OrderColumns: ColumnDef<OrderColumn>[] = [
   {
      accessorKey: 'orderNumber',
      header: 'Order Number',
      cell: ({ row }) => (
         <div className="font-medium">
            {row.getValue('orderNumber')}
         </div>
      ),
   },
   {
      accessorKey: 'quotationNumber',
      header: 'From Quotation',
      cell: ({ row }) => (
         <div className="text-sm text-muted-foreground">
            {row.getValue('quotationNumber')}
         </div>
      ),
   },
   {
      accessorKey: 'customerName',
      header: 'Customer',
      cell: ({ row }) => (
         <div>
            <div className="font-medium">{row.getValue('customerName')}</div>
            <Badge variant="outline" className="text-xs">
               {row.original.customerType}
            </Badge>
         </div>
      ),
   },
   {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
         const status = row.getValue('status') as OrderColumn['status']
         return (
            <Badge variant={getStatusVariant(status)}>
               {status === 'SHIPPED' && <TruckIcon className="w-3 h-3 mr-1" />}
               {status === 'DELIVERED' && <PackageIcon className="w-3 h-3 mr-1" />}
               {status}
            </Badge>
         )
      },
   },
   {
      accessorKey: 'totalAmount',
      header: 'Total Amount',
      cell: ({ row }) => (
         <div className="font-medium">
            {formatIDR(row.getValue('totalAmount'))}
         </div>
      ),
   },
   {
      accessorKey: 'trackingNumber',
      header: 'Tracking',
      cell: ({ row }) => {
         const trackingNumber = row.getValue('trackingNumber') as string | null
         return trackingNumber ? (
            <div className="text-sm font-mono">{trackingNumber}</div>
         ) : (
            <div className="text-sm text-muted-foreground">-</div>
         )
      },
   },
   {
      accessorKey: 'invoiceStatus',
      header: 'Invoice',
      cell: ({ row }) => {
         const hasInvoice = row.original.hasInvoice
         const invoiceStatus = row.getValue('invoiceStatus') as OrderColumn['invoiceStatus']
         
         if (!hasInvoice) {
            return <div className="text-sm text-muted-foreground">No Invoice</div>
         }
         
         return (
            <Badge variant={getInvoiceStatusVariant(invoiceStatus)}>
               {invoiceStatus === 'PAID' && <CheckIcon className="w-3 h-3 mr-1" />}
               {invoiceStatus === 'OVERDUE' && <XIcon className="w-3 h-3 mr-1" />}
               {invoiceStatus}
            </Badge>
         )
      },
   },
   {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ row }) => (
         <div className="text-sm">{row.getValue('createdAt')}</div>
      ),
   },
   {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
         <Link href={`/orders/${row.original.id}`}>
            <Button size="sm" variant="outline">
               <EditIcon className="h-4 w-4 mr-1" />
               Manage
            </Button>
         </Link>
      ),
   },
]
