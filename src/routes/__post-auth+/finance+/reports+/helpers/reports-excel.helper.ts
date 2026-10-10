import { exportToExcel } from '~/lib/excel';
import type { ProfitLossReport } from '../types';

export function exportReportsToExcel(report: ProfitLossReport) {
  const headers = ['Kategori / Deskripsi Akun', 'Nilai (IDR)', 'Keterangan'];
  const rows: (string | number)[][] = [
    ['=== I. PENDAPATAN & PENJUALAN ===', '', ''],
    [
      'Penjualan Barang (Goods Revenue)',
      report.goodsRevenue,
      'Subtotal harga jual barang titipan & ready stock',
    ],
    [
      'Pendapatan Fee Jasa Titip (Service Fee)',
      report.serviceFeeIncome,
      '100% Pure income dari komisi jastip',
    ],
    [
      'Pendapatan Ongkos Kirim & Handling',
      report.otherFeeIncome,
      'Customer shipping & handling fees',
    ],
    ['Potongan Diskon Penjualan', -report.discountTotal, 'Diskon kupon & promo'],
    ['TOTAL OMZET / PENDAPATAN BRUTO', report.omzet, 'Gross Invoiced Revenue'],
    ['', '', ''],
    ['=== II. MODAL BELANJA (HARGA POKOK) ===', '', ''],
    [
      'Estimasi Awal Modal Belanja',
      report.estimatedBuyPrice,
      'Target belanja awal pada order',
    ],
    [
      'Realisasi Modal Belanja Riil',
      report.actualBuyPrice,
      'Uang keluar belanja aktual di toko',
    ],
    [
      'Selisih Belanja / Variance',
      report.shoppingVariance,
      report.shoppingVariance >= 0
        ? 'Efisiensi / Hemat Modal'
        : 'Over-Budget',
    ],
    [
      'TOTAL MODAL BELANJA BARANG',
      -report.actualBuyPrice,
      'Cost of Goods Sold (Actual)',
    ],
    ['', '', ''],
    ['=== III. LABA KOTOR ===', '', ''],
    [
      'Spread Penjualan Barang (Goods Margin)',
      report.goodsMargin,
      `Margin Barang ${report.goodsMarginPercent.toFixed(1)}%`,
    ],
    [
      'LABA KOTOR KESELURUHAN (GROSS PROFIT)',
      report.grossProfit,
      'Omzet dikurangi Modal Belanja',
    ],
    ['', '', ''],
    ['=== IV. BEBAN OPERASIONAL & REFUND ===', '', ''],
  ];

  Object.entries(report.expenseBreakdown || {}).forEach(([cat, amt]) => {
    rows.push([
      `Beban Operasional: ${cat.replaceAll('_', ' ')}`,
      -amt,
      'Pengeluaran operasional trip',
    ]);
  });
  if (Object.keys(report.expenseBreakdown || {}).length === 0) {
    rows.push(['Total Beban Operasional', -report.operational, 'Operasional']);
  }

  if (report.refund > 0) {
    rows.push([
      'Pengembalian Dana (Refund Customer)',
      -report.refund,
      'Barang out of stock / dibatalkan',
    ]);
  }

  rows.push(
    ['', '', ''],
    ['=== V. LABA BERSIH OPERASIONAL ===', '', ''],
    [
      'LABA BERSIH OPERASIONAL (NET PROFIT)',
      report.netProfit,
      `Net Profit Margin ${report.margin.toFixed(2)}%`,
    ],
    ['', '', ''],
    ['=== VI. ARUS KAS & VALUASI READY STOCK ===', '', ''],
    [
      'Kas Masuk Terverifikasi (Cash In)',
      report.verifiedCashIn,
      'Pembayaran customer yang telah diverifikasi',
    ],
    [
      'Total Kas Keluar (Cash Outflow)',
      -report.cashOutflow,
      'Modal belanja + Beban operasional + Refund',
    ],
    [
      'Arus Kas Bersih (Net Cash Flow)',
      report.netCashFlow,
      'Kas Masuk dikurangi Total Kas Keluar',
    ],
    [
      'Piutang Pelanggan Belum Tertagih',
      report.receivables,
      'Outstanding balance invoice aktif',
    ],
    [
      'Total Modal Tertanam di Ready Stock',
      report.readyStock?.totalCapitalValue || 0,
      `${report.readyStock?.totalUnits || 0} unit fisik`,
    ],
    [
      'Potensi Omzet Penjualan Ready Stock',
      report.readyStock?.totalPotentialSales || 0,
      'Jika seluruh stok terjual',
    ],
    [
      'Potensi Laba Kotor Ready Stock',
      report.readyStock?.potentialGrossProfit || 0,
      `Potensi Margin ${report.readyStock?.potentialMargin?.toFixed(1) || 0}%`,
    ]
  );

  exportToExcel(
    'worthtobuy-financial-report.xlsx',
    'Profit & Loss',
    headers,
    rows
  );
}
