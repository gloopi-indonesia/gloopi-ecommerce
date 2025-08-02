import { Heading } from '@/components/ui/heading'
import { Separator } from '@/components/ui/separator'
import { AnalyticsDashboard } from './components/analytics-dashboard'

export default function AnalyticsPage() {
   return (
      <div className="flex-col">
         <div className="flex-1 space-y-4 pt-4">
            <Heading 
               title="Analytics" 
               description="Business metrics and performance indicators" 
            />
            <Separator />
            
            <AnalyticsDashboard />
         </div>
      </div>
   )
}