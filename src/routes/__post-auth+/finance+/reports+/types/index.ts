import type { ReadyStockValuation } from '../../overview+/types';

export interface ProfitLossReport {
  omzet: number;
  modal: number;
  actualBuyPrice: number;
  estimatedBuyPrice: number;
  shoppingVariance: number;
  shoppingEfficiency: number;
  goodsRevenue: number;
  goodsMargin: number;
  goodsMarginPercent: number;
  serviceFeeIncome: number;
  otherFeeIncome: number;
  discountTotal: number;
  operational: number;
  expenseBreakdown: Record<string, number>;
  refund: number;
  grossProfit: number;
  netProfit: number;
  margin: number;
  receivables: number;
  verifiedCashIn: number;
  cashOutflow: number;
  netCashFlow: number;
  readyStock: ReadyStockValuation;
}

export interface PeriodPerformance {
  id: number;
  code: string;
  name: string;
  location: string;
  orders: number;
  omzet: number;
  goodsRevenue: number;
  serviceFeeIncome: number;
  estimatedBuyPrice: number;
  modal: number;
  actualBuyPrice: number;
  shoppingVariance: number;
  expenses: number;
  netProfit: number;
  margin: number;
}
