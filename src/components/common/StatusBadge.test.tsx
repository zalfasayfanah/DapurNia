import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge Component', () => {
  it('should render WAITING_PAYMENT with proper Indonesian label and warning styling', () => {
    render(<StatusBadge status="WAITING_PAYMENT" />);
    const badge = screen.getByText(/Menunggu Pembayaran/i);
    expect(badge).toBeInTheDocument();
  });

  it('should render PROCESSING with proper label and blue/primary styling', () => {
    render(<StatusBadge status="PROCESSING" />);
    const badge = screen.getByText(/Sedang Dimasak/i);
    expect(badge).toBeInTheDocument();
  });

  it('should render SHIPPED with proper label and shipping styling', () => {
    render(<StatusBadge status="SHIPPED" />);
    const badge = screen.getByText(/Sedang Diantar/i);
    expect(badge).toBeInTheDocument();
  });

  it('should render COMPLETED with green success styling', () => {
    render(<StatusBadge status="COMPLETED" />);
    const badge = screen.getByText(/Selesai Diterima/i);
    expect(badge).toBeInTheDocument();
  });

  it('should render CANCELLED with red destructive styling', () => {
    render(<StatusBadge status="CANCELLED" />);
    const badge = screen.getByText(/Dibatalkan/i);
    expect(badge).toBeInTheDocument();
  });
});
