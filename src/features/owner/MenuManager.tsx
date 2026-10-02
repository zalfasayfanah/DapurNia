import React, { useState, useEffect } from 'react';
import { MenuItem } from '../../domain/types';
import { IMenuRepository } from '../../services';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatRupiah } from '../../lib/utils';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

interface MenuManagerProps {
  adapter: IMenuRepository;
}

export function MenuManager({ adapter }: MenuManagerProps) {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [editingValues, setEditingValues] = useState<Record<string, { price: number; quota: number }>>({});
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = adapter.subscribeTodayMenus((updated) => {
      setMenus(updated);
      const initialMap: Record<string, { price: number; quota: number }> = {};
      updated.forEach((m) => {
        initialMap[m.id] = { price: m.price, quota: m.initialQuota };
      });
      setEditingValues(initialMap);
    });
    return () => unsubscribe();
  }, [adapter]);

  const handlePriceChange = (menuId: string, priceStr: string) => {
    const price = Number(priceStr) || 0;
    setEditingValues((prev) => ({
      ...prev,
      [menuId]: { ...prev[menuId], price },
    }));
  };

  const handleQuotaChange = (menuId: string, quotaStr: string) => {
    const quota = parseInt(quotaStr, 10) || 0;
    setEditingValues((prev) => ({
      ...prev,
      [menuId]: { ...prev[menuId], quota },
    }));
  };

  const handleSaveMenu = async (menuId: string) => {
    const values = editingValues[menuId];
    if (!values) return;

    await adapter.updateMenuPrice(menuId, values.price);
    await adapter.updateMenuQuota(menuId, values.quota);

    setSavedSuccessId(menuId);
    setTimeout(() => setSavedSuccessId(null), 2500);
  };

  return (
    <div className="space-y-4 animate-in fade-in-50">
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-brand-600" />
          Kelola Harga & Kuota Porsi Masak
        </h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {menus.map((menu) => {
          const vals = editingValues[menu.id] || { price: menu.price, quota: menu.initialQuota };
          const isSaved = savedSuccessId === menu.id;

          return (
            <Card key={menu.id} className="shadow-md border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xl font-extrabold text-slate-900">{menu.name}</h4>
                  <p className="text-base text-slate-500">
                    Sisa Saat Ini: <strong className="text-brand-700 font-mono text-lg">{menu.remainingStock}</strong> porsi
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                      Harga (Rp)
                    </label>
                    <Input
                      type="number"
                      value={vals.price}
                      onChange={(e) => handlePriceChange(menu.id, e.target.value)}
                      className="w-36 h-12 text-lg font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                      Kuota Masak
                    </label>
                    <Input
                      type="number"
                      value={vals.quota}
                      onChange={(e) => handleQuotaChange(menu.id, e.target.value)}
                      className="w-28 h-12 text-lg font-bold"
                    />
                  </div>

                  <div className="pt-5">
                    <Button
                      variant={isSaved ? 'success' : 'default'}
                      size="default"
                      onClick={() => handleSaveMenu(menu.id)}
                      className="h-12 text-base font-bold min-h-[48px]"
                    >
                      {isSaved ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 mr-1" />
                          Tersimpan
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-1" />
                          Simpan
                        </>
                      )}
                    </Button>
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
