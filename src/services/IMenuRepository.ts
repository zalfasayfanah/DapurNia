import { MenuItem } from '../domain/types';

export interface IMenuRepository {
  getMenus(): Promise<MenuItem[]>;
  subscribeTodayMenus(callback: (menus: MenuItem[]) => void): () => void;
  updateMenuPrice(menuId: string, newPrice: number): Promise<void>;
  updateMenuQuota(menuId: string, newQuota: number): Promise<void>;
}
