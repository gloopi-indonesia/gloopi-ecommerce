import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { quotationManager } from '@/lib/services/quotation-manager'
import { QuotationStatus } from '@prisma/client'
import { format } from 'date-fns'

import { StatusFilter } from './components/status-filter'
import type { QuotationColumn } from './components/table'
import { QuotationTable } from './components/table'

interface QuotationsPageProps {
  searchParams: {
    status?: QuotationStatus
  }
}

export default async function QuotationsPage({ searchParams }: QuotationsPageProps) {
  const { status } = searchParams ?? {}

  // Get quotations based on status filter
  let quotations
  if (status) {
    quotations = await quotationManager.getQuotationsByStatus(status)
  } else {
    // Get all quotations if no status filter
    const allStatuses = [
      QuotationStatus.PENDING,
      QuotationStatus.APPROVED,
      QuotationStatus.REJECTED,
      QuotationStatus.CONVERTED,
      QuotationStatus.EXPIRED
    ]
    
    const quotationPromises = allStatuses.map(s => quotationManager.getQuotationsByStatus(s))
    const quotationArrays = await Promise.all(quotationPromises)
    quotations = quotationArrays.flat().sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }

  const formattedQuotations: QuotationColumn[] = quotations.map((quotation) => ({
    id: quotation.id,
    quotationNumber: quotation.quotationNumber,
    customerName: quotation.customer.name,
    customerType: quotation.customer.type,
    status: quotation.status,
    totalAmount: quotation.totalAmount,
    validUntil: quotation.validUntil,
    createdAt: format(quotation.createdAt, 'MMM dd, yyyy'),
    itemCount: quotation.items.length
  }))

  return (
    <div className="block space-y-4 my-6">
      <Heading
        title={`Quotations (${quotations.length})`}
        description="Manage customer quotations and purchase order requests"
      />
      <Separator />
      <div className="grid grid-cols-4 gap-2">
        <StatusFilter />
      </div>
      <QuotationTable data={formattedQuotations} />
    </div>
  )
}