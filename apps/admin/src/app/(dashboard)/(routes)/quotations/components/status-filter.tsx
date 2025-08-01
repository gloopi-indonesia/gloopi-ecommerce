'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { QuotationStatus } from '@prisma/client'
import { useRouter, useSearchParams } from 'next/navigation'

export function StatusFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStatus = searchParams.get('status')

  const handleStatusChange = (status: string) => {
    const params = new URLSearchParams(searchParams)
    
    if (status === 'all') {
      params.delete('status')
    } else {
      params.set('status', status)
    }
    
    router.push(`/quotations?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/quotations')
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={currentStatus || 'all'} onValueChange={handleStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value={QuotationStatus.PENDING}>Pending</SelectItem>
          <SelectItem value={QuotationStatus.APPROVED}>Approved</SelectItem>
          <SelectItem value={QuotationStatus.REJECTED}>Rejected</SelectItem>
          <SelectItem value={QuotationStatus.CONVERTED}>Converted</SelectItem>
          <SelectItem value={QuotationStatus.EXPIRED}>Expired</SelectItem>
        </SelectContent>
      </Select>
      
      {currentStatus && (
        <Button variant="outline" onClick={clearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  )
}