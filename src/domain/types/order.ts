export type OrderStatus =
  | 'WAITING_PAYMENT'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'COMPLETED'
  | 'CANCELLED';

export type UserRole = 'guest' | 'staff' | 'owner';

export interface Customer {
  whatsapp: string; // Normalized (e.g. "081234567890")
  name: string;
  address: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  remainingStock: number;
  initialQuota: number;
  imageUrl?: string;
  isActive: boolean;
  updatedAt?: string;
}

export interface OrderItem {
  menuId: string;
  menuName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerSnapshot: Customer;
  items: OrderItem[];
  subtotalMenu: number;
  deliveryFee: number; // Flat 10000
  discount: number;    // Default 0
  totalAmount: number; // >= 0
  status: OrderStatus;
  paymentProofUrl?: string;
  orderDate: string;   // "YYYY-MM-DD"
  orderTime: string;   // ISO string
  confirmedBy?: 'Dina' | 'Rani' | string;
  paymentConfirmedAt?: string;
  cancellationReason?: string;
  cancelledBy?: 'SYSTEM' | 'Dina' | 'Rani';
  cancelledAt?: string;
}

export interface CreateOrderDTO {
  customer: {
    whatsapp: string;
    name: string;
    address: string;
  };
  items: Array<{
    menuId: string;
    quantity: number;
  }>;
}

export interface UpdateOrderStatusDTO {
  orderId: string;
  nextStatus: OrderStatus;
  userRole: UserRole;
  confirmedBy?: 'Dina' | 'Rani' | string;
  cancellationReason?: string;
  cancelledBy?: 'SYSTEM' | 'Dina' | 'Rani';
}
