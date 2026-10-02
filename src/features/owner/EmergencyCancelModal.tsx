import React, { useState } from 'react';
import { Order } from '../../domain/types';
import { Dialog } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { formatRupiah } from '../../lib/utils';
import { AlertTriangle, AlertOctagon, RotateCcw } from 'lucide-react';

interface EmergencyCancelModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onConfirmCancel: (orderId: string, reason: string) => Promise<void>;
}

export function EmergencyCancelModal({
  order,
  open,
  onClose,
  onConfirmCancel,
}: EmergencyCancelModalProps) {
  const [reason, setReason] = useState('Bahan masakan tumpah / kompor kendala dapur');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!order) return null;

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirmCancel(order.id, reason);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Gagal membatalkan pesanan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Pembatalan Darurat Dapur (Khusus Bu Dina)"
      description={`Pesanan: ${order.orderNumber} - ${order.customerSnapshot.name}`}
    >
      <div className="space-y-4">
        <div className="bg-rose-50 border-2 border-rose-300 p-4 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-8 h-8 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-base font-bold text-rose-900">
              Perhatian Pembatalan Khusus Pemilik:
            </p>
            <p className="text-sm text-rose-800 leading-relaxed">
              Tindakan ini akan membatalkan pesanan yang sudah terkonfirmasi dan secara otomatis <strong>mengembalikan {order.items.reduce((a, b) => a + b.quantity, 0)} porsi ke kuota stok menu</strong>. Harap koordinasikan pengembalian dana manual ke pelanggan.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-base font-bold text-slate-800">
            Alasan Pembatalan Darurat:
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full h-12 px-4 rounded-xl border-2 border-slate-300 text-lg bg-white"
          >
            <option value="Bahan masakan tumpah / kompor kendala dapur">Bahan masakan tumpah / kompor kendala dapur</option>
            <option value="Kurir darurat berhalangan">Kurir darurat berhalangan</option>
            <option value="Permintaan pembatalan darurat dari pelanggan">Permintaan pembatalan darurat dari pelanggan</option>
          </select>
        </div>

        <div className="flex gap-3 pt-3">
          <Button
            variant="outline"
            size="lg"
            onClick={onClose}
            className="flex-1"
            disabled={isSubmitting}
          >
            Kembali
          </Button>
          <Button
            variant="destructive"
            size="lg"
            onClick={handleConfirm}
            className="flex-1 bg-rose-600 hover:bg-rose-700"
            disabled={isSubmitting}
          >
            <AlertOctagon className="w-5 h-5 mr-1.5" />
            Ya, Batalkan Pesanan
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
