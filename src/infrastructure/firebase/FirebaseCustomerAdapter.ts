import { Customer } from '../../domain/types';
import { ICustomerRepository } from '../../services';

export class FirebaseCustomerAdapter implements ICustomerRepository {
  constructor(private db?: any) {}

  async getCustomerByWhatsApp(whatsapp: string): Promise<Customer | null> {
    throw new Error('Firebase integration will be activated when .env is configured.');
  }

  async saveCustomer(customer: Customer): Promise<void> {
    throw new Error('Firebase integration will be activated when .env is configured.');
  }
}
