import {
  Customer,
  MenuItem,
  Order,
  CreateOrderDTO,
  UpdateOrderStatusDTO,
} from '../../domain/types';
import {
  IOrderRepository,
  IMenuRepository,
  ICustomerRepository,
  IReportRepository,
  SoldPortionSummary,
  RevenueSummary,
} from '../../services';
import {
  calculateOrderTotal,
  isValidStatusTransition,
  normalizeWhatsApp,
  isInsideComplex,
  isOrderTimeValid,
} from '../../domain';

export class MockStorageAdapter
  implements IOrderRepository, IMenuRepository, ICustomerRepository, IReportRepository
{
  private customers: Map<string, Customer> = new Map();
  private menus: Map<string, MenuItem> = new Map();
  private orders: Map<string, Order> = new Map();
  private orderSubscribers: Set<(orders: Order[]) => void> = new Set();
  private menuSubscribers: Set<(menus: MenuItem[]) => void> = new Set();
  private orderCounter: number = 1;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const initialMenus: MenuItem[] = [
      {
        id: 'menu-1',
        name: 'Ayam Bakar Madu + Nasi & Lalapan',
        price: 25000.0,
        remainingStock: 25,
        initialQuota: 25,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'menu-2',
        name: 'Rendang Sapi Dapur Nia + Nasi',
        price: 30000.0,
        remainingStock: 20,
        initialQuota: 20,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'menu-3',
        name: 'Ikan Gurame Goreng Sambal Terasi',
        price: 28000.0,
        remainingStock: 15,
        initialQuota: 15,
        isActive: true,
        imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80',
      },
    ];

    for (const menu of initialMenus) {
      this.menus.set(menu.id, menu);
    }
  }

  // --- IMenuRepository ---

  async getMenus(): Promise<MenuItem[]> {
    return Array.from(this.menus.values());
  }

  subscribeTodayMenus(callback: (menus: MenuItem[]) => void): () => void {
    this.menuSubscribers.add(callback);
    callback(Array.from(this.menus.values()));
    return () => this.menuSubscribers.delete(callback);
  }

  private notifyMenuSubscribers() {
    const list = Array.from(this.menus.values());
    this.menuSubscribers.forEach((cb) => cb(list));
  }

  async createMenu(menuData: {
    name: string;
    price: number;
    initialQuota: number;
    imageUrl?: string;
    isActive?: boolean;
  }): Promise<MenuItem> {
    const id = `menu-${Date.now()}`;
    const newMenu: MenuItem = {
      id,
      name: menuData.name,
      price: menuData.price,
      initialQuota: menuData.initialQuota,
      remainingStock: menuData.initialQuota,
      imageUrl:
        menuData.imageUrl ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      isActive: menuData.isActive !== undefined ? menuData.isActive : true,
      updatedAt: new Date().toISOString(),
    };
    this.menus.set(id, newMenu);
    this.notifyMenuSubscribers();
    return newMenu;
  }

  async updateMenuPrice(menuId: string, newPrice: number): Promise<void> {
    const menu = this.menus.get(menuId);
    if (!menu) throw new Error('Menu tidak ditemukan');
    menu.price = newPrice;
    menu.updatedAt = new Date().toISOString();
    this.notifyMenuSubscribers();
  }

  async updateMenuQuota(menuId: string, newQuota: number): Promise<void> {
    const menu = this.menus.get(menuId);
    if (!menu) throw new Error('Menu tidak ditemukan');
    menu.initialQuota = newQuota;
    menu.remainingStock = newQuota;
    menu.updatedAt = new Date().toISOString();
    this.notifyMenuSubscribers();
  }

  async deleteMenu(menuId: string): Promise<void> {
    const deleted = this.menus.delete(menuId);
    if (!deleted) throw new Error('Menu tidak ditemukan');
    this.notifyMenuSubscribers();
  }

  // --- ICustomerRepository ---

  async getCustomerByWhatsApp(whatsapp: string): Promise<Customer | null> {
    const normalized = normalizeWhatsApp(whatsapp);
    return this.customers.get(normalized) || null;
  }

  async saveCustomer(customer: Customer): Promise<void> {
    const normalized = normalizeWhatsApp(customer.whatsapp);
    this.customers.set(normalized, {
      ...customer,
      whatsapp: normalized,
      updatedAt: new Date().toISOString(),
    });
  }

  // --- IOrderRepository ---

  async placeOrder(
    orderInput: CreateOrderDTO,
    serverTime: Date = new Date()
  ): Promise<{ orderId: string; totalAmount: number }> {
    // 1. Verifikasi Batas Waktu Server (< 12.00 WIB)
    if (!isOrderTimeValid(serverTime, 12, 0)) {
      throw new Error('Mohon maaf, pemesanan hari ini telah ditutup pukul 12.00 WIB.');
    }

    // 2. Validasi Alamat Kompleks
    if (!isInsideComplex(orderInput.customer.address)) {
      throw new Error(
        'Terima kasih atas minat Bapak/Ibu. Mohon maaf sekali, saat ini Dapur Nia hanya melayani pengantaran di dalam area Kompleks Griya Indah.'
      );
    }

    // 3. Validasi & Pengurangan Stok Atomik (Rule 2: Sisa Porsi >= 0)
    const normalizedWA = normalizeWhatsApp(orderInput.customer.whatsapp);
    const orderItems = [];
    let subtotalMenu = 0;

    // Check availability first
    for (const item of orderInput.items) {
      if (!item.quantity || item.quantity < 1) {
        throw new Error('Jumlah pesanan minimal 1 porsi.');
      }
      const menu = this.menus.get(item.menuId);
      if (!menu) {
        throw new Error('Menu tidak ditemukan.');
      }
      if (menu.remainingStock < item.quantity) {
        throw new Error(`Mohon maaf, porsi untuk menu '${menu.name}' baru saja habis dipesan.`);
      }
    }

    // Deduct stock
    for (const item of orderInput.items) {
      const menu = this.menus.get(item.menuId)!;
      menu.remainingStock -= item.quantity;
      const subtotal = menu.price * item.quantity;
      subtotalMenu += subtotal;

      orderItems.push({
        menuId: menu.id,
        menuName: menu.name,
        unitPrice: menu.price,
        quantity: item.quantity,
        subtotal: subtotal,
      });
    }

    this.notifyMenuSubscribers();

    // 4. Hitung Total Tagihan (Rule 1: Total Tagihan >= 0)
    const deliveryFee = 10000;
    const discount = 0;
    const totalAmount = calculateOrderTotal(subtotalMenu, deliveryFee, discount);

    const now = serverTime;
    const dateStr = now.toISOString().split('T')[0];
    const orderId = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const orderNumber = `DN-${dateStr.replace(/-/g, '')}-${String(this.orderCounter++).padStart(3, '0')}`;

    const customerSnapshot: Customer = {
      whatsapp: normalizedWA,
      name: orderInput.customer.name,
      address: orderInput.customer.address,
    };

    const newOrder: Order = {
      id: orderId,
      orderNumber: orderNumber,
      customerId: normalizedWA,
      customerSnapshot: customerSnapshot,
      items: orderItems,
      subtotalMenu: subtotalMenu,
      deliveryFee: deliveryFee,
      discount: discount,
      totalAmount: totalAmount,
      status: 'WAITING_PAYMENT',
      orderDate: dateStr,
      orderTime: now.toISOString(),
    };

    this.orders.set(orderId, newOrder);
    await this.saveCustomer(customerSnapshot);
    this.notifyOrderSubscribers();

    return { orderId: orderId, totalAmount: totalAmount };
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    return this.orders.get(orderId) || null;
  }

  async getAllOrders(): Promise<Order[]> {
    return Array.from(this.orders.values());
  }

  subscribeOrdersByDate(date: string, callback: (orders: Order[]) => void): () => void {
    this.orderSubscribers.add(callback);
    const filtered = Array.from(this.orders.values())
      .filter((o) => o.orderDate === date)
      .sort((a, b) => {
        // Prioritize WAITING_PAYMENT to top
        if (a.status === 'WAITING_PAYMENT' && b.status !== 'WAITING_PAYMENT') return -1;
        if (b.status === 'WAITING_PAYMENT' && a.status !== 'WAITING_PAYMENT') return 1;
        return new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime();
      });
    callback(filtered);
    return () => this.orderSubscribers.delete(callback);
  }

  private notifyOrderSubscribers() {
    const list = Array.from(this.orders.values());
    this.orderSubscribers.forEach((cb) => {
      // Sort with WAITING_PAYMENT at the top
      const sorted = [...list].sort((a, b) => {
        if (a.status === 'WAITING_PAYMENT' && b.status !== 'WAITING_PAYMENT') return -1;
        if (b.status === 'WAITING_PAYMENT' && a.status !== 'WAITING_PAYMENT') return 1;
        return new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime();
      });
      cb(sorted);
    });
  }

  async updateOrderStatus(params: UpdateOrderStatusDTO): Promise<void> {
    const order = this.orders.get(params.orderId);
    if (!order) throw new Error('Pesanan tidak ditemukan');

    const isValid = isValidStatusTransition(order.status, params.nextStatus, params.userRole);
    if (!isValid) {
      throw new Error(
        `Perubahan status dari '${order.status}' ke '${params.nextStatus}' tidak diizinkan untuk peran '${params.userRole}'.`
      );
    }

    const previousStatus = order.status;
    order.status = params.nextStatus;

    if (params.nextStatus === 'PROCESSING') {
      order.confirmedBy = params.confirmedBy || 'Staf Dapur';
      order.paymentConfirmedAt = new Date().toISOString();
    }

    if (params.nextStatus === 'CANCELLED' && previousStatus !== 'CANCELLED') {
      order.cancelledAt = new Date().toISOString();
      order.cancelledBy = params.cancelledBy || (params.userRole === 'owner' ? 'Dina' : 'Rani');
      order.cancellationReason = params.cancellationReason || 'Pesanan dibatalkan';

      // Kembalikan stok menu secara otomatis
      for (const item of order.items) {
        const menu = this.menus.get(item.menuId);
        if (menu) {
          menu.remainingStock += item.quantity;
        }
      }
      this.notifyMenuSubscribers();
    }

    this.notifyOrderSubscribers();
  }

  async uploadPaymentProof(orderId: string, file: File): Promise<string> {
    const order = this.orders.get(orderId);
    if (!order) throw new Error('Pesanan tidak ditemukan');

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Ukuran foto terlalu besar. Maksimal 5 MB.');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('File bukti bayar harus berupa gambar.');
    }

    // In mock, create an object URL or placeholder
    const proofUrl = URL.createObjectURL ? URL.createObjectURL(file) : `mock-proof://${file.name}`;
    order.paymentProofUrl = proofUrl;
    this.notifyOrderSubscribers();
    return proofUrl;
  }

  // --- IReportRepository ---

  async getDailySoldPortions(date: string): Promise<SoldPortionSummary[]> {
    const validStatuses = new Set(['PROCESSING', 'SHIPPED', 'COMPLETED']);
    const map = new Map<string, number>();

    for (const order of this.orders.values()) {
      if (order.orderDate === date && validStatuses.has(order.status)) {
        for (const item of order.items) {
          const current = map.get(item.menuName) || 0;
          map.set(item.menuName, current + item.quantity);
        }
      }
    }

    return Array.from(map.entries()).map(([menuName, totalSold]) => ({
      menuName,
      totalSold,
    }));
  }

  async getDailyRevenue(date: string): Promise<RevenueSummary> {
    const validStatuses = new Set(['PROCESSING', 'SHIPPED', 'COMPLETED']);
    let totalFoodAmount = 0;
    let totalDeliveryFee = 0;

    for (const order of this.orders.values()) {
      if (order.orderDate === date && validStatuses.has(order.status)) {
        totalFoodAmount += order.subtotalMenu;
        totalDeliveryFee += order.deliveryFee;
      }
    }

    return {
      totalFoodAmount,
      totalDeliveryFee,
      grandTotal: totalFoodAmount + totalDeliveryFee,
    };
  }
}
