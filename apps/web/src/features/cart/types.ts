export type CartItem = {
  id: string;
  variantId: string;
  productName: string;
  variantLabel: string;
  thumbnail: string;
  quantity: number;
  /** Price captured when the item was added — compare against current price at checkout. */
  addedPrice: number;
};

export type Cart = {
  id: string;
  items: CartItem[];
  subtotal: number;
};
