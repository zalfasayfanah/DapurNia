import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { KitchenDashboard } from './KitchenDashboard';
import { MockStorageAdapter } from '../../infrastructure/mock/MockStorageAdapter';

describe('KitchenDashboard Module (Mbak Rani - role: staff)', () => {
  let adapter: MockStorageAdapter;
  const todayStr = '2026-10-02';
  const morningTime = new Date('2026-10-02T02:00:00.000Z');

  beforeEach(async () => {
    adapter = new MockStorageAdapter();
    const menus = await adapter.getMenus();

    // Create 1 WAITING_PAYMENT order
    await adapter.placeOrder(
      {
        customer: { whatsapp: '081211111111', name: 'Pak Budi', address: 'Griya Indah Blok A1' },
        items: [{ menuId: menus[0].id, quantity: 2 }],
      },
      morningTime
    );

    // Create 1 PROCESSING order
    const o2 = await adapter.placeOrder(
      {
        customer: { whatsapp: '081222222222', name: 'Bu Siti', address: 'Griya Indah Blok B2' },
        items: [{ menuId: menus[0].id, quantity: 1 }],
      },
      morningTime
    );
    await adapter.updateOrderStatus({ orderId: o2.orderId, nextStatus: 'PROCESSING', userRole: 'staff' });
  });

  it('should render orders with WAITING_PAYMENT placed prominently', async () => {
    render(<KitchenDashboard adapter={adapter} userRole="staff" userName="Rani" targetDate={todayStr} />);

    await waitFor(() => {
      expect(screen.getByText('Pak Budi')).toBeInTheDocument();
      expect(screen.getByText('Bu Siti')).toBeInTheDocument();
    });
  });

  it('should allow Rani to verify and accept payment proof', async () => {
    render(<KitchenDashboard adapter={adapter} userRole="staff" userName="Rani" targetDate={todayStr} />);

    await waitFor(() => {
      expect(screen.getByText('Pak Budi')).toBeInTheDocument();
    });

    const verifyButtons = screen.getAllByRole('button', { name: /Periksa Pembayaran|Terima & Proses/i });
    fireEvent.click(verifyButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Verifikasi Bukti Transfer/i)).toBeInTheDocument();
    });

    const acceptButton = screen.getByRole('button', { name: /Terima & Proses Pesanan/i });
    fireEvent.click(acceptButton);

    await waitFor(async () => {
      const allOrders = await adapter.getAllOrders();
      const budiOrder = allOrders.find((o) => o.customerSnapshot.name === 'Pak Budi');
      expect(budiOrder?.status).toBe('PROCESSING');
      expect(budiOrder?.confirmedBy).toBe('Rani');
    });
  });

  it('should NOT render Emergency Cancel button for staff on PROCESSING orders', async () => {
    render(<KitchenDashboard adapter={adapter} userRole="staff" userName="Rani" targetDate={todayStr} />);

    await waitFor(() => {
      expect(screen.getByText('Bu Siti')).toBeInTheDocument();
    });

    // Staff cannot cancel confirmed orders
    expect(screen.queryByRole('button', { name: /Batalkan Darurat/i })).not.toBeInTheDocument();
  });
});
