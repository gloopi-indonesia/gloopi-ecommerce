'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { Clock } from 'lucide-react'

interface QuotationStatusLogProps {
  quotation: any // Using any for now to avoid type conflicts with existing schema
}

export function QuotationStatusLog({ quotation }: QuotationStatusLogProps) {
  const statusLogs = quotation.statusLogs || []

  if (statusLogs.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Status History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statusLogs.map((log, index) => (
            <div key={log.id} className="relative">
              {index < statusLogs.length - 1 && (
                <div className="absolute left-2 top-8 h-full w-px bg-border" />
              )}
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-primary mt-1 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      {log.fromStatus ? `${log.fromStatus} → ${log.toStatus}` : `Set to ${log.toStatus}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    by {log.adminUser.name}
                  </p>
                  {log.notes && (
                    <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                      {log.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}