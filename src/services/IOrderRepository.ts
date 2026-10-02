import { Order, CreateOrderDTO, UpdateOrderStatusDTO } from '../domain/types';

export interface IOrderRepository {
  placeOrder(orderInput: CreateOrderDTO, serverTime?: Date): Promise<{ orderId: string; totalAmount: number }>;
  getOrderById(orderId: string): Promise<Order | null>;
  getAllOrders(): Promise<Order[]>;
  subscribeOrdersByDate(date: string, callback: (orders: Order[]) => void): () => void;
  updateOrderStatus(params: UpdateOrderStatusDTO): Promise<void>;
  uploadPaymentProof(orderId: string, file: File): Promise<string>;
}
