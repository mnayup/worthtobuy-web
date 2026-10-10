export type PreviewStage = 'AUTO' | 'DP' | 'SETTLEMENT' | 'PAID' | 'REKAP' | 'FULL';
export type PrintFormat = 'A4' | 'MOBILE';
export type StageMode = 'DP' | 'SETTLEMENT' | 'PAID' | 'FULL' | 'REKAP';
export type PaymentSortCol = 'date' | 'method' | 'amount' | 'status' | null;
export type RefundSortCol = 'number' | 'reason' | 'amount' | 'status' | null;
export type SortDir = 'asc' | 'desc';
