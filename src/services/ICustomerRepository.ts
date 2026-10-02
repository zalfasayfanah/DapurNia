import { Customer } from '../domain/types';

export interface ICustomerRepository {
  getCustomerByWhatsApp(whatsapp: string): Promise<Customer | null>;
  saveCustomer(customer: Customer): Promise<void>;
}
