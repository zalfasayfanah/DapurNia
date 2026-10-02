import React, { useState, useEffect } from 'react';
import { Order, UserRole, OrderStatus } from '../../domain/types';
import { IOrderRepository } from '../../services';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PaymentVerificationModal } from './PaymentVerificationModal';
import { OrderActionButtons } from './OrderActionButtons';
import { formatRupiah } from '../../lib/utils';
import { ChefHat, Clock, Phone, MapPin, Search, Filter } from 'lucide-react';

interface KitchenDashboardProps {
  adapter: IOrderRepository;
  userRole: UserRole;
  userName: string;
  targetDate?: string;
  onEmergencyCancel?: (order: Order) => void;
}

export function KitchenDashboard({
  adapter,
  userRole,
  userName,
  targetDate = new Date().toISOString().split('T')[0],
  onEmergencyCancel,
}: KitchenDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderForVerification, setSelectedOrderForVerification] = useState<Order | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    const unsubscribe = adapter.subscribeOrdersByDate(targetDate, (updatedOrders) => {
      setOrders(updatedOrders);
    });
    return () => unsubscribe();
  }, [adapter, targetDate]);

  const handleAcceptPayment = async (orderId: string) => {
    await adapter.updateOrderStatus({
      orderId,
      nextStatus: 'PROCESSING',
      userRole,
      confirmedBy: userName,
    });
  };

  const handleRejectPayment = async (orderId: string, reason: string) => {
    await adapter.updateOrderStatus({
      orderId,
      nextStatus: 'CANCELLED',
      userRole,
      cancelledBy: userName as any,
      cancellationReason: reason,
    });
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    await adapter.updateOrderStatus({
      orderId,
      nextStatus,
      userRole,
      confirmedBy: userName,
    });
  };

  const filteredOrders = orders.filter((o) => {
    if (activeFilter === 'ALL') return true;
    return o.status === activeFilter;
  });

  const waitingCount = orders.filter((o) => o.status === 'WAITING_PAYMENT').length;
  const processingCount = orders.filter((o) => o.status === 'PROCESSING').length;
  const shippedCount = orders.filter((o) => o.status === 'SHIPPED').length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 space-y-5 pb-20">
      {/* Header Stat Ringkas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <ChefHat className="w-7 h-7 text-brand-600" />
            Antrean Dapur
          </h2>
          <p className="text-base text-slate-600">
            Petugas: <strong>{userName}</strong> ({userRole === 'owner' ? 'Pemilik' : 'Staf Dapur'})
          </p>
        </div>
        <span className="text-base font-bold bg-slate-200 px-3 py-1.5 rounded-xl text-slate-800">
          {targetDate}
        </span>
      </div>

      {/* Quick Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-4 py-2.5 rounded-xl font-bold text-base whitespace-nowrap transition-all ${
            activeFilter === 'ALL'
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          Semua ({orders.length})
        </button>
        <button
          onClick={() => setActiveFilter('WAITING_PAYMENT')}
          className={`px-4 py-2.5 rounded-xl font-bold text-base whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeFilter === 'WAITING_PAYMENT'
              ? 'bg-amber-600 text-white shadow-md'
              : 'bg-amber-50 text-amber-900 border border-amber-300'
          }`}
        >
          Butuh Verifikasi ({waitingCount})
        </button>
        <button
          onClick={() => setActiveFilter('PROCESSING')}
          className={`px-4 py-2.5 rounded-xl font-bold text-base whitespace-nowrap transition-all ${
            activeFilter === 'PROCESSING'
              ? 'bg-orange-600 text-white shadow-md'
              : 'bg-orange-50 text-orange-900 border border-orange-200'
          }`}
        >
          Dimasak ({processingCount})
        </button>
        <button
          onClick={() => setActiveFilter('SHIPPED')}
          className={`px-4 py-2.5 rounded-xl font-bold text-base whitespace-nowrap transition-all ${
            activeFilter === 'SHIPPED'
              ? 'bg-teal-700 text-white shadow-md'
              : 'bg-teal-50 text-teal-900 border border-teal-200'
          }`}
        >
          Diantar ({shippedCount})
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-white border border-slate-200 shadow-sm space-y-2">
          <p className="text-xl font-bold text-slate-700">Tidak ada pesanan pada filter ini</p>
          <p className="text-base text-slate-500">Pesanan baru yang masuk akan otomatis tampil di sini secara real-time.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isWaiting = order.status === 'WAITING_PAYMENT';

            return (
              <Card
                key={order.id}
                className={`transition-all duration-200 shadow-sm ${
                  isWaiting ? 'border-2 border-amber-400 bg-amber-50/20 shadow-md ring-2 ring-amber-400/30' : ''
                }`}
              >
                <div className="flex justify-between items-start pb-2 border-b border-slate-100">
                  <div>
                    <span className="font-mono text-sm font-bold text-slate-400 block">
                      {order.orderNumber}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-900">
                      {order.customerSnapshot.name}
                    </h3>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="py-3 space-y-2 text-base">
                  <div className="flex items-center gap-1 text-slate-600">
                    <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
                    <span className="truncate">{order.customerSnapshot.address}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 font-mono text-sm">
                    <Phone className="w-4 h-4" />
                    <span>{order.customerSnapshot.whatsapp}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 mt-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-base">
                        <span className="font-bold text-slate-800">
                          {item.quantity}x {item.menuName}
                        </span>
                        <span className="text-slate-600">{formatRupiah(item.subtotal)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center text-lg font-black text-brand-700 pt-1 border-t border-slate-200">
                      <span>Total:</span>
                      <span>{formatRupiah(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <OrderActionButtons
                    order={order}
                    userRole={userRole}
                    onVerifyPayment={() => setSelectedOrderForVerification(order)}
                    onUpdateStatus={handleUpdateStatus}
                    onEmergencyCancel={onEmergencyCancel}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Verification Modal */}
      <PaymentVerificationModal
        order={selectedOrderForVerification}
        open={!!selectedOrderForVerification}
        onClose={() => setSelectedOrderForVerification(null)}
        onAccept={handleAcceptPayment}
        onReject={handleRejectPayment}
      />
    </div>
  );
}
