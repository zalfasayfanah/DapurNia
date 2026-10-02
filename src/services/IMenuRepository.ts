import { MenuItem } from '../domain/types';

export interface CreateMenuItemDTO {
  name: string;
  price: number;
  initialQuota: number;
  imageUrl?: string;
  isActive?: boolean;
}

export interface IMenuRepository {
  getMenus(): Promise<MenuItem[]>;
  subscribeTodayMenus(callback: (menus: MenuItem[]) => void): () => void;
  createMenu(menuData: CreateMenuItemDTO): Promise<MenuItem>;
  updateMenuPrice(menuId: string, newPrice: number): Promise<void>;
  updateMenuQuota(menuId: string, newQuota: number): Promise<void>;
  deleteMenu(menuId: string): Promise<void>;
}
