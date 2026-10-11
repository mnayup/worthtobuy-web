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
      (invoice?.orders || []).map((link: any) => String(link.order?.period?.code || '')).filter(Boolean)
    ),
  ];
  const customerName =
    invoice?.customer?.fullName || invoice?.customer?.full_name || 'Customer';
  const invoiceNum = invoice?.invoiceNumber || invoice?.invoice_number || '-';
  const eventLabel = eventValue === 'ALL' ? eventCodes.join(', ') || 'event' : eventValue;
  const totalBill = Number(invoice?.totalBill ?? invoice?.total_bill ?? 0);
  const paidAmount = Number(invoice?.paidAmount ?? invoice?.paid_amount ?? 0);
  const outstandingAmount = Number(
    invoice?.outstandingAmount ?? invoice?.outstanding_amount ?? 0
  );
  const base = `Hello ${customerName}, here is the invoice update for *${invoiceNum}* (${eventLabel}).`;
  const amount =
    `\n\nTotal Bill: ${money(totalBill)}\nAmount Paid: ${money(paidAmount)}` +
    `\nRemaining Balance: ${money(outstandingAmount)}`;

  const instructions: Record<string, string> = {
    DP: '\n\nPlease proceed with the down payment (DP) as agreed so your order can be purchased.',
    INSTALLMENT: '\n\nPayments may be completed in installments. Each transaction will be logged in your invoice statement.',
    SETTLEMENT: '\n\nPlease settle the remaining balance so we can proceed with dispatch and delivery.',
    FULL_PAYMENT: '\n\nPlease proceed with the full invoice payment.',
    FLEXIBLE: '\n\nPlease proceed with payment according to our agreed arrangement.',
  };

  const orderItems = (invoice?.orders || []).flatMap((link: any) =>
    (link.order?.items || []).map((item: any) => ({
      ...item,
      orderNumber: link.order?.orderNumber || link.order?.order_number,
    }))
  );
  const unavailable = orderItems.filter((item: any) => item.fulfillmentStatus === 'UNAVAILABLE');
  const ready = orderItems.filter((item: any) =>
    ['READY_TO_SHIP', 'SHIPPED', 'DELIVERED'].includes(item.fulfillmentStatus)
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

  const itemLabel = (item: any) => item.product?.name || item.manualProductName || 'Ordered item';
  const itemLines = (items: any[]) =>
    items.length
      ? `\n\n${items.slice(0, 10).map((item: any) => `• ${itemLabel(item)}${item.orderNumber ? ` (${item.orderNumber})` : ''}`).join('\n')}`
      : '';
  const dueDateLabel = invoice?.dueDate || invoice?.due_date ? date(invoice.dueDate || invoice.due_date) : 'due date';

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

  const templates: Record<string, string> = {
    BILLING:
      billingModel === 'DP'
        ? `📚🌱 *INVOICE WORTHTOBUY* (DP)\n\nHalo kak ${customerName},\nTerima kasih sudah memesan di WORTHTOBUY! Pesanan kakak (${eventLabel}) sudah kami catat.\n\nNo. Invoice: ${invoiceNum}\nTotal pesanan: ${money(totalBill)}${depositLine}\n*Dibayar sekarang (DP): ${money(dpTarget)}* (${dpPercentVal}%)\nSisa ${money(remainingAfterDp)} dilunasi ${settlementNote}.\n\n💳 Pembayaran transfer bank.\nSetelah transfer DP, mohon kirimkan buktinya ya kak. Nanti kami kabari lagi saat pesanan siap untuk pelunasan 🌱`
        : `📚🌱 *INVOICE WORTHTOBUY*\n\nHalo kak ${customerName},\nTerima kasih sudah memesan di WORTHTOBUY! Pesanan kakak (${eventLabel}) sudah kami catat.\n\nNo. Invoice: ${invoiceNum}\nTotal tagihan: *${money(totalBill)}*${depositLine}\n*Sisa yang harus dibayar:* *${money(outstandingAmount)}*\nJatuh tempo: ${dueDateLabel}\n\n💳 Pembayaran transfer bank.\nMohon lakukan pembayaran agar pesanan dapat segera kami proses saat event belanja. Setelah transfer, silakan kirimkan bukti pembayarannya ya kak. Terima kasih! 🙏`,
    DP: `📚🌱 *INVOICE WORTHTOBUY* (DP)\n\nHalo kak ${customerName},\nTerima kasih sudah memesan di WORTHTOBUY! Pesanan kakak (${eventLabel}) sudah kami catat.\n\nNo. Invoice: ${invoiceNum}\nTotal pesanan: ${money(totalBill)}${depositLine}\n*Dibayar sekarang (DP): ${money(dpTarget)}* (${dpPercentVal}%)\nSisa ${money(remainingAfterDp)} dilunasi ${settlementNote}.\n\n💳 Pembayaran transfer bank.\nSetelah transfer DP, mohon kirimkan buktinya ya kak. Nanti kami kabari lagi saat pesanan siap untuk pelunasan 🌱`,
    SETTLEMENT: `📚🌱 *PELUNASAN — WORTHTOBUY*\n\nHalo kak ${customerName},\nKabar baik! Pesanan kakak (${eventLabel}) sudah siap, tinggal pelunasan ya.\n\nNo. Invoice: ${invoiceNum}\nTotal pesanan: ${money(totalBill)}${depositLine}\nSudah dibayar (DP): ${money(paidAmount)}\n*Sisa yang perlu dilunasi: ${money(outstandingAmount)}*\n\n💳 Pembayaran transfer bank.\nSetelah transfer, mohon kirimkan bukti pelunasannya ya kak agar paket segera kami kirimkan. Terima kasih sudah menunggu ya kak 🌱`,
    FULL_PAYMENT: `📚🌱 *INVOICE LUNAS — WORTHTOBUY*\n\nHalo kak ${customerName},\nPembayaran untuk invoice *${invoiceNum}* sebesar *${money(totalBill)}*${depositLine} telah kami terima dan dinyatakan *LUNAS*.\n\nTerima kasih banyak sudah mempercayakan pesanan kakak di WORTHTOBUY! 🙏`,
    OVERDUE: `${base}${amount}${depositLine}\n\nInvoice kakak sudah melewati batas jatuh tempo (${dueDateLabel}). Mohon konfirmasi atau lakukan pelunasan agar pesanan dapat kami proses lebih lanjut. Terima kasih! 🙏`,
    PAYMENT_CONFIRMATION: `${base}\n\nPembayaran sebesar *${money(paidAmount)}* telah kami terima dan diverifikasi.${depositLine} Sisa tagihan saat ini: *${money(outstandingAmount)}*. Terima kasih!`,
    UNAVAILABLE_ITEM: `${base}\n\nMohon maaf, kami ingin menginformasikan bahwa item berikut tidak tersedia saat belanja di event:${itemLines(unavailable)}\n\nTim concierge kami siap membantu opsi barang pengganti atau pengembalian dana (refund) penuh.`,
    READY_TO_SHIP: `${base}\n\nItem pesanan kakak sudah selesai dipacking dan siap dikirimkan:${itemLines(ready)}\n\nMohon pastikan alamat penerima sudah sesuai. Terima kasih!`,
    TRACKING: `${base}\n\nPesanan kakak telah diserahkan ke kurir${shipment?.courier ? ` (${shipment.courier})` : ''}.${shipment?.trackingNumber ? `\nNo. Resi: *${shipment.trackingNumber}*` : '\nNomor resi akan segera diperbarui setelah diberikan pihak ekspedisi.'}${shipment?.orderNumber ? `\nPesanan: ${shipment.orderNumber}` : ''}`,
  };

  return `${templates[templateType] || templates.BILLING}\n\nSalam hangat,\nTim WORTHTOBUY`;
}
