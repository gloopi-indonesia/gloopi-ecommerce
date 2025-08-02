'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuthentication } from '@/hooks/useAuthentication'
import { Loader, Package, Receipt, FileText, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { OrdersTab } from './orders-tab'
import { InvoicesTab } from './invoices-tab'
import { QuotationsTab } from './quotations-tab'
import { DashboardOverview } from './dashboard-overview'

interface DashboardData {
  orders: any[]
  invoices: any[]
  quotations: any[]
}

export function CustomerDashboard() {
  const { customer, isLoading: authLoading } = useAuthentication()
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<DashboardData>({
    orders: [],
    invoices: [],
    quotations: [],
  })
  const [activeTab, setActiveTab] = useState('overview')
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !customer) {
      router.push('/login')
      return
    }

    if (customer) {
      fetchDashboardData()
    }
  }, [customer, authLoading, router])

  // Handle URL tab parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const tab = urlParams.get('tab')
      if (tab && ['overview', 'orders', 'invoices', 'quotations'].includes(tab)) {
        setActiveTab(tab)
      }
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)

      // Fetch all data in parallel
      const [ordersRes, invoicesRes, quotationsRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/invoices'),
        fetch('/api/quotations'),
      ])

      const [ordersData, invoicesData, quotationsData] = await Promise.all([
        ordersRes.json(),
        invoicesRes.json(),
        quotationsRes.json(),
      ])

      if (ordersRes.ok && invoicesRes.ok && quotationsRes.ok) {
        setData({
          orders: ordersData.orders || [],
          invoices: invoicesData.invoices || [],
          quotations: quotationsData.quotations || [],
        })
      } else {
        toast.error('Gagal memuat data dashboard')
      }
    } catch (error) {
      console.error('Dashboard data fetch error:', error)
      toast.error('Terjadi kesalahan saat memuat data')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <Loader className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!customer) {
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang, {customer.name}. Kelola pesanan dan faktur Anda di sini.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Ringkasan
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Pesanan ({data.orders.length})
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Faktur ({data.invoices.length})
          </TabsTrigger>
          <TabsTrigger value="quotations" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Penawaran ({data.quotations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DashboardOverview 
            orders={data.orders}
            invoices={data.invoices}
            quotations={data.quotations}
            onRefresh={fetchDashboardData}
          />
        </TabsContent>

        <TabsContent value="orders">
          <OrdersTab 
            orders={data.orders}
            onRefresh={fetchDashboardData}
          />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoicesTab 
            invoices={data.invoices}
            onRefresh={fetchDashboardData}
          />
        </TabsContent>

        <TabsContent value="quotations">
          <QuotationsTab 
            quotations={data.quotations}
            onRefresh={fetchDashboardData}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}