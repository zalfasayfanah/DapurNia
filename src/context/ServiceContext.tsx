import React, { createContext, useContext, useMemo } from 'react';
import { IOrderRepository, IMenuRepository, ICustomerRepository, IReportRepository } from '../services';
import { MockStorageAdapter } from '../infrastructure/mock/MockStorageAdapter';

export interface Services {
  orders: IOrderRepository;
  menus: IMenuRepository;
  customers: ICustomerRepository;
  reports: IReportRepository;
  unifiedAdapter: IOrderRepository & IMenuRepository & ICustomerRepository & IReportRepository;
}

const ServiceContext = createContext<Services | null>(null);

export function ServiceProvider({
  children,
  customAdapter,
}: {
  children: React.ReactNode;
  customAdapter?: IOrderRepository & IMenuRepository & ICustomerRepository & IReportRepository;
}) {
  const services = useMemo(() => {
    const adapter = customAdapter || new MockStorageAdapter();
    return {
      orders: adapter,
      menus: adapter,
      customers: adapter,
      reports: adapter,
      unifiedAdapter: adapter,
    };
  }, [customAdapter]);

  return <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>;
}

export function useServices() {
  const ctx = useContext(ServiceContext);
  if (!ctx) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return ctx;
}
