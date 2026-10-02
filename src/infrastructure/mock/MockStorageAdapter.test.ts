import { describe, it, expect, beforeEach } from 'vitest';
import { MockStorageAdapter } from './MockStorageAdapter';

describe('MockStorageAdapter (In-Memory Repository Implementation)', () => {
  let adapter: MockStorageAdapter;

  beforeEach(() => {
    adapter = new MockStorageAdapter();
  });

  describe('Menu & Quota Management', () => {
    it('should initialize with default menus for Dapur Nia', async () => {
      const menus = await adapter.getMenus();
      expect(menus.length).toBeGreaterThan(0);
      expect(menus.find((m) => m.name.includes('Ayam Bakar'))).toBeDefined();
    });

    it('should allow Bu Dina (owner) to update menu price and quota', async () => {
      const menus = await adapter.getMenus();
      const firstMenuId = menus[0].id;

      await adapter.updateMenuPrice(firstMenuId, 30000);
      await adapter.updateMenuQuota(firstMenuId, 75);

      const updated = (await adapter.getMenus()).find((m) => m.id === firstMenuId);
      expect(updated?.price).toBe(30000);
      expect(updated?.remainingStock).toBe(75);
      expect(updated?.initialQuota).toBe(75);
    });
  });

  describe('Customer & Auto-fill Management', () => {
    it('should return null for new customer and return data after placing order', async () => {
      const nonExistent = await adapter.getCustomerByWhatsApp('081299999999');
      expect(nonExistent).toBeNull();

      const morningTime = new Date('2026-10-02T02:00:00.000Z'); // 09:00 WIB
      const menus = await adapter.getMenus();

      await adapter.placeOrder(
        {
          customer: {
            whatsapp: '0812-9999-9999',
            name: 'Ibu Rina',
            address: 'Kompleks Griya Indah Blok B2 No. 5',
          },
          items: [{ menuId: menus[0].id, quantity: 2 }],
        },
        morningTime
      );

      const saved = await adapter.getCustomerByWhatsApp('081299999999');
      expect(saved).not.toBeNull();
      expect(saved?.name).toBe('Ibu Rina');
      expect(saved?.address).toBe('Kompleks Griya Indah Blok B2 No. 5');
    });
  });

  describe('Rule 2: Sisa Porsi & Perlindungan Rebutan Porsi (Atomik)', () => {
    it('should decrement stock when placing order', async () => {
      const menus = await adapter.getMenus();
      const targetMenu = menus[0];
      const initialStock = targetMenu.remainingStock;

      const morningTime = new Date('2026-10-02T02:00:00.000Z');
      await adapter.placeOrder(
        {
          customer: {
            whatsapp: '081211112222',
            name: 'Pak Budi',
            address: 'Griya Indah Blok A1',
          },
          items: [{ menuId: targetMenu.id, quantity: 3 }],
        },
        morningTime
      );

      const updated = (await adapter.getMenus()).find((m) => m.id === targetMenu.id);
      expect(updated?.remainingStock).toBe(initialStock - 3);
    });

    it('should reject order and preserve stock if requested quantity exceeds remaining stock', async () => {
      const menus = await adapter.getMenus();
      const targetMenu = menus[0];
      // Set quota to 1
      await adapter.updateMenuQuota(targetMenu.id, 1);

      const morningTime = new Date('2026-10-02T02:00:00.000Z');

      // Order 2 portions when only 1 is available
      await expect(
        adapter.placeOrder(
          {
            customer: {
              whatsapp: '081233334444',
              name: 'Bu Siti',
              address: 'Griya Indah Blok C3',
            },
            items: [{ menuId: targetMenu.id, quantity: 2 }],
          },
          morningTime
        )
      ).rejects.toThrow(/baru saja habis/i);

      // Stock remains 1 and is never negative
      const updated = (await adapter.getMenus()).find((m) => m.id === targetMenu.id);
      expect(updated?.remainingStock).toBe(1);
    });

    it('should reject order if address is outside complex', async () => {
      const menus = await adapter.getMenus();
      const morningTime = new Date('2026-10-02T02:00:00.000Z');

      await expect(
        adapter.placeOrder(
          {
            customer: {
              whatsapp: '081255556666',
              name: 'Pak Joko',
              address: 'Jl. Mawar No. 12, Kelurahan Luar',
            },
            items: [{ menuId: menus[0].id, quantity: 1 }],
          },
          morningTime
        )
      ).rejects.toThrow(/hanya melayani pengantaran di dalam area kompleks/i);
    });

    it('should reject order if server time is >= 12.00 WIB', async () => {
      const menus = await adapter.getMenus();
      const afternoonTime = new Date('2026-10-02T05:30:00.000Z'); // 12:30 WIB

      await expect(
        adapter.placeOrder(
          {
            customer: {
              whatsapp: '081277778888',
              name: 'Ibu Maya',
              address: 'Griya Indah Blok D4',
            },
            items: [{ menuId: menus[0].id, quantity: 1 }],
          },
          afternoonTime
        )
      ).rejects.toThrow(/pemesanan hari ini telah ditutup/i);
    });
  });

  describe('Status Transitions & Automatic Stock Restoration on Cancellation', () => {
    it('should restore menu stock when an order is cancelled', async () => {
      const menus = await adapter.getMenus();
      const targetMenu = menus[0];
      const stockBefore = targetMenu.remainingStock;

      const morningTime = new Date('2026-10-02T02:00:00.000Z');
      const { orderId } = await adapter.placeOrder(
        {
          customer: {
            whatsapp: '081288889999',
            name: 'Pak Agus',
            address: 'Griya Indah Blok E5',
          },
          items: [{ menuId: targetMenu.id, quantity: 4 }],
        },
        morningTime
      );

      // Stock decreased by 4
      let currentMenu = (await adapter.getMenus()).find((m) => m.id === targetMenu.id);
      expect(currentMenu?.remainingStock).toBe(stockBefore - 4);

      // Cancel order (Staff rejects invalid proof)
      await adapter.updateOrderStatus({
        orderId,
        nextStatus: 'CANCELLED',
        userRole: 'staff',
        cancellationReason: 'Nominal transfer kurang',
        cancelledBy: 'Rani',
      });

      // Stock is automatically restored
      currentMenu = (await adapter.getMenus()).find((m) => m.id === targetMenu.id);
      expect(currentMenu?.remainingStock).toBe(stockBefore);
    });
  });

  describe('Daily Reports (Excluding Cancelled Orders)', () => {
    it('should calculate sold portions and cash inflow ignoring cancelled orders', async () => {
      const date = '2026-10-02';
      const morningTime = new Date('2026-10-02T02:00:00.000Z');
      const menus = await adapter.getMenus();
      const menuA = menus[0]; // say 25.000

      // Order 1: Confirmed (2 portions) -> 2 * 25.000 + 10.000 = 60.000
      const o1 = await adapter.placeOrder(
        {
          customer: { whatsapp: '081111111111', name: 'Cust 1', address: 'Griya Indah Blok A' },
          items: [{ menuId: menuA.id, quantity: 2 }],
        },
        morningTime
      );
      await adapter.updateOrderStatus({ orderId: o1.orderId, nextStatus: 'PROCESSING', userRole: 'staff' });

      // Order 2: Confirmed (1 portion) -> 1 * 25.000 + 10.000 = 35.000
      const o2 = await adapter.placeOrder(
        {
          customer: { whatsapp: '082222222222', name: 'Cust 2', address: 'Griya Indah Blok B' },
          items: [{ menuId: menuA.id, quantity: 1 }],
        },
        morningTime
      );
      await adapter.updateOrderStatus({ orderId: o2.orderId, nextStatus: 'PROCESSING', userRole: 'staff' });

      // Order 3: Cancelled (3 portions) -> Should NOT be counted in report!
      const o3 = await adapter.placeOrder(
        {
          customer: { whatsapp: '083333333333', name: 'Cust 3', address: 'Griya Indah Blok C' },
          items: [{ menuId: menuA.id, quantity: 3 }],
        },
        morningTime
      );
      await adapter.updateOrderStatus({
        orderId: o3.orderId,
        nextStatus: 'CANCELLED',
        userRole: 'staff',
        cancellationReason: 'Transfer ditolak',
      });

      // Check Report 1: Sold Portions
      const soldReport = await adapter.getDailySoldPortions(date);
      const menuAReport = soldReport.find((r) => r.menuName === menuA.name);
      expect(menuAReport?.totalSold).toBe(3); // 2 + 1 (cancelled 3 ignored)

      // Check Report 2: Cash Inflow
      const revenueReport = await adapter.getDailyRevenue(date);
      expect(revenueReport.totalFoodAmount).toBe(75000); // 3 portions * 25.000
      expect(revenueReport.totalDeliveryFee).toBe(20000); // 2 valid orders * 10.000
      expect(revenueReport.grandTotal).toBe(95000);
    });
  });
});
