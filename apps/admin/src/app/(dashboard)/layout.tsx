'use client'

import { Sidebar } from '@/components/sidebar'
import TopHeader from '@/components/top-header'
import { SidebarProvider, useSidebar } from '@/providers/sidebar-provider'
import { cn } from '@/lib/utils'

function DashboardContent({ children }: { children: React.ReactNode }) {
   const { isCollapsed } = useSidebar()

   return (
      <div className="h-screen flex">
         {/* Sidebar */}
         <Sidebar />

         {/* Main content area */}
         <div className={cn(
            "flex-1 flex flex-col transition-all duration-300 ease-in-out",
            "lg:ml-64", // Default expanded state
            isCollapsed && "lg:ml-16" // Collapsed state
         )}>
            <TopHeader />
            <main className="flex-1 overflow-y-auto p-4 lg:p-6">
               {children}
            </main>
         </div>
      </div>
   )
}

export default function DashboardLayout({
   children,
}: {
   children: React.ReactNode
}) {
   return (
      <SidebarProvider>
         <DashboardContent>{children}</DashboardContent>
      </SidebarProvider>
   )
}
