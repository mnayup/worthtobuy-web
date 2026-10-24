export interface ReadyStockItem {
  id: number;
  sku: string;
  name: string;
  brandName: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  buyPrice: number;
  sellingPrice: number;
  totalCapitalValue: number;
  totalPotentialSales: number;
  potentialProfit: number;
  marginPercent: number;
}

export interface ReadyStockValuation {
  totalCapitalValue: number;
  availableCapitalValue: number;
  totalPotentialSales: number;
  potentialGrossProfit: number;
  potentialMargin: number;
  totalUnits: number;
  availableUnits: number;
  skuCount: number;
  items: ReadyStockItem[];
}

export interface FinanceReportData {
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
  shopeeRefund?: number;
  grossProfit: number;
  netProfit: number;
  margin: number;
  receivables: number;
  verifiedCashIn: number;
  cashOutflow: number;
  netCashFlow: number;
  readyStock: ReadyStockValuation;
}

export interface FinanceOverviewData {
  stats: {
    cashIn: number;
    cashOut: number;
    paymentsTotal?: number;
    outstanding?: number;
    omzet?: number;
    goodsRevenue?: number;
    serviceFees?: number;
    modal?: number;
    actualBuyPrice?: number;
    estimatedBuyPrice?: number;
    shoppingVariance?: number;
    shoppingEfficiency?: number;
    netProfit?: number;
    profitMargin?: number;
    operational?: number;
    refundTotal?: number;
    readyStock?: ReadyStockValuation;
  };
  report: FinanceReportData;
}
