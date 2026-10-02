import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DailyReports } from './DailyReports';
import { MockStorageAdapter } from '../../infrastructure/mock/MockStorageAdapter';

describe('DailyReports Module (Khusus Bu Dina - role: owner)', () => {
  let adapter: MockStorageAdapter;
  const targetDate = '2026-10-02';
  const morningTime = new Date('2026-10-02T02:00:00.000Z');

  beforeEach(async () => {
    adapter = new MockStorageAdapter();
    const menus = await adapter.getMenus();
    const menuA = menus[0]; // 25.000

    // Order 1: 2 portions Ayam Bakar (Confirmed -> Processing)
    const o1 = await adapter.placeOrder(
      {
        customer: { whatsapp: '081111111111', name: 'Bu Ani', address: 'Griya Indah Blok A' },
        items: [{ menuId: menuA.id, quantity: 2 }],
      },
      morningTime
    );
    await adapter.updateOrderStatus({ orderId: o1.orderId, nextStatus: 'PROCESSING', userRole: 'owner' });

    // Order 2: 1 portion Ayam Bakar (Confirmed -> Shipped)
    const o2 = await adapter.placeOrder(
      {
        customer: { whatsapp: '082222222222', name: 'Pak Rudi', address: 'Griya Indah Blok B' },
        items: [{ menuId: menuA.id, quantity: 1 }],
      },
      morningTime
    );
    await adapter.updateOrderStatus({ orderId: o2.orderId, nextStatus: 'PROCESSING', userRole: 'owner' });
    await adapter.updateOrderStatus({ orderId: o2.orderId, nextStatus: 'SHIPPED', userRole: 'owner' });

    // Order 3: 4 portions Ayam Bakar (CANCELLED) -> should NOT be included!
    const o3 = await adapter.placeOrder(
      {
        customer: { whatsapp: '083333333333', name: 'Ibu Batal', address: 'Griya Indah Blok C' },
        items: [{ menuId: menuA.id, quantity: 4 }],
      },
      morningTime
    );
    await adapter.updateOrderStatus({
      orderId: o3.orderId,
      nextStatus: 'CANCELLED',
      userRole: 'owner',
      cancellationReason: 'Ditolak',
    });
  });

  it('should render Laporan 1: Jumlah Porsi Terjual (Total: 3 porsi, ignoring cancelled)', async () => {
    render(<DailyReports adapter={adapter} selectedDate={targetDate} />);

    await waitFor(() => {
      expect(screen.getByText(/Laporan Belanja Bahan/i)).toBeInTheDocument();
      expect(screen.getByText(/Ayam Bakar/i)).toBeInTheDocument();
      expect(screen.getByText('3 porsi')).toBeInTheDocument();
    });
  });

  it('should render Laporan 2: Total Uang Kas Masuk (Total: Rp95.000)', async () => {
    render(<DailyReports adapter={adapter} selectedDate={targetDate} />);

    await waitFor(() => {
      expect(screen.getByText(/Total Uang Masuk/i)).toBeInTheDocument();
      // 3 portions * 25.000 + 2 orders * 10.000 delivery = 95.000
      expect(screen.getByText(/Rp\s*95\.000/i)).toBeInTheDocument();
    });
  });
});
