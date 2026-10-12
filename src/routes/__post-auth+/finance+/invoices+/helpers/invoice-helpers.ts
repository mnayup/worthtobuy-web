import { date, money } from '~/lib/format';

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
  const base =
    `Hello ${customerName}, here is the invoice update for *${invoiceNum}* (${eventLabel}).`;

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
  const dueDateLabel = invoice?.dueDate || invoice?.due_date
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

  const dpMsg =
    `📚🌱 *INVOICE WORTHTOBUY* (DP)\n\n` +
    `Halo kak ${customerName},\n` +
    `Terima kasih sudah memesan di WORTHTOBUY! Pesanan (${eventLabel}) sudah kami catat.\n\n` +
    `No. Invoice: ${invoiceNum}\n` +
    `Total pesanan: ${money(totalBill)}${depositLine}\n` +
    `*Dibayar sekarang (DP): ${money(dpTarget)}* (${dpPercentVal}%)\n` +
    `Sisa ${money(remainingAfterDp)} dilunasi ${settlementNote}.\n\n` +
    `💳 Pembayaran transfer bank.\n` +
    `Setelah transfer DP, mohon kirimkan buktinya via link di bawah ini ya kak.${linkSection}`;

  const billingMsg =
    `📚🌱 *INVOICE WORTHTOBUY*\n\n` +
    `Halo kak ${customerName},\n` +
    `Terima kasih sudah memesan di WORTHTOBUY! Pesanan (${eventLabel}) sudah kami catat.\n\n` +
    `No. Invoice: ${invoiceNum}\n` +
    `Total tagihan: *${money(totalBill)}*${depositLine}\n` +
    `*Sisa yang harus dibayar:* *${money(outstandingAmount)}*\n` +
    `Jatuh tempo: ${dueDateLabel}\n\n` +
    `💳 Pembayaran transfer bank.\n` +
    `Setelah transfer, silakan upload bukti pembayaran lewat link di bawah ya kak.${linkSection}`;

  const settlementMsg =
    `📚🌱 *PELUNASAN — WORTHTOBUY*\n\n` +
    `Halo kak ${customerName},\n` +
    `Kabar baik! Pesanan kakak (${eventLabel}) sudah siap, tinggal pelunasan ya.\n\n` +
    `No. Invoice: ${invoiceNum}\n` +
    `Total pesanan: ${money(totalBill)}${depositLine}\n` +
    `Sudah dibayar (DP): ${money(paidAmount)}\n` +
    `*Sisa yang perlu dilunasi: ${money(outstandingAmount)}*\n\n` +
    `💳 Pembayaran transfer bank.\n` +
    `Setelah transfer, silakan upload bukti pelunasannya ya kak.${linkSection}`;

  const fullPaymentMsg =
    `📚🌱 *INVOICE LUNAS — WORTHTOBUY*\n\n` +
    `Halo kak ${customerName},\n` +
    `Pembayaran invoice *${invoiceNum}* sebesar *${money(totalBill)}*${depositLine} ` +
    `telah kami terima dan dinyatakan *LUNAS*.\n\n` +
    `Terima kasih banyak sudah mempercayakan pesanan kakak di WORTHTOBUY! 🙏${linkSection}`;

  const templates: Record<string, string> = {
    BILLING: billingModel === 'DP' ? dpMsg : billingMsg,
    DP: dpMsg,
    SETTLEMENT: settlementMsg,
    FULL_PAYMENT: fullPaymentMsg,
    OVERDUE:
      `${base}\n\nTotal Bill: ${money(totalBill)}\nRemaining: ${money(outstandingAmount)}` +
      `${depositLine}\n\nInvoice melewati jatuh tempo (${dueDateLabel}).${linkSection}`,
    PAYMENT_CONFIRMATION:
      `${base}\n\nPembayaran *${money(paidAmount)}* diverifikasi.${depositLine}` +
      ` Sisa: *${money(outstandingAmount)}*.${linkSection}`,
    UNAVAILABLE_ITEM:
      `${base}\n\nItem berikut tidak tersedia di event:${itemLines(unavailable)}` +
      `\n\nHubungi admin untuk opsi refund atau pengganti.${linkSection}`,
    READY_TO_SHIP:
      `${base}\n\nPesanan selesai dipacking dan siap dikirim:${itemLines(ready)}${linkSection}`,
    TRACKING:
      `${base}\n\nPesanan diserahkan ke kurir` +
      (shipment?.courier ? ` (${shipment.courier})` : '') +
      '.' +
      (shipment?.trackingNumber ? `\nNo. Resi: *${shipment.trackingNumber}*` : '') +
      (shipment?.orderNumber ? `\nPesanan: ${shipment.orderNumber}` : '') +
      `${linkSection}`,
  };

  return `${templates[templateType] || templates.BILLING}\n\nSalam hangat,\nTim WORTHTOBUY`;
}
