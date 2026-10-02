import React, { useState, useEffect } from 'react';
import { MenuItem, Order } from '../../domain/types';
import { IOrderRepository, IMenuRepository, ICustomerRepository } from '../../services';
import { isOrderTimeValid } from '../../domain';
import { MenuCatalog } from './MenuCatalog';
import { OrderForm } from './OrderForm';
import { OrderTrackerPage } from './OrderTrackerPage';
import { OutsideComplexModal } from './OutsideComplexModal';

interface CustomerPortalProps {
  adapter: IOrderRepository & IMenuRepository & ICustomerRepository;
  serverTime?: Date;
}

export function CustomerPortal({ adapter, serverTime }: CustomerPortalProps) {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [showOutsideModal, setShowOutsideModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOrderingClosed = !isOrderTimeValid(serverTime || new Date(), 12, 0);

  useEffect(() => {
    const unsubscribe = adapter.subscribeTodayMenus((updatedMenus) => {
      setMenus(updatedMenus);
    });
    return () => unsubscribe();
  }, [adapter]);

  // Subscribe to active order changes in real-time if tracking an order
  useEffect(() => {
    if (!activeOrder) return;
    const unsubscribe = adapter.subscribeOrdersByDate(activeOrder.orderDate, (orders) => {
      const current = orders.find((o) => o.id === activeOrder.id);
      if (current) {
        setActiveOrder(current);
      }
    });
    return () => unsubscribe();
  }, [adapter, activeOrder?.id]);

  const handleQuantityChange = (menuId: string, quantity: number) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [menuId]: quantity,
    }));
  };

  const handleLookupCustomer = async (whatsapp: string) => {
    return await adapter.getCustomerByWhatsApp(whatsapp);
  };

  const handleSubmitOrder = async (customerData: { whatsapp: string; name: string; address: string }) => {
    setIsSubmitting(true);
    try {
      const items = Object.entries(selectedQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([menuId, quantity]) => ({ menuId, quantity }));

      const { orderId } = await adapter.placeOrder(
        {
          customer: customerData,
          items,
        },
        serverTime
      );

      const createdOrder = await adapter.getOrderById(orderId);
      if (createdOrder) {
        setActiveOrder(createdOrder);
        setSelectedQuantities({});
      }
    } catch (err: any) {
      if (err.message && err.message.includes('Kompleks Griya Indah')) {
        setShowOutsideModal(true);
      } else {
        alert(err.message || 'Terjadi kesalahan saat memproses pesanan.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadProof = async (orderId: string, file: File) => {
    await adapter.uploadPaymentProof(orderId, file);
    const updated = await adapter.getOrderById(orderId);
    if (updated) {
      setActiveOrder(updated);
    }
  };

  if (activeOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-4">
        <OrderTrackerPage
          order={activeOrder}
          onUploadProof={handleUploadProof}
          onBack={() => setActiveOrder(null)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-4 space-y-6 pb-16">
      <MenuCatalog
        menus={menus}
        selectedQuantities={selectedQuantities}
        onQuantityChange={handleQuantityChange}
        isOrderingClosed={isOrderingClosed}
      />

      {!isOrderingClosed && (
        <OrderForm
          menus={menus}
          selectedQuantities={selectedQuantities}
          onLookupCustomer={handleLookupCustomer}
          onSubmitOrder={handleSubmitOrder}
          isSubmitting={isSubmitting}
        />
      )}

      <OutsideComplexModal
        open={showOutsideModal}
        onClose={() => setShowOutsideModal(false)}
      />
    </div>
  );
}
