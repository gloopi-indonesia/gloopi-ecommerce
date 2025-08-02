import { Metadata } from 'next'
import { InvoiceDetail } from './components/invoice-detail'

export const metadata: Metadata = {
   title: 'Detail Faktur - Gloopi',
   description: 'Detail faktur dan status pembayaran',
}

interface InvoiceDetailPageProps {
   params: { id: string }
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
   return <InvoiceDetail invoiceId={params.id} />
}