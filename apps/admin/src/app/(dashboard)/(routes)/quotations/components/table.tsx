'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { QuotationStatus } from '@prisma/client'
import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { Eye } from 'lucide-react'
import Link from 'next/link'

interface QuotationTableProps {
  data: QuotationColumn[]
}

export const QuotationTable: React.FC<QuotationTableProps> = ({ data }) => {
  return <DataTable columns={QuotationColumns} data={data} />
}

export type QuotationColumn = {
  id: string
  quotationNumber: string
  customerName: string
  customerType: string
  status: QuotationStatus
  totalAmount: number
  validUntil: Date
  createdAt: string
  itemCount: number
}

// Helper function to format IDR currency
const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount / 100) // Convert from cents to rupiah
}

// Helper function to get status badge variant
const getStatusBadgeVariant = (status: QuotationStatus) => {
  switch (status) {
    case QuotationStatus.PENDING:
      return 'outline'
    case QuotationStatus.APPROVED:
      return 'default'
    case QuotationStatus.REJECTED:
      return 'destructive'
    case QuotationStatus.CONVERTED:
      return 'secondary'
    case QuotationStatus.EXPIRED:
      return 'outline'
    default:
      return 'outline'
  }
}

// Helper function to get status display text
const getStatusText = (status: QuotationStatus) => {
  switch (status) {
    case QuotationStatus.PENDING:
      return 'Pending'
    case QuotationStatus.APPROVED:
      return 'Approved'
    case QuotationStatus.REJECTED:
      return 'Rejected'
    case QuotationStatus.CONVERTED:
      return 'Converted'
    case QuotationStatus.EXPIRED:
      return 'Expired'
    default:
      return status
  }
}

export const QuotationColumns: ColumnDef<QuotationColumn>[] = [
  {
    accessorKey: 'quotationNumber',
    header: 'Quotation Number',
    cell: ({ row }) => (
      <div className="font-medium">
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
        <div className="text-sm text-muted-foreground">
          {row.original.customerType}
        </div>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as QuotationStatus
      return (
        <Badge variant={getStatusBadgeVariant(status)}>
          {getStatusText(status)}
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
    accessorKey: 'itemCount',
    header: 'Items',
    cell: ({ row }) => (
      <div className="text-center">
        {row.getValue('itemCount')} item(s)
      </div>
    ),
  },
  {
    accessorKey: 'validUntil',
    header: 'Valid Until',
    cell: ({ row }) => {
      const validUntil = row.getValue('validUntil') as Date
      const isExpired = new Date() > validUntil
      return (
        <div className={isExpired ? 'text-red-600' : ''}>
          {format(validUntil, 'MMM dd, yyyy')}
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Link href={`/quotations/${row.original.id}`}>
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
        </Link>
      </div>
    ),
  },
]