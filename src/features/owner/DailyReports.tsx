import React, { useState, useEffect } from 'react';
import { IReportRepository, SoldPortionSummary, RevenueSummary } from '../../services';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { formatRupiah } from '../../lib/utils';
import { Calendar, DollarSign, ShoppingBasket, TrendingUp, Info } from 'lucide-react';

interface DailyReportsProps {
  adapter: IReportRepository;
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

export function DailyReports({
  adapter,
  selectedDate = new Date().toISOString().split('T')[0],
  onDateChange,
}: DailyReportsProps) {
  const [date, setDate] = useState(selectedDate);
  const [soldSummary, setSoldSummary] = useState<SoldPortionSummary[]>([]);
  const [revenue, setRevenue] = useState<RevenueSummary>({
    totalFoodAmount: 0,
    totalDeliveryFee: 0,
    grandTotal: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports(date);
  }, [adapter, date]);

  const loadReports = async (targetDate: string) => {
    setIsLoading(true);
    try {
      const [sold, rev] = await Promise.all([
        adapter.getDailySoldPortions(targetDate),
        adapter.getDailyRevenue(targetDate),
      ]);
      setSoldSummary(sold);
      setRevenue(rev);
    } catch (err) {
      console.error('Gagal memuat laporan', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    if (onDateChange) onDateChange(newDate);
  };

  const totalPortions = soldSummary.reduce((acc, curr) => acc + curr.totalSold, 0);

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Date Selector */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-brand-300/60 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-brand-700" />
            <span className="text-xl font-extrabold text-slate-900">Pilih Tanggal Laporan:</span>
          </div>
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="h-12 px-4 rounded-xl border-2 border-brand-400 bg-white font-bold text-lg text-slate-900 shadow-sm"
          />
        </div>
      </Card>

      {/* Laporan 2: Total Uang Masuk Kas (Hero Card Angka Ekstra Besar) */}
      <Card className="border-2 border-emerald-300 bg-emerald-50/40 shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-emerald-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-700" />
            Laporan 2: Total Uang Masuk Kas Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black text-emerald-700 font-mono">
              {formatRupiah(revenue.grandTotal)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-emerald-200/80">
            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
              <span className="text-base text-slate-600 block">Total Uang Makanan:</span>
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {formatRupiah(revenue.totalFoodAmount)}
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
              <span className="text-base text-slate-600 block">Total Ongkos Kirim:</span>
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {formatRupiah(revenue.totalDeliveryFee)}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-500 flex items-center gap-1 pt-1">
            <Info className="w-4 h-4 text-emerald-600" />
            *Hanya menghitung pesanan yang sah (Diproses, Dikirim, Selesai). Pesanan yang dibatalkan tidak dihitung.
          </p>
        </CardContent>
      </Card>

      {/* Laporan 1: Jumlah Porsi Terjual per Menu (Tabel Belanja Bahan) */}
      <Card className="shadow-lg border-brand-500/20">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
              <ShoppingBasket className="w-6 h-6 text-brand-600" />
              Laporan 1: Laporan Belanja Bahan (Porsi Terjual per Menu)
            </CardTitle>
            <span className="text-lg font-black bg-brand-100 text-brand-900 px-3 py-1 rounded-xl">
              Total: {totalPortions} Porsi
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          {soldSummary.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-lg">
              Belum ada porsi yang terjual pada tanggal ini.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-lg">Nama Menu Masakan</TableHead>
                  <TableHead className="text-lg text-right">Porsi Terjual (Untuk Belanja)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {soldSummary.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-bold text-slate-900 text-lg">
                      {item.menuName}
                    </TableCell>
                    <TableCell className="font-black text-2xl text-brand-700 text-right font-mono">
                      {item.totalSold} porsi
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
