export function writeLocalCart(items: any) {
   if (typeof window !== 'undefined') {
      window.localStorage.setItem('Cart', JSON.stringify(items))
   }
}

export function getLocalCart() {
   if (typeof window !== 'undefined' && window.localStorage) {
      try {
         const stored = window.localStorage.getItem('Cart')
         return stored ? JSON.parse(stored) : { items: [] }
      } catch (_error) {
         writeLocalCart({ items: [] })
         return { items: [] }
      }
   }
   return { items: [] }
}

export function getCountInCart({ cartItems, productId }: { cartItems: any[], productId: string }) {
   try {
      if (!cartItems || !Array.isArray(cartItems)) {
         return 0
      }

      for (let i = 0; i < cartItems.length; i++) {
         if (cartItems[i]?.productId === productId) {
            return cartItems[i]?.quantity || cartItems[i]?.count || 0
         }
      }

      return 0
   } catch (_error) {
      return 0
   }
}
