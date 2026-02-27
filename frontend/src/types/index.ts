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

export interface CartItemWithProduct {
  productId: string;
  quantity: number;
  product: Product;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Delivery {
  id: string;
  address: string;
  phone: string;
  email: string;
  paymentMethod: string;
  totalPrice: number;
  createdAt: string;
}
