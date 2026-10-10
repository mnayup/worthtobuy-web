export interface Expense {
  id: number;
  expenseNumber: string;
  expenseDate: string;
  category: string;
  periodId?: number;
  amount: number;
  amountIdr: number;
  payee?: string;
  paymentMethod?: string;
  proofUrl?: string;
  notes?: string;
  period?: { code: string };
}
