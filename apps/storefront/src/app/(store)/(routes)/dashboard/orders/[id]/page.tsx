import { Metadata } from 'next'
import { OrderDetail } from './components/order-detail'

export const metadata: Metadata = {
   title: 'Detail Pesanan - Gloopi',
   description: 'Detail pesanan dan status pengiriman',
}

interface OrderDetailPageProps {
   params: { id: string }
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
   return <OrderDetail orderId={params.id} />
}