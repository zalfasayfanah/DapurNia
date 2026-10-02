import { Order, CreateOrderDTO, UpdateOrderStatusDTO } from '../../domain/types';
import { IOrderRepository } from '../../services';

/**
 * FirebaseOrderAdapter
 * Blueprint for Firestore & Firebase Storage integration.
 * In live mode, this uses Firestore collection('orders') with real-time snapshots (onSnapshot).
 */
export class FirebaseOrderAdapter implements IOrderRepository {
  constructor(private db?: any, private storage?: any) {}

  async placeOrder(
    orderInput: CreateOrderDTO,
    serverTime?: Date
  ): Promise<{ orderId: string; totalAmount: number }> {
    throw new Error('Firebase integration will be activated when .env is configured.');
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    throw new Error('Firebase integration will be activated when .env is configured.');
  }

  async getAllOrders(): Promise<Order[]> {
    throw new Error('Firebase integration will be activated when .env is configured.');
  }

  subscribeOrdersByDate(date: string, callback: (orders: Order[]) => void): () => void {
    return () => {};
  }

  async updateOrderStatus(params: UpdateOrderStatusDTO): Promise<void> {
    throw new Error('Firebase integration will be activated when .env is configured.');
  }

  async uploadPaymentProof(orderId: string, file: File): Promise<string> {
    throw new Error('Firebase integration will be activated when .env is configured.');
  }
}
