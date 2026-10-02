import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

describe('App End-to-End Workflow (Pelanggan -> Staf Rani -> Pemilik Dina)', () => {
  it('should support full order lifecycle across roles seamlessly', async () => {
    render(<App serverTime={new Date('2026-10-02T02:00:00.000Z')} />);

    // 1. Pelanggan View: Place an order
    expect(screen.getByText(/Katering Kompleks Griya Indah/i)).toBeInTheDocument();
    expect(screen.getByText(/Menu Hari Ini/i)).toBeInTheDocument();

    // Select 2 portions of first menu
    const addPortionBtns = screen.getAllByRole('button', { name: /Tambah porsi/i });
    fireEvent.click(addPortionBtns[0]);
    fireEvent.click(addPortionBtns[0]);

    // Fill form
    const waInput = screen.getByLabelText(/Nomor WhatsApp/i);
    const nameInput = screen.getByLabelText(/Nama Pemesan/i);
    const addressInput = screen.getByLabelText(/Alamat Pengantaran/i);

    fireEvent.change(waInput, { target: { value: '081288887777' } });
    fireEvent.change(nameInput, { target: { value: 'Ibu Ratna' } });
    fireEvent.change(addressInput, { target: { value: 'Griya Indah Blok F1 No. 8' } });

    // Submit order
    const submitBtn = screen.getByRole('button', { name: /Lanjut ke Pembayaran/i });
    fireEvent.click(submitBtn);

    // Wait for tracker screen to show up
    await waitFor(() => {
      expect(screen.getByText(/Rekening Dapur Nia/i)).toBeInTheDocument();
      expect(screen.getByText(/Menunggu Pembayaran/i)).toBeInTheDocument();
    });

    // 2. Switch Role to Rani (Staf Dapur) via Header
    const raniRoleBtn = screen.getByRole('button', { name: /Rani/i });
    fireEvent.click(raniRoleBtn);

    await waitFor(() => {
      expect(screen.getByText('Antrean Dapur')).toBeInTheDocument();
      expect(screen.getByText('Ibu Ratna')).toBeInTheDocument();
    });

    // Rani verifies payment
    const verifyBtn = screen.getByRole('button', { name: /Periksa Pembayaran/i });
    fireEvent.click(verifyBtn);

    await waitFor(() => {
      expect(screen.getByText(/Verifikasi Bukti Transfer/i)).toBeInTheDocument();
    });

    const acceptBtn = screen.getByRole('button', { name: /Terima & Proses Pesanan/i });
    fireEvent.click(acceptBtn);

    // Status becomes PROCESSING
    await waitFor(() => {
      expect(screen.getByText(/Sedang Dimasak/i)).toBeInTheDocument();
    });

    // 3. Switch Role to Bu Dina (Pemilik)
    const dinaRoleBtn = screen.getByRole('button', { name: /Bu Dina/i });
    fireEvent.click(dinaRoleBtn);

    await waitFor(() => {
      expect(screen.getByText(/Laporan Harian/i)).toBeInTheDocument();
      expect(screen.getByText(/Kelola Menu/i)).toBeInTheDocument();
    });

    // Bu Dina opens Laporan Harian tab
    const reportsTab = screen.getByRole('button', { name: /Laporan Harian/i });
    fireEvent.click(reportsTab);

    await waitFor(() => {
      expect(screen.getByText(/Laporan 2: Total Uang Masuk Kas Hari Ini/i)).toBeInTheDocument();
      expect(screen.getByText('2 porsi')).toBeInTheDocument(); // 2 portions of Ayam Bakar
    });
  });
});
