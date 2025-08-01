'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { QuotationStatus } from '@prisma/client'
import { Check, ShoppingCart, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-hot-toast'

interface QuotationActionsProps {
  quotation: {
    id: string
    status: QuotationStatus
    convertedOrderId?: string | null
  }
}

export function QuotationActions({ quotation }: QuotationActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [openDialog, setOpenDialog] = useState<string | null>(null)

  const canApprove = quotation.status === QuotationStatus.PENDING
  const canReject = quotation.status === QuotationStatus.PENDING
  const canConvert = quotation.status === QuotationStatus.APPROVED && !quotation.convertedOrderId

  const handleStatusUpdate = async (newStatus: QuotationStatus) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/quotations/${quotation.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          notes: notes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update quotation status')
      }

      toast.success(`Quotation ${newStatus.toLowerCase()} successfully`)
      setOpenDialog(null)
      setNotes('')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConvertToOrder = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/quotations/${quotation.id}/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to convert quotation to order')
      }

      const result = await response.json()
      toast.success('Quotation converted to order successfully')
      setOpenDialog(null)
      
      // Redirect to the new order
      router.push(`/orders/${result.orderId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {canApprove && (
          <Dialog open={openDialog === 'approve'} onOpenChange={(open) => setOpenDialog(open ? 'approve' : null)}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="default">
                <Check className="h-4 w-4 mr-2" />
                Approve Quotation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Approve Quotation</DialogTitle>
                <DialogDescription>
                  Are you sure you want to approve this quotation? This will allow it to be converted to an order.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="approve-notes">Notes (optional)</Label>
                  <Textarea
                    id="approve-notes"
                    placeholder="Add any notes about the approval..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpenDialog(null)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleStatusUpdate(QuotationStatus.APPROVED)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Approving...' : 'Approve'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {canReject && (
          <Dialog open={openDialog === 'reject'} onOpenChange={(open) => setOpenDialog(open ? 'reject' : null)}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="destructive">
                <X className="h-4 w-4 mr-2" />
                Reject Quotation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Quotation</DialogTitle>
                <DialogDescription>
                  Are you sure you want to reject this quotation? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reject-notes">Reason for rejection</Label>
                  <Textarea
                    id="reject-notes"
                    placeholder="Please provide a reason for rejecting this quotation..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpenDialog(null)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleStatusUpdate(QuotationStatus.REJECTED)}
                  disabled={isLoading || !notes.trim()}
                >
                  {isLoading ? 'Rejecting...' : 'Reject'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {canConvert && (
          <Dialog open={openDialog === 'convert'} onOpenChange={(open) => setOpenDialog(open ? 'convert' : null)}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="secondary">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Convert to Order
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Convert to Order</DialogTitle>
                <DialogDescription>
                  This will create a new sales order from this approved quotation. The quotation status will be updated to "Converted".
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setOpenDialog(null)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConvertToOrder}
                  disabled={isLoading}
                >
                  {isLoading ? 'Converting...' : 'Convert to Order'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {quotation.convertedOrderId && (
          <Button className="w-full" variant="outline" asChild>
            <a href={`/orders/${quotation.convertedOrderId}`}>
              View Order
            </a>
          </Button>
        )}

        {quotation.status === QuotationStatus.EXPIRED && (
          <p className="text-sm text-muted-foreground text-center">
            This quotation has expired and cannot be modified.
          </p>
        )}

        {quotation.status === QuotationStatus.REJECTED && (
          <p className="text-sm text-muted-foreground text-center">
            This quotation has been rejected.
          </p>
        )}

        {quotation.status === QuotationStatus.CONVERTED && (
          <p className="text-sm text-muted-foreground text-center">
            This quotation has been converted to an order.
          </p>
        )}
      </CardContent>
    </Card>
  )
}