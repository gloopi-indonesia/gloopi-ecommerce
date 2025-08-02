import prisma from '@/lib/prisma'

export const getTotalRevenue = async () => {
   const paidOrders = await prisma.order.findMany({
      where: {
         invoice: {
            status: 'PAID',
         },
      },
      include: {
         items: {
            include: {
               product: { include: { categories: true } },
            },
         },
      },
   })

   const totalRevenue = paidOrders.reduce((total, order) => {
      const orderTotal = order.items.reduce((orderSum, item) => {
         return orderSum + item.totalPrice
      }, 0)
      return total + orderTotal
   }, 0)

   return totalRevenue
}
