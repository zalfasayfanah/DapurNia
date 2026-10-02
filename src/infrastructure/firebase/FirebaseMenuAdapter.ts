import { MenuItem } from '../../domain/types';
import { IMenuRepository, CreateMenuItemDTO } from '../../services';

export class FirebaseMenuAdapter implements IMenuRepository {
  constructor(private db?: any) {}

  async getMenus(): Promise<MenuItem[]> {
    throw new Error('Firebase integration will be activated when .env is configured.');
  }

  subscribeTodayMenus(callback: (menus: MenuItem[]) => void): () => void {
    return () => {};
  }

  async createMenu(menuData: CreateMenuItemDTO): Promise<MenuItem> {
    throw new Error('Firebase integration will be activated when .env is configured.');
  }

  async updateMenuPrice(menuId: string, newPrice: number): Promise<void> {
    throw new Error('Firebase integration will be activated when .env is configured.');
  }

  async updateMenuQuota(menuId: string, newQuota: number): Promise<void> {
    throw new Error('Firebase integration will be activated when .env is configured.');
  }

  async deleteMenu(menuId: string): Promise<void> {
    throw new Error('Firebase integration will be activated when .env is configured.');
  }
}
