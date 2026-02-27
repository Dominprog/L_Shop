export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  cart: CartItem[];
  deliveries: Delivery[];
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
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
}

export interface Delivery {
  id: string;
  userId: string;
  address: string;
  phone: string;
  email: string;
  paymentMethod: string;
  items: CartItem[];
  totalPrice: number;
  createdAt: string;
}

export interface RegisterBody {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AddToCartBody {
  productId: string;
  quantity: number;
}

export interface DeliveryBody {
  address: string;
  phone: string;
  email: string;
  paymentMethod: string;
}

export interface ProductsQuery {
  search?: string;
  category?: string;
  available?: string;
  sort?: string;
}
