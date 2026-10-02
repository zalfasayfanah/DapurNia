import React, { useState } from 'react';
import { Order } from '../../domain/types';
import { Dialog } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { formatRupiah } from '../../lib/utils';
import { CheckCircle2, XCircle, AlertCircle, Phone, MapPin, Receipt, Image as ImageIcon } from 'lucide-react';

interface PaymentVerificationModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onAccept: (orderId: string) => Promise<void>;
  onReject: (orderId: string, reason: string) => Promise<void>;
}

export function PaymentVerificationModal({
  order,
  open,
  onClose,
  onAccept,
  onReject,
}: PaymentVerificationModalProps) {
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState('Nominal transfer kurang');
  const [customReason, setCustomReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!order) return null;

  const handleAccept = async () => {
    try {
      setIsProcessing(true);
      await onAccept(order.id);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Gagal menerima pesanan');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsProcessing(true);
      const finalReason = rejectReason === 'Lainnya' ? customReason : rejectReason;
      await onReject(order.id, finalReason || 'Bukti bayar tidak valid');
      onClose();
    } catch (err: any) {
      alert(err.message || 'Gagal menolak pesanan');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Verifikasi Bukti Transfer"
      description={`Pesanan: ${order.orderNumber}`}
    >
      <div className="space-y-4">
        {/* Customer & Order Summary */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold text-lg">{order.customerSnapshot.name}</span>
            <span className="font-mono text-base text-slate-600">{order.customerSnapshot.whatsapp}</span>
          </div>
          <p className="text-base text-slate-600">{order.customerSnapshot.address}</p>
          <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xl font-black text-brand-700">
            <span>Total Tagihan:</span>
            <span>{formatRupiah(order.totalAmount)}</span>
          </div>
        </div>

        {/* Payment Proof Viewer */}
        <div className="space-y-2">
          <label className="block text-base font-bold text-slate-800">Foto Bukti Transfer Pelanggan:</label>
          {order.paymentProofUrl ? (
            <div className="rounded-2xl border-2 border-slate-300 bg-slate-100 p-2 overflow-hidden flex justify-center">
              <img
                src={order.paymentProofUrl}
                alt="Bukti Transfer"
                className="max-h-72 w-auto object-contain rounded-xl"
              />
            </div>
          ) : (
            <div className="p-6 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50 text-amber-800 text-center font-bold text-lg">
              Pelanggan belum mengunggah foto bukti bayar.
            </div>
          )}
        </div>

        {/* Action Buttons / Reject Form */}
        {rejectMode ? (
          <div className="space-y-3 pt-2 bg-rose-50/70 p-4 rounded-2xl border border-rose-200">
            <label className="block text-base font-bold text-rose-900">Pilih Alasan Penolakan:</label>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border-2 border-rose-300 text-lg bg-white"
            >
              <option value="Nominal transfer kurang">Nominal transfer kurang</option>
              <option value="Foto bukti transfer buram / tidak terbaca">Foto bukti transfer buram / tidak terbaca</option>
              <option value="Rekening tujuan salah">Rekening tujuan salah</option>
              <option value="Lainnya">Alasan Lainnya</option>
            </select>

            {rejectReason === 'Lainnya' && (
              <input
                type="text"
                placeholder="Tuliskan alasan penolakan..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border-2 border-rose-300 text-lg bg-white"
              />
            )}

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="default"
                onClick={() => setRejectMode(false)}
                className="flex-1"
                disabled={isProcessing}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                size="default"
                onClick={handleReject}
                className="flex-1"
                disabled={isProcessing}
              >
                Konfirmasi Tolak
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 pt-3">
            <Button
              variant="destructive"
              size="lg"
              onClick={() => setRejectMode(true)}
              className="flex-1 min-h-[52px]"
              disabled={isProcessing}
            >
              <XCircle className="w-5 h-5 mr-2" />
              Tolak Pembayaran
            </Button>
            <Button
              variant="success"
              size="lg"
              onClick={handleAccept}
              className="flex-1 min-h-[52px] bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isProcessing}
            >
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Terima & Proses Pesanan
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
