'use client'

import { ColumnDef } from '@tanstack/react-table'
import { formatIDRFromCents } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react'

export type PaymentReportRow = {
   id: string
   invoiceNumber: string
   orderNumber: string
   customerName: string
   customerType: 'B2B' | 'B2C'
   companyName?: string
   totalAmount: number
   status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
   dueDate: Date
   paidAt?: Date
   createdAt: Date
   daysPastDue?: number
}

export const paymentReportColumns: ColumnDef<PaymentReportRow>[] = [
   {
      accessorKey: 'invoiceNumber',
      header: 'No. Invoice',
   },
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
         const daysPastDue = row.original.daysPastDue
         
         const statusConfig = {
            'PENDING': { 
               label: 'Belum Dibayar', 
               variant: 'secondary' as const,
               icon: Clock
            },
            'PAID': { 
               label: 'Sudah Dibayar', 
               variant: 'default' as const,
               icon: CheckCircle
            },
            'OVERDUE': { 
               label: `Terlambat ${daysPastDue || 0} hari`, 
               variant: 'destructive' as const,
               icon: AlertTriangle
            },
            'CANCELLED': { 
               label: 'Dibatalkan', 
               variant: 'outline' as const,
               icon: XCircle
            },
         }
         
         const config = statusConfig[status] || statusConfig['PENDING']
         const Icon = config.icon
         
         return (
            <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
               <Icon className="h-3 w-3" />
               {config.label}
            </Badge>
         )
      },
   },
   {
      accessorKey: 'dueDate',
      header: 'Jatuh Tempo',
      cell: ({ row }) => {
         const dueDate = row.getValue('dueDate') as Date
         const status = row.original.status
         const isOverdue = status === 'OVERDUE'
         
         return (
            <div className={isOverdue ? 'text-red-600 font-medium' : ''}>
               {new Date(dueDate).toLocaleDateString('id-ID')}
            </div>
         )
      },
   },
   {
      accessorKey: 'paidAt',
      header: 'Tgl Bayar',
      cell: ({ row }) => {
         const paidAt = row.getValue('paidAt') as Date | undefined
         
         if (!paidAt) {
            return <div className="text-muted-foreground">-</div>
         }
         
         return <div>{new Date(paidAt).toLocaleDateString('id-ID')}</div>
      },
   },
   {
      accessorKey: 'createdAt',
      header: 'Tgl Dibuat',
      cell: ({ row }) => {
         const date = row.getValue('createdAt') as Date
         return <div>{new Date(date).toLocaleDateString('id-ID')}</div>
      },
   },
]