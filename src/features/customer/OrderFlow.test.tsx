import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomerPortal } from './CustomerPortal';
import { MockStorageAdapter } from '../../infrastructure/mock/MockStorageAdapter';

describe('Customer Portal Order Flow (End-to-End Integration)', () => {
  let adapter: MockStorageAdapter;

  beforeEach(() => {
    adapter = new MockStorageAdapter();
  });

  it('should auto-fill name and address when returning customer types WhatsApp number', async () => {
    // Save previous customer Ibu Rina
    await adapter.saveCustomer({
      whatsapp: '081234567890',
      name: 'Ibu Rina',
      address: 'Kompleks Griya Indah Blok B2 No. 5',
    });

    render(<CustomerPortal adapter={adapter} serverTime={new Date('2026-10-02T02:00:00.000Z')} />);

    const waInput = screen.getByLabelText(/Nomor WhatsApp/i);
    fireEvent.change(waInput, { target: { value: '0812-3456-7890' } });

    await waitFor(() => {
      const nameInput = screen.getByLabelText(/Nama Pemesan/i) as HTMLInputElement;
      const addressInput = screen.getByLabelText(/Alamat Pengantaran/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Ibu Rina');
      expect(addressInput.value).toBe('Kompleks Griya Indah Blok B2 No. 5');
    });
  });

  it('should show friendly outside complex dialog when entering outside address', async () => {
    render(<CustomerPortal adapter={adapter} serverTime={new Date('2026-10-02T02:00:00.000Z')} />);

    const waInput = screen.getByLabelText(/Nomor WhatsApp/i);
    const nameInput = screen.getByLabelText(/Nama Pemesan/i);
    const addressInput = screen.getByLabelText(/Alamat Pengantaran/i);

    // Select 1 portion of first menu
    const addPortionButtons = screen.getAllByRole('button', { name: /Tambah porsi/i });
    fireEvent.click(addPortionButtons[0]);

    fireEvent.change(waInput, { target: { value: '081299991111' } });
    fireEvent.change(nameInput, { target: { value: 'Pak Joko' } });
    fireEvent.change(addressInput, { target: { value: 'Jl. Melati No. 10, Desa Luar' } });

    const submitButton = screen.getByRole('button', { name: /Lanjut ke Pembayaran/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Mohon Maaf, Di Luar Jangkauan/i)).toBeInTheDocument();
      expect(screen.getByText(/hanya dapat melayani pengantaran di dalam area Kompleks Griya Indah/i)).toBeInTheDocument();
    });
  });

  it('should disable ordering and show friendly banner when time is >= 12.00 WIB', async () => {
    // 13:00 WIB
    const afternoonTime = new Date('2026-10-02T06:00:00.000Z');
    render(<CustomerPortal adapter={adapter} serverTime={afternoonTime} />);

    expect(screen.getByText(/Pemesanan Hari Ini Sudah Ditutup Pukul 12.00/i)).toBeInTheDocument();
    const orderButtons = screen.queryAllByRole('button', { name: /Pesan Sekarang/i });
    expect(orderButtons.length).toBe(0);
  });
});
