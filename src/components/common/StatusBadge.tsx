import React from 'react';
import { OrderStatus } from '../../domain/types';
import { Badge } from '../ui/Badge';
import { Clock, ChefHat, Truck, CheckCircle2, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case 'WAITING_PAYMENT':
      return (
        <Badge variant="warning" className={`gap-1.5 py-1.5 px-3 text-base font-bold ${className || ''}`}>
          <Clock className="w-5 h-5 text-amber-600" />
          Menunggu Pembayaran
        </Badge>
      );
    case 'PROCESSING':
      return (
        <Badge variant="default" className={`gap-1.5 py-1.5 px-3 text-base font-bold bg-orange-100 text-orange-900 border-orange-300 ${className || ''}`}>
          <ChefHat className="w-5 h-5 text-orange-600" />
          Sedang Dimasak
        </Badge>
      );
    case 'SHIPPED':
      return (
        <Badge variant="secondary" className={`gap-1.5 py-1.5 px-3 text-base font-bold ${className || ''}`}>
          <Truck className="w-5 h-5 text-teal-700" />
          Sedang Diantar Kurir
        </Badge>
      );
    case 'COMPLETED':
      return (
        <Badge variant="success" className={`gap-1.5 py-1.5 px-3 text-base font-bold ${className || ''}`}>
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Selesai Diterima
        </Badge>
      );
    case 'CANCELLED':
      return (
        <Badge variant="destructive" className={`gap-1.5 py-1.5 px-3 text-base font-bold ${className || ''}`}>
          <XCircle className="w-5 h-5 text-rose-600" />
          Dibatalkan
        </Badge>
      );
  }
}
