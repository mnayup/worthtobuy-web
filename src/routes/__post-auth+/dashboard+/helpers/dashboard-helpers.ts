export const pieColors = [
  '#F43F5E', // Rose / Cherry
  '#4F46E5', // Indigo
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#0284C7', // Sky
  '#8B5CF6', // Violet
  '#0D9488', // Teal
  '#EC4899', // Pink
];

export function calculatePaymentProgress(omzet?: number, cashIn?: number): number {
  const total = Number(omzet || 0);
  return total ? Math.min(100, (Number(cashIn || 0) / total) * 100) : 0;
}
