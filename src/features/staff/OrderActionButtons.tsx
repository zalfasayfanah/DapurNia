import React from 'react';
import { Order, UserRole } from '../../domain/types';
import { Button } from '../../components/ui/Button';
import { ChefHat, Truck, CheckCircle2, AlertOctagon, Eye } from 'lucide-react';

interface OrderActionButtonsProps {
  order: Order;
  userRole: UserRole;
  onVerifyPayment: (order: Order) => void;
  onUpdateStatus: (orderId: string, nextStatus: any) => Promise<void>;
  onEmergencyCancel?: (order: Order) => void;
  disabled?: boolean;
}

export function OrderActionButtons({
  order,
  userRole,
  onVerifyPayment,
  onUpdateStatus,
  onEmergencyCancel,
  disabled = false,
}: OrderActionButtonsProps) {
  if (order.status === 'WAITING_PAYMENT') {
    return (
      <Button
        variant="primary"
        size="lg"
        onClick={() => onVerifyPayment(order)}
        disabled={disabled}
        className="w-full text-lg font-bold bg-amber-600 hover:bg-amber-700 shadow-md min-h-[52px]"
      >
        <Eye className="w-5 h-5 mr-2" />
        Periksa Pembayaran
      </Button>
    );
  }

  if (order.status === 'PROCESSING') {
    return (
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <Button
          variant="secondary"
          size="lg"
          onClick={() => onUpdateStatus(order.id, 'SHIPPED')}
          disabled={disabled}
          className="flex-1 text-lg font-bold bg-teal-700 hover:bg-teal-800 shadow-md min-h-[52px]"
        >
          <Truck className="w-5 h-5 mr-2" />
          Kirim Makanan (Kurir)
        </Button>

        {userRole === 'owner' && onEmergencyCancel && (
          <Button
            variant="destructive"
            size="default"
            onClick={() => onEmergencyCancel(order)}
            disabled={disabled}
            className="text-base font-bold min-h-[48px]"
          >
            <AlertOctagon className="w-4 h-4 mr-1.5" />
            Batalkan Darurat
          </Button>
        )}
      </div>
    );
  }

  if (order.status === 'SHIPPED') {
    return (
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <Button
          variant="success"
          size="lg"
          onClick={() => onUpdateStatus(order.id, 'COMPLETED')}
          disabled={disabled}
          className="flex-1 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md min-h-[52px]"
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          Tandai Selesai Diterima
        </Button>

        {userRole === 'owner' && onEmergencyCancel && (
          <Button
            variant="destructive"
            size="default"
            onClick={() => onEmergencyCancel(order)}
            disabled={disabled}
            className="text-base font-bold min-h-[48px]"
          >
            <AlertOctagon className="w-4 h-4 mr-1.5" />
            Batalkan Darurat
          </Button>
        )}
      </div>
    );
  }

  return null;
}
