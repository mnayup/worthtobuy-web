import { date, money } from '~/lib/format';

export interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  aliases?: string[];
}

export const AVAILABLE_TEMPLATE_VARIABLES: TemplateVariable[] = [
  { key: 'customerName', label: 'Nama Pelanggan', description: 'Nama lengkap pelanggan', aliases: ['namaPelanggan', 'nama_pelanggan'] },
  { key: 'invoiceNumber', label: 'No. Invoice', description: 'Nomor invoice (misal: WTB-INV-...)', aliases: ['noInvoice', 'no_invoice'] },
  { key: 'eventLabel', label: 'Event / Batch', description: 'Kode atau nama event belanja', aliases: ['namaEvent', 'event'] },
  { key: 'totalBill', label: 'Total Tagihan', description: 'Nominal total tagihan (Rp ...)', aliases: ['totalTagihan', 'total'] },
  { key: 'paidAmount', label: 'Sudah Dibayar', description: 'Nominal yang telah dibayarkan', aliases: ['sudahDibayar', 'terbayar'] },
  { key: 'outstandingAmount', label: 'Sisa Tagihan', description: 'Nominal sisa yang harus dilunasi', aliases: ['sisaTagihan', 'sisa'] },
  { key: 'dueDate', label: 'Jatuh Tempo', description: 'Tanggal batas jatuh tempo', aliases: ['jatuhTempo', 'tanggalJatuhTempo'] },
  { key: 'dpAmount', label: 'Target DP', description: 'Nominal DP yang harus dibayar', aliases: ['nominalDp', 'dp'] },
  { key: 'dpPercent', label: 'Persen DP', description: 'Persentase DP (misal: 50%)', aliases: ['persenDp'] },
  { key: 'remainingAfterDp', label: 'Sisa Setelah DP', description: 'Sisa pelunasan setelah bayar DP', aliases: ['sisaSetelahDp'] },
  { key: 'settlementNote', label: 'Catatan Pelunasan', description: 'Catatan waktu pelunasan (misal: saat produk siap kirim)', aliases: ['catatanPelunasan'] },
  { key: 'depositLine', label: 'Potongan Deposit', description: 'Baris rincian saldo deposit yang digunakan', aliases: ['potonganDeposit'] },
  { key: 'itemLines', label: 'Daftar Barang', description: 'Daftar item belanjaan customer', aliases: ['daftarItem', 'items'] },
  { key: 'shipmentInfo', label: 'Info Ekspedisi & Resi', description: 'Kurir pengiriman dan nomor resi', aliases: ['infoEkspedisi', 'resi'] },
  { key: 'linkSection', label: 'Link Portal & Bukti', description: 'Blok tautan invoice dan upload bukti transfer', aliases: ['linkInvoice', 'portalLink'] },
  { key: 'publicInvoiceUrl', label: 'URL Invoice Saja', description: 'Tautan URL langsung ke web invoice', aliases: ['invoiceUrl'] },
];

