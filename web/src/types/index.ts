// ===== Enums =====

export type UserRole = 'CUSTOMER' | 'ADMIN';

export type OrderStatus =
  | 'ORDER_PLACED'
  | 'AWAITING_DELIVERY_QUOTE'
  | 'DELIVERY_FEE_QUOTED_PAYMENT_REQUIRED'
  | 'PAYMENT_SUBMITTED_AWAITING_CONFIRMATION'
  | 'PAYMENT_CONFIRMED'
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'READY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type ProductCategory = 'CLASSIC' | 'SPECIALTY' | 'SEASONAL' | 'BEST_SELLERS';

// ===== Auth =====

export interface AuthUser {
  token: string;
  userId: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  phoneNumber: string;
}

// ===== Product =====

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  available: boolean;
}

export interface ProductPage {
  content: Product[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
}

export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  available: boolean;
}

// ===== Cart =====

export interface CartItem {
  cartItemId: number;
  productId: number;
  productName: string;
  productImageUrl: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  cartId: number;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}

export interface AddToCartRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// ===== Order =====

export interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  orderId: number;
  orderDate: string;
  status: OrderStatus;
  deliveryAddress: string;
  contactNumber: string;
  deliveryNotes: string;
  items: OrderItem[];
  totalAmount: number;
  itemCount?: number;
}

export interface CheckoutRequest {
  deliveryAddress: string;
  contactNumber: string;
  deliveryNotes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

// ===== API Error =====

export interface ApiError {
  status: number;
  error: string;
  message: string;
  timestamp: string;
}
