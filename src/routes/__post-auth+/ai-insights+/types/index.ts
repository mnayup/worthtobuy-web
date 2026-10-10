export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: string[];
  generatedAt?: string;
}

export interface AiStatus {
  enabled: boolean;
  model: string;
  mockMode: boolean;
  apiVersion: string;
  assistantVersion: string;
  role: string;
}

export interface HistoryItem {
  id: number;
  action: 'AI_CHAT' | 'AI_BUSINESS_REPORT';
  conversationId?: string;
  question?: string;
  answer?: string;
  generatedAt?: string;
  createdAt: string;
  sources?: string[];
  reportSummary?: string;
}

export interface WeeklyReport {
  title: string;
  periodLabel: string;
  generatedAt: string;
  role: 'OWNER' | 'FINANCE';
  businessSummary: {
    totalRevenue: number;
    transactions: number;
    newCustomers: number | null;
    repeatCustomers: number | null;
  };
  financialHealth: {
    paymentsReceived: number;
    outstanding: number;
    overdueInvoices: number;
    expenses: number;
    capital: number;
    refunds: number;
    profit: number;
    marginPercent: number;
  };
  operationalMetrics: null | {
    pendingPurchase: number;
    purchasedNotReady: number;
    waitingShipment: number;
    customerNotReceived: number;
  };
  executiveSummary: string;
  financialCommentary: string;
  operationalIssues: Array<{ title: string; detail: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' }>;
  recommendations: string[];
  caveats: string[];
}
