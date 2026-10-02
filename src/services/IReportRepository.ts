export interface SoldPortionSummary {
  menuName: string;
  totalSold: number;
}

export interface RevenueSummary {
  totalFoodAmount: number;
  totalDeliveryFee: number;
  grandTotal: number;
}

export interface IReportRepository {
  getDailySoldPortions(date: string): Promise<SoldPortionSummary[]>;
  getDailyRevenue(date: string): Promise<RevenueSummary>;
}
