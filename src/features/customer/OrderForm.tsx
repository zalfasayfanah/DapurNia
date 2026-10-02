import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { MenuItem, Customer } from '../../domain/types';
import { formatRupiah } from '../../lib/utils';
import { User, Phone, MapPin, ShoppingBag, ArrowRight } from 'lucide-react';

interface OrderFormProps {
  menus: MenuItem[];
  selectedQuantities: Record<string, number>;
  onLookupCustomer: (whatsapp: string) => Promise<Customer | null>;
  onSubmitOrder: (customerData: { whatsapp: string; name: string; address: string }) => Promise<void>;
  isSubmitting?: boolean;
}

export function OrderForm({
  menus,
  selectedQuantities,
  onLookupCustomer,
  onSubmitOrder,
  isSubmitting = false,
}: OrderFormProps) {
  const [whatsapp, setWhatsapp] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-fill when WhatsApp number changes
  useEffect(() => {
    const cleanDigits = whatsapp.replace(/\D/g, '');
    if (cleanDigits.length >= 10) {
      onLookupCustomer(whatsapp).then((cust) => {
        if (cust) {
          setName(cust.name);
          setAddress(cust.address);
        }
      });
    }
  }, [whatsapp, onLookupCustomer]);

  // Calculations
  const selectedItems = menus
    .filter((m) => (selectedQuantities[m.id] || 0) > 0)
    .map((m) => ({
      menu: m,
      quantity: selectedQuantities[m.id],
      subtotal: m.price * selectedQuantities[m.id],
    }));

  const subtotalMenu = selectedItems.reduce((acc, item) => acc + item.subtotal, 0);
  const deliveryFee = selectedItems.length > 0 ? 10000 : 0;
  const totalAmount = subtotalMenu + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (selectedItems.length === 0) {
      setFormError('Silakan pilih minimal 1 porsi menu di atas.');
      return;
    }

    if (!whatsapp.trim()) {
      setFormError('Mohon isi Nomor WhatsApp aktif.');
      return;
    }

    if (!name.trim()) {
      setFormError('Mohon isi Nama Pemesan.');
      return;
    }

    if (!address.trim()) {
      setFormError('Mohon isi Alamat Pengantaran di dalam kompleks.');
      return;
    }

    await onSubmitOrder({ whatsapp, name, address });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
            <ShoppingBag className="w-5 h-5 text-brand-600" />
            Ringkasan Pesanan Anda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedItems.length === 0 ? (
            <p className="text-base text-slate-500 italic py-2 text-center">
              Belum ada menu yang dipilih. Silakan tentukan jumlah porsi pada menu di atas.
            </p>
          ) : (
            <div className="space-y-2">
              {selectedItems.map(({ menu, quantity, subtotal }) => (
                <div key={menu.id} className="flex justify-between items-center text-lg">
                  <span className="text-slate-800">
                    {quantity}x {menu.name}
                  </span>
                  <span className="font-bold text-slate-900">{formatRupiah(subtotal)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center text-base text-slate-600 pt-2 border-t border-slate-100">
                <span>Ongkos Kirim Flat (Kompleks)</span>
                <span>{formatRupiah(deliveryFee)}</span>
              </div>
              <div className="flex justify-between items-center text-2xl font-black text-brand-700 pt-2 border-t-2 border-dashed border-slate-200">
                <span>Total Tagihan:</span>
                <span>{formatRupiah(totalAmount)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Data Diri */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
            <User className="w-5 h-5 text-brand-600" />
            Data Pengantaran (Tanpa Akun)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="whatsapp-input" className="block text-base font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-brand-600" />
              Nomor WhatsApp
            </label>
            <Input
              id="whatsapp-input"
              aria-label="Nomor WhatsApp"
              type="tel"
              placeholder="Contoh: 081234567890"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
            />
            <span className="text-sm text-slate-500 mt-1 block">
              *Jika pernah memesan, nama & alamat Anda akan terisi otomatis.
            </span>
          </div>

          <div>
            <label htmlFor="name-input" className="block text-base font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4 text-brand-600" />
              Nama Pemesan
            </label>
            <Input
              id="name-input"
              aria-label="Nama Pemesan"
              type="text"
              placeholder="Contoh: Ibu Rina"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="address-input" className="block text-base font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-600" />
              Alamat Pengantaran
            </label>
            <Input
              id="address-input"
              aria-label="Alamat Pengantaran"
              type="text"
              placeholder="Contoh: Kompleks Griya Indah Blok B2 No. 5"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          {formError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-base font-bold">
              {formError}
            </div>
          )}

          <Button
            type="submit"
            variant="default"
            size="lg"
            disabled={selectedItems.length === 0 || isSubmitting}
            className="w-full text-xl h-16 rounded-2xl shadow-lg mt-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
          >
            {isSubmitting ? (
              'Memproses Pesanan...'
            ) : (
              <>
                Lanjut ke Pembayaran
                <ArrowRight className="w-6 h-6 ml-2" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
