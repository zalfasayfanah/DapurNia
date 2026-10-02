import React, { useState, useEffect } from 'react';
import { MenuItem } from '../../domain/types';
import { IMenuRepository } from '../../services';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Dialog } from '../../components/ui/Dialog';
import { Settings, Save, CheckCircle2, Plus, Trash2, Utensils, DollarSign, Layers } from 'lucide-react';

interface MenuManagerProps {
  adapter: IMenuRepository;
}

export function MenuManager({ adapter }: MenuManagerProps) {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [editingValues, setEditingValues] = useState<Record<string, { price: number; quota: number }>>({});
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // State untuk Modal Tambah Menu Baru
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuPrice, setNewMenuPrice] = useState('25000');
  const [newMenuQuota, setNewMenuQuota] = useState('20');
  const [newMenuImageUrl, setNewMenuImageUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

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

  const handleDeleteMenu = async (menuId: string, name: string) => {
    if (window.confirm(`Apakah Bu Dina yakin ingin menghapus menu "${name}" dari daftar hari ini?`)) {
      await adapter.deleteMenu(menuId);
    }
  };

  const handleCreateMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (!newMenuName.trim()) {
      setAddError('Mohon isi nama menu masakan.');
      return;
    }

    const price = Number(newMenuPrice);
    if (!price || price <= 0) {
      setAddError('Harga menu minimal Rp1.000.');
      return;
    }

    const quota = parseInt(newMenuQuota, 10);
    if (!quota || quota <= 0) {
      setAddError('Kuota porsi minimal 1 porsi.');
      return;
    }

    try {
      setIsAdding(true);
      await adapter.createMenu({
        name: newMenuName.trim(),
        price,
        initialQuota: quota,
        imageUrl: newMenuImageUrl.trim() || undefined,
        isActive: true,
      });

      // Reset form
      setNewMenuName('');
      setNewMenuPrice('25000');
      setNewMenuQuota('20');
      setNewMenuImageUrl('');
      setShowAddModal(false);
    } catch (err: any) {
      setAddError(err.message || 'Gagal menambahkan menu baru.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in-50">
      {/* Header & Tombol Tambah Menu */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1 border-b border-slate-200">
        <div>
          <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-brand-600" />
            Kelola Menu & Kuota Harian
          </h3>
          <p className="text-base text-slate-500">
            Atur harga per porsi dan kapasitas masak Dapur Nia untuk hari ini.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
          size="lg"
          className="w-full sm:w-auto text-lg font-bold bg-orange-600 hover:bg-orange-700 shadow-lg min-h-[52px]"
        >
          <Plus className="w-6 h-6 mr-1.5 stroke-[3]" />
          Tambah Menu Baru
        </Button>
      </div>

      {/* Daftar Menu Aktif */}
      <div className="grid grid-cols-1 gap-4">
        {menus.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-2xl border border-slate-200">
            <p className="text-lg text-slate-600 font-bold">Belum ada menu masakan untuk hari ini.</p>
            <p className="text-base text-slate-400 mt-1">Silakan klik tombol <strong>"Tambah Menu Baru"</strong> di atas.</p>
          </div>
        ) : (
          menus.map((menu) => {
            const vals = editingValues[menu.id] || { price: menu.price, quota: menu.initialQuota };
            const isSaved = savedSuccessId === menu.id;

            return (
              <Card key={menu.id} className="shadow-md border-slate-200 bg-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h4 className="text-xl font-extrabold text-slate-900">{menu.name}</h4>
                    <p className="text-base text-slate-500">
                      Sisa Porsi Saat Ini: <strong className="text-brand-700 font-mono text-lg">{menu.remainingStock}</strong> porsi (dari kuota {menu.initialQuota})
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-1">
                        Harga per Porsi (Rp)
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

                    <div className="pt-5 flex items-center gap-2">
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

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteMenu(menu.id, menu.name)}
                        className="h-12 w-12 text-rose-600 hover:bg-rose-50 border-rose-200"
                        title="Hapus Menu"
                        aria-label="Hapus Menu"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal Dialog: Tambah Menu Baru */}
      <Dialog
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Menu Masakan Baru"
        description="Masukkan menu masakan harian baru untuk disajikan hari ini."
      >
        <form onSubmit={handleCreateMenuSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-base font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-brand-600" />
              Nama Menu Masakan
            </label>
            <Input
              type="text"
              placeholder="Contoh: Sop Iga Sapi + Nasi & Sambal"
              value={newMenuName}
              onChange={(e) => setNewMenuName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-base font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-brand-600" />
                Harga per Porsi (Rp)
              </label>
              <Input
                type="number"
                placeholder="25000"
                value={newMenuPrice}
                onChange={(e) => setNewMenuPrice(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-base font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-brand-600" />
                Kuota Masak (Porsi)
              </label>
              <Input
                type="number"
                placeholder="20"
                value={newMenuQuota}
                onChange={(e) => setNewMenuQuota(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-base font-bold text-slate-800 mb-1">
              URL Foto Masakan (Opsional)
            </label>
            <Input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={newMenuImageUrl}
              onChange={(e) => setNewMenuImageUrl(e.target.value)}
            />
          </div>

          {addError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-base font-bold">
              {addError}
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowAddModal(false)}
              className="flex-1"
              disabled={isAdding}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              disabled={isAdding}
            >
              {isAdding ? 'Menyimpan...' : 'Tambah Menu'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
