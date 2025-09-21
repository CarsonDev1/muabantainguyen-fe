import api from '@/lib/api';

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: string;
  quantity: number;
  image_url?: string;
  slug: string;
}

export interface CartResponse {
  message: string;
  cartId: string;
  items: CartItem[];
  total: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  productId: string;
  quantity: number;
}

export interface RemoveFromCartRequest {
  productId: string;
}

const cartService = {
  // Get current user's cart
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Add item to cart
  addToCart: async (data: AddToCartRequest): Promise<CartResponse> => {
    const response = await api.post('/cart/add', data);
    return response.data;
  },

  // Update item quantity
  updateCartItem: async (data: UpdateCartItemRequest): Promise<CartResponse> => {
    const response = await api.put('/cart/update', data);
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (data: RemoveFromCartRequest): Promise<CartResponse> => {
    const response = await api.post('/cart/remove', data);
    return response.data;
  },

  // Clear the cart
  clearCart: async (): Promise<CartResponse> => {
    const response = await api.post('/cart/clear');
    return response.data;
  },
};

export default cartService;
