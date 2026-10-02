import React, { useState } from 'react';
import { Order } from '../../domain/types';
import { IOrderRepository, IMenuRepository, IReportRepository } from '../../services';
import { KitchenDashboard } from '../staff/KitchenDashboard';
import { MenuManager } from './MenuManager';
import { DailyReports } from './DailyReports';
import { EmergencyCancelModal } from './EmergencyCancelModal';
import { ChefHat, BarChart3, Settings, Crown } from 'lucide-react';

interface OwnerDashboardProps {
  adapter: IOrderRepository & IMenuRepository & IReportRepository;
}

export function OwnerDashboard({ adapter }: OwnerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'KITCHEN' | 'REPORTS' | 'MENUS'>('KITCHEN');
  const [cancelTargetOrder, setCancelTargetOrder] = useState<Order | null>(null);

  const handleConfirmEmergencyCancel = async (orderId: string, reason: string) => {
    await adapter.updateOrderStatus({
      orderId,
      nextStatus: 'CANCELLED',
      userRole: 'owner',
      cancelledBy: 'Dina',
      cancellationReason: reason,
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-6 pb-20">
      {/* Subnav Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-slate-200/80 p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveTab('KITCHEN')}
          className={`py-3 rounded-xl font-extrabold text-base flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'KITCHEN'
              ? 'bg-white text-orange-700 shadow-md'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <ChefHat className="w-5 h-5" />
          Antrean Dapur
        </button>

        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`py-3 rounded-xl font-extrabold text-base flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'REPORTS'
              ? 'bg-white text-emerald-700 shadow-md'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          Laporan Harian
        </button>

        <button
          onClick={() => setActiveTab('MENUS')}
          className={`py-3 rounded-xl font-extrabold text-base flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'MENUS'
              ? 'bg-white text-amber-900 shadow-md'
              : 'text-slate-700 hover:text-slate-900'
          }`}
        >
          <Settings className="w-5 h-5" />
          Kelola Menu
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'KITCHEN' && (
        <KitchenDashboard
          adapter={adapter}
          userRole="owner"
          userName="Bu Dina"
          onEmergencyCancel={(order) => setCancelTargetOrder(order)}
        />
      )}

      {activeTab === 'REPORTS' && <DailyReports adapter={adapter} />}

      {activeTab === 'MENUS' && <MenuManager adapter={adapter} />}

      {/* Emergency Cancellation Modal */}
      <EmergencyCancelModal
        order={cancelTargetOrder}
        open={!!cancelTargetOrder}
        onClose={() => setCancelTargetOrder(null)}
        onConfirmCancel={handleConfirmEmergencyCancel}
      />
    </div>
  );
}
