import React from 'react';
import { MenuItem } from '../../domain/types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { QuantityStepper } from '../../components/common/QuantityStepper';
import { formatRupiah } from '../../lib/utils';
import { Utensils, AlertTriangle, Clock } from 'lucide-react';

interface MenuCatalogProps {
  menus: MenuItem[];
  selectedQuantities: Record<string, number>;
  onQuantityChange: (menuId: string, quantity: number) => void;
  isOrderingClosed: boolean;
}

export function MenuCatalog({
  menus,
  selectedQuantities,
  onQuantityChange,
  isOrderingClosed,
}: MenuCatalogProps) {
  return (
    <div className="space-y-4">
      {isOrderingClosed && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl flex items-start gap-3 shadow-sm animate-in fade-in-50">
          <Clock className="w-7 h-7 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xl font-bold text-amber-900">
              Pemesanan Hari Ini Sudah Ditutup Pukul 12.00
            </h3>
            <p className="text-base text-amber-800 mt-1">
              Mohon maaf, dapur kami sedang memproses pesanan yang masuk. Dapur Nia siap melayani pesanan Anda kembali esok hari mulai pukul 07.00!
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Utensils className="w-6 h-6 text-brand-600" />
          Menu Hari Ini
        </h2>
        <span className="text-base font-bold text-slate-500">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {menus.map((menu) => {
          const qty = selectedQuantities[menu.id] || 0;
          const isSoldOut = menu.remainingStock <= 0;
          const isDisabled = isOrderingClosed || isSoldOut;

          return (
            <Card
              key={menu.id}
              className={`transition-all duration-200 ${
                qty > 0 ? 'ring-2 ring-brand-500 shadow-md bg-orange-50/10' : ''
              } ${isSoldOut ? 'opacity-80 bg-slate-50' : ''}`}
            >
              <div className="flex flex-col sm:flex-row gap-4">
                {menu.imageUrl && (
                  <img
                    src={menu.imageUrl}
                    alt={menu.name}
                    className="w-full sm:w-36 h-36 object-cover rounded-xl shadow-inner shrink-0"
                  />
                )}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-xl font-bold text-slate-900 leading-snug">
                        {menu.name}
                      </h3>
                      {isSoldOut ? (
                        <Badge variant="destructive" className="text-base px-3 py-1 font-black shrink-0">
                          HABIS
                        </Badge>
                      ) : menu.remainingStock <= 5 ? (
                        <Badge variant="warning" className="text-base px-3 py-1 font-bold shrink-0 animate-pulse">
                          Sisa {menu.remainingStock} porsi!
                        </Badge>
                      ) : (
                        <Badge variant="success" className="text-base px-3 py-1 font-bold shrink-0">
                          Sisa {menu.remainingStock} porsi
                        </Badge>
                      )}
                    </div>
                    <p className="text-2xl font-black text-brand-700 mt-1">
                      {formatRupiah(menu.price)}
                      <span className="text-base text-slate-500 font-normal"> / porsi</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-base font-bold text-slate-700">Jumlah Porsi:</span>
                    {isDisabled ? (
                      <span className="text-base font-bold text-slate-400 italic">
                        {isSoldOut ? 'Porsi Habis' : 'Pemesanan Ditutup'}
                      </span>
                    ) : (
                      <QuantityStepper
                        value={qty}
                        onChange={(newVal) => onQuantityChange(menu.id, newVal)}
                        min={0}
                        max={menu.remainingStock}
                      />
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
