export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  cart: CartItem[];
  deliveries: Delivery[];
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  imageUrl: string;
  stock: number;
  tags: string[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  text: string;
  rating: number;
  createdAt: string;
}

export interface Delivery {
  id: string;
  address: string;
  totalPrice: number;
  createdAt: string;
}
