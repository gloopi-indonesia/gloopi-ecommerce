import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
   return (
      <div className="block space-y-4 my-6">
         <div className="flex items-center justify-between">
            <div>
               <Skeleton className="h-8 w-48" />
               <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <Skeleton className="h-10 w-32" />
         </div>
         
         <Skeleton className="h-px w-full" />
         
         <div className="space-y-4">
            <div className="flex items-center gap-4">
               <Skeleton className="h-10 w-64" />
               <Skeleton className="h-10 w-40" />
            </div>
            
            <div className="space-y-2">
               {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                     <Skeleton className="h-10 w-10 rounded-full" />
                     <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-3 w-32" />
                     </div>
                     <div className="space-y-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                     </div>
                     <Skeleton className="h-8 w-8" />
                  </div>
               ))}
            </div>
         </div>
      </div>
   )
}