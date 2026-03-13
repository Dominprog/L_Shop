export type UserRole = 'user' | 'admin';

export interface RecommendedTag {
  tag: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  cart: CartItem[];
  deliveries: Delivery[];
  likes: string[];
  recommendedTags: RecommendedTag[];
  createdAt: string;
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

export interface ProductBody {
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  imageUrl: string;
  stock: number;
  tags: string[];
}

export interface CommentBody {
  text: string;
  rating: number;
}