export const DEFAULT_WHATSAPP_TEMPLATES: Record<string, string> = {
  BILLING:
    `📚🌱 *INVOICE WORTHTOBUY*\n\n` +
    `Halo kak {{customerName}},\n` +
    `Terima kasih sudah memesan di WORTHTOBUY! Pesanan ({{eventLabel}}) sudah kami catat.\n\n` +
    `No. Invoice: {{invoiceNumber}}\n` +
    `Total tagihan: *{{totalBill}}*{{depositLine}}\n` +
    `*Sisa yang harus dibayar:* *{{outstandingAmount}}*\n` +
    `Jatuh tempo: {{dueDate}}\n\n` +
    `💳 Pembayaran transfer bank.\n` +
    `Setelah transfer, silakan upload bukti pembayaran lewat link di bawah ya kak.{{linkSection}}\n\n` +
    `Salam hangat,\n` +
    `Tim WORTHTOBUY`,
  DP:
    `📚🌱 *INVOICE WORTHTOBUY* (DP)\n\n` +
    `Halo kak {{customerName}},\n` +
    `Terima kasih sudah memesan di WORTHTOBUY! Pesanan ({{eventLabel}}) sudah kami catat.\n\n` +
    `No. Invoice: {{invoiceNumber}}\n` +
    `Total pesanan: {{totalBill}}{{depositLine}}\n` +
    `*Dibayar sekarang (DP): {{dpAmount}}* ({{dpPercent}}%)\n` +
    `Sisa {{remainingAfterDp}} dilunasi {{settlementNote}}.\n\n` +
    `💳 Pembayaran transfer bank.\n` +
    `Setelah transfer DP, mohon kirimkan buktinya via link di bawah ini ya kak.{{linkSection}}\n\n` +
    `Salam hangat,\n` +
    `Tim WORTHTOBUY`,
  SETTLEMENT:
    `📚🌱 *PELUNASAN — WORTHTOBUY*\n\n` +
    `Halo kak {{customerName}},\n` +
    `Kabar baik! Pesanan kakak ({{eventLabel}}) sudah siap, tinggal pelunasan ya.\n\n` +
    `No. Invoice: {{invoiceNumber}}\n` +
    `Total pesanan: {{totalBill}}{{depositLine}}\n` +
    `Sudah dibayar (DP): {{paidAmount}}\n` +
    `*Sisa yang perlu dilunasi: {{outstandingAmount}}*\n\n` +
    `💳 Pembayaran transfer bank.\n` +
    `Setelah transfer, silakan upload bukti pelunasannya ya kak.{{linkSection}}\n\n` +
    `Salam hangat,\n` +
    `Tim WORTHTOBUY`,
  FULL_PAYMENT:
    `📚🌱 *INVOICE LUNAS — WORTHTOBUY*\n\n` +
    `Halo kak {{customerName}},\n` +
    `Pembayaran invoice *{{invoiceNumber}}* sebesar *{{totalBill}}*{{depositLine}} telah kami terima dan dinyatakan *LUNAS*.\n\n` +
    `Terima kasih banyak sudah mempercayakan pesanan kakak di WORTHTOBUY! 🙏{{linkSection}}\n\n` +
    `Salam hangat,\n` +
    `Tim WORTHTOBUY`,
  OVERDUE:
    `📚🌱 *INVOICE WORTHTOBUY* (PENGINGAT)\n\n` +
    `Halo kak {{customerName}},\n` +
    `Mengingatkan untuk invoice *{{invoiceNumber}}* ({{eventLabel}}).\n\n` +
    `Total Bill: {{totalBill}}\n` +
    `Remaining: {{outstandingAmount}}{{depositLine}}\n\n` +
    `Invoice melewati jatuh tempo ({{dueDate}}).{{linkSection}}\n\n` +
    `Salam hangat,\n` +
    `Tim WORTHTOBUY`,
  PAYMENT_CONFIRMATION:
    `📚🌱 *KONFIRMASI PEMBAYARAN — WORTHTOBUY*\n\n` +
    `Halo kak {{customerName}},\n` +
    `Mengenai pesanan invoice *{{invoiceNumber}}* ({{eventLabel}}):\n\n` +
    `Pembayaran *{{paidAmount}}* diverifikasi.{{depositLine}} Sisa: *{{outstandingAmount}}*.{{linkSection}}\n\n` +
    `Salam hangat,\n` +
    `Tim WORTHTOBUY`,
  UNAVAILABLE_ITEM:
    `📚🌱 *PEMBERITAHUAN BARANG KOSONG — WORTHTOBUY*\n\n` +
    `Halo kak {{customerName}},\n` +
    `Mengenai pesanan pada invoice *{{invoiceNumber}}* ({{eventLabel}}):\n\n` +
    `Item berikut tidak tersedia di event:{{itemLines}}\n\n` +
    `Hubungi admin untuk opsi refund atau pengganti.{{linkSection}}\n\n` +
    `Salam hangat,\n` +
    `Tim WORTHTOBUY`,
  READY_TO_SHIP:
    `📚🌱 *PESANAN SIAP KIRIM — WORTHTOBUY*\n\n` +
    `Halo kak {{customerName}},\n` +
    `Mengenai pesanan pada invoice *{{invoiceNumber}}* ({{eventLabel}}):\n\n` +
    `Pesanan selesai dipacking dan siap dikirim:{{itemLines}}{{linkSection}}\n\n` +
    `Salam hangat,\n` +
    `Tim WORTHTOBUY`,
  TRACKING:
    `📚🌱 *INFO PENGIRIMAN & RESI — WORTHTOBUY*\n\n` +
    `Halo kak {{customerName}},\n` +
    `Mengenai pesanan pada invoice *{{invoiceNumber}}* ({{eventLabel}}):\n\n` +
    `Pesanan diserahkan ke kurir{{shipmentInfo}}.{{linkSection}}\n\n` +
    `Salam hangat,\n` +
    `Tim WORTHTOBUY`,
};

export function renderInvoiceWhatsappTemplate({
  template,
  invoice,
  templateType = 'BILLING',
  billingModel = 'FLEXIBLE',
  eventValue = 'ALL',
}: {
  template?: string;
  invoice: any;
  templateType?: string;
  billingModel?: string;
  eventValue?: string;
}): string {
  const effectiveTemplate =
    (template && template.trim()) ||
    (billingModel === 'DP' && templateType === 'BILLING'
      ? DEFAULT_WHATSAPP_TEMPLATES.DP
      : DEFAULT_WHATSAPP_TEMPLATES[templateType] || DEFAULT_WHATSAPP_TEMPLATES.BILLING);

  const eventCodes = [
    ...new Set<string>(
      (invoice?.orders || [])
        .map((link: any) => String(link.order?.period?.code || ''))
        .filter(Boolean)
    ),
  ];
  const customerName =
    invoice?.customer?.fullName || invoice?.customer?.full_name || 'Customer';
  const invoiceNum =
    invoice?.invoice_number ||
    invoice?.invoiceNumber ||
    (invoice?.id ? String(invoice.id) : '-');
  const eventLabel = eventValue === 'ALL' ? eventCodes.join(', ') || 'event' : eventValue;
  const totalBill = Number(invoice?.totalBill ?? invoice?.total_bill ?? 0);
  const paidAmount = Number(invoice?.paidAmount ?? invoice?.paid_amount ?? 0);
  const outstandingAmount = Number(
    invoice?.outstandingAmount ?? invoice?.outstanding_amount ?? 0
  );

  const orderItems = (invoice?.orders || []).flatMap((link: any) =>
    (link.order?.items || []).map((item: any) => ({
      ...item,
      orderNumber: link.order?.orderNumber || link.order?.order_number,
    }))
  );
  const unavailable = orderItems.filter((i: any) => i.fulfillmentStatus === 'UNAVAILABLE');
  const ready = orderItems.filter((i: any) =>
    ['READY_TO_SHIP', 'SHIPPED', 'DELIVERED'].includes(i.fulfillmentStatus)
  );

  const shipment = (invoice?.orders || [])
    .flatMap((link: any) =>
      (link.order?.shipments || []).map((s: any) => ({
        ...s,
        orderNumber: link.order?.orderNumber || link.order?.order_number,
      }))
    )
    .sort(
      (a: any, b: any) =>
        new Date(b.shippedAt || b.updatedAt || b.createdAt || 0).getTime() -
        new Date(a.shippedAt || a.updatedAt || a.createdAt || 0).getTime()
    )[0];

  const itemLabel = (item: any) =>
    item.product?.name || item.manualProductName || 'Ordered item';
  const itemLines = (items: any[]) =>
    items.length
      ? '\n\n' +
        items
          .slice(0, 10)
          .map((i: any) => `• ${itemLabel(i)}${i.orderNumber ? ` (${i.orderNumber})` : ''}`)
          .join('\n')
      : '';
  const dueDateLabel =
    invoice?.dueDate || invoice?.due_date
      ? date(invoice.dueDate || invoice.due_date)
      : 'due date';

  const dpPercentVal = Number(invoice?.dpPercent ?? invoice?.dp_percent ?? 50);
  const dpTarget = Number(
    invoice?.dpAmount ??
      invoice?.dp_amount ??
      Math.round((totalBill * dpPercentVal) / 100)
  );
  const depositUsed = Number(invoice?.depositAmount ?? invoice?.deposit_amount ?? 0);
  const remainingAfterDp = Math.max(0, totalBill - dpTarget - depositUsed);
  const settlementNote =
    invoice?.dpSettlementNote ||
    invoice?.dp_settlement_note ||
    'saat produk siap kirim';
  const depositLine = depositUsed > 0 ? `\n*Potongan Deposit:* -${money(depositUsed)}` : '';

  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://worthtobuy.id';
  const publicUrl = invoiceNum !== '-' ? `${origin}/invoice/${invoiceNum}` : '';
  const linkSection = publicUrl
    ? `\n\n🔗 *Link Invoice & Upload Bukti Transfer:*\n${publicUrl}\n` +
      `_(Klik link di atas untuk melihat rincian item, nomor rekening, dan upload bukti transfer)_`
    : '';

  const shipmentInfoStr =
    (shipment?.courier ? ` (${shipment.courier})` : '') +
    '.' +
    (shipment?.trackingNumber ? `\nNo. Resi: *${shipment.trackingNumber}*` : '') +
    (shipment?.orderNumber ? `\nPesanan: ${shipment.orderNumber}` : '');

  const dynamicValues: Record<string, string> = {
    customerName,
    namaPelanggan: customerName,
    nama_pelanggan: customerName,

    invoiceNumber: invoiceNum,
    noInvoice: invoiceNum,
    no_invoice: invoiceNum,

    eventLabel,
    namaEvent: eventLabel,
    event: eventLabel,

    totalBill: money(totalBill),
    totalTagihan: money(totalBill),
    total: money(totalBill),

    paidAmount: money(paidAmount),
    sudahDibayar: money(paidAmount),
    terbayar: money(paidAmount),

    outstandingAmount: money(outstandingAmount),
    sisaTagihan: money(outstandingAmount),
    sisa: money(outstandingAmount),

    dueDate: dueDateLabel,
    jatuhTempo: dueDateLabel,
    tanggalJatuhTempo: dueDateLabel,

    dpAmount: money(dpTarget),
    nominalDp: money(dpTarget),
    dp: money(dpTarget),

    dpPercent: `${dpPercentVal}`,
    persenDp: `${dpPercentVal}`,

    remainingAfterDp: money(remainingAfterDp),
    sisaSetelahDp: money(remainingAfterDp),

    settlementNote,
    catatanPelunasan: settlementNote,

    depositLine,
    potonganDeposit: depositLine,

    itemLines: itemLines(templateType === 'UNAVAILABLE_ITEM' ? unavailable : ready),
    daftarItem: itemLines(templateType === 'UNAVAILABLE_ITEM' ? unavailable : ready),

    shipmentInfo: shipmentInfoStr,
    infoEkspedisi: shipmentInfoStr,
    resi: shipmentInfoStr,

    linkSection,
    linkInvoice: linkSection,
    portalLink: linkSection,

    publicInvoiceUrl: publicUrl,
    invoiceUrl: publicUrl,
  };

  return effectiveTemplate.replace(
    /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
    (match, key) => {
      if (Object.prototype.hasOwnProperty.call(dynamicValues, key)) {
        return dynamicValues[key];
      }
      return match;
    }
  );
}

// Backwards-compatible wrapper
export function createInvoiceWhatsappTemplate({
  invoice,
  templateType = 'BILLING',
  billingModel = 'FLEXIBLE',
  eventValue = 'ALL',
}: {
  invoice: any;
  templateType?: string;
  billingModel?: string;
  eventValue?: string;
}): string {
  return renderInvoiceWhatsappTemplate({
    template: undefined,
    invoice,
    templateType,
    billingModel,
    eventValue,
  });
}
