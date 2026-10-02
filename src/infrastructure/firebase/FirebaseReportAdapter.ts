import { IReportRepository, SoldPortionSummary, RevenueSummary } from '../../services';

export class FirebaseReportAdapter implements IReportRepository {
  constructor(private db?: any) {}

  async getDailySoldPortions(date: string): Promise<SoldPortionSummary[]> {
    throw new Error('Firebase integration will be activated when .env is configured.');
  }

  async getDailyRevenue(date: string): Promise<RevenueSummary> {
    throw new Error('Firebase integration will be activated when .env is configured.');
  }
}
