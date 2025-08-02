import { Metadata } from 'next'
import { CustomerDashboard } from './components/customer-dashboard'

export const metadata: Metadata = {
   title: 'Dashboard - Gloopi',
   description: 'Dashboard pelanggan untuk melacak pesanan dan faktur',
}

export default function DashboardPage() {
   return <CustomerDashboard />
}