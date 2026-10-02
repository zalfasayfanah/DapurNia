import { MenuItem } from '../../domain/types';
import { IMenuRepository } from '../../services';

export class FirebaseMenuAdapter implements IMenuRepository {
  constructor(private db?: any) {}

  async getMenus(): Promise<MenuItem[]> {
    throw new Error('Firebase integration will be activated when .env is configured.');
  }

  subscribeTodayMenus(callback: (menus: MenuItem[]) => void): () => void {
    return () => {};
  }

  async updateMenuPrice(menuId: string, newPrice: number): Promise<void> {
    throw new Error('Firebase integration will be activated when .env is configured.');
  }

  async updateMenuQuota(menuId: string, newQuota: number): Promise<void> {
    throw new Error('Firebase integration will be activated when .env is configured.');
  }
}
