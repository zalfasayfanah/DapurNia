import React, { useState } from 'react';
import { Order } from '../../domain/types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PhotoUploader } from '../../components/common/PhotoUploader';
import { Button } from '../../components/ui/Button';
import { formatRupiah } from '../../lib/utils';
import { Clock, MapPin, Receipt, ArrowLeft, Phone, CheckCircle2 } from 'lucide-react';

interface OrderTrackerPageProps {
  order: Order;
  onUploadProof: (orderId: string, file: File) => Promise<void>;
  onBack: () => void;
}

export function OrderTrackerPage({ order, onUploadProof, onBack }: OrderTrackerPageProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = async (file: File) => {
    try {
      setIsUploading(true);
      await onUploadProof(order.id, file);
      setUploadSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah foto');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in-50 pb-10">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-700">
          <ArrowLeft className="w-5 h-5 mr-1" />
          Kembali ke Menu
        </Button>
        <StatusBadge status={order.status} />
      </div>

      <Card className="border-brand-500/20 shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-base text-slate-500 font-bold uppercase tracking-wider">
              Nomor Pesanan
            </span>
            <span className="text-xl font-extrabold text-brand-700 font-mono">
              {order.orderNumber}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-lg">
              <MapPin className="w-5 h-5 text-brand-600 shrink-0" />
              <span>{order.customerSnapshot.name}</span>
            </div>
            <p className="text-base text-slate-600 pl-7">{order.customerSnapshot.address}</p>
            <p className="text-base text-slate-500 pl-7 flex items-center gap-1 font-mono">
              <Phone className="w-4 h-4" />
              {order.customerSnapshot.whatsapp}
            </p>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2">
            <h4 className="font-bold text-lg text-slate-800 flex items-center gap-1.5">
              <Receipt className="w-5 h-5 text-brand-600" />
              Rincian Menu
            </h4>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-lg">
                <span className="text-slate-800">
                  {item.quantity}x {item.menuName}
                </span>
                <span className="font-bold text-slate-900">{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center text-base text-slate-600 pt-1">
              <span>Ongkos Kirim (Flat Kompleks)</span>
              <span>{formatRupiah(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between items-center text-2xl font-black text-brand-700 pt-2 border-t-2 border-dashed border-slate-200">
              <span>Total Tagihan</span>
              <span>{formatRupiah(order.totalAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bagian Bukti Transfer */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Pembayaran & Bukti Transfer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-amber-900 space-y-1">
            <p className="font-bold text-lg">Rekening Dapur Nia (BCA):</p>
            <p className="text-2xl font-mono font-black tracking-wider text-slate-900 select-all">
              8820-192-881
            </p>
            <p className="text-base font-medium">a.n. Dina Wardhani</p>
          </div>

          {order.paymentProofUrl ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 p-3 rounded-xl font-bold">
                <CheckCircle2 className="w-5 h-5" />
                Bukti transfer sudah terkirim & sedang diperiksa tim Dapur Nia
              </div>
              <img
                src={order.paymentProofUrl}
                alt="Bukti Transfer"
                className="max-h-60 w-full rounded-2xl object-contain bg-slate-100 p-2 border"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-base text-slate-600">
                Silakan transfer sejumlah <strong>{formatRupiah(order.totalAmount)}</strong> lalu unggah foto bukti transfer di bawah ini:
              </p>
              <PhotoUploader onFileSelect={handleFileSelect} disabled={isUploading} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
