import { Metadata } from 'next'
import { QuotationDetail } from './components/quotation-detail'

export const metadata: Metadata = {
   title: 'Detail Penawaran - Gloopi',
   description: 'Detail penawaran dan status persetujuan',
}

interface QuotationDetailPageProps {
   params: { id: string }
}

export default function QuotationDetailPage({ params }: QuotationDetailPageProps) {
   return <QuotationDetail quotationId={params.id} />
}