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
  const customerName = invoice?.customer?.fullName || 'Customer';
  const eventLabel = eventValue === 'ALL' ? eventCodes.join(', ') || 'event' : eventValue;
  const base = `Hello ${customerName}, here is the invoice update for *${invoice?.invoiceNumber}* (${eventLabel}).`;
  const amount = `\n\nTotal Bill: ${money(invoice?.totalBill)}\nAmount Paid: ${money(invoice?.paidAmount)}\nRemaining Balance: ${money(invoice?.outstandingAmount)}`;

  const instructions: Record<string, string> = {
    DP: '\n\nPlease proceed with the down payment (DP) as agreed so your order can be purchased.',
    INSTALLMENT: '\n\nPayments may be completed in installments. Each transaction will be logged in your invoice statement.',
    SETTLEMENT: '\n\nPlease settle the remaining balance so we can proceed with dispatch and delivery.',
    FULL_PAYMENT: '\n\nPlease proceed with the full invoice payment.',
    FLEXIBLE: '\n\nPlease proceed with payment according to our agreed arrangement.',
  };

  const orderItems = (invoice?.orders || []).flatMap((link: any) =>
    (link.order?.items || []).map((item: any) => ({ ...item, orderNumber: link.order?.orderNumber }))
  );
  const unavailable = orderItems.filter((item: any) => item.fulfillmentStatus === 'UNAVAILABLE');
  const ready = orderItems.filter((item: any) =>
    ['READY_TO_SHIP', 'SHIPPED', 'DELIVERED'].includes(item.fulfillmentStatus)
  );

  const shipment = (invoice?.orders || [])
    .flatMap((link: any) =>
      (link.order?.shipments || []).map((s: any) => ({ ...s, orderNumber: link.order?.orderNumber }))
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
  const dueDateLabel = invoice?.dueDate ? date(invoice.dueDate) : 'due date';

  const dpTarget = Number(invoice?.dpAmount || Math.round(Number(invoice?.totalBill || 0) * 0.5));
  const depositUsed = Number(invoice?.depositAmount || 0);
  const remainingAfterDp = Math.max(0, Number(invoice?.totalBill || 0) - dpTarget - depositUsed);
  const settlementNote = invoice?.dpSettlementNote || 'saat produk siap kirim';
  const depositLine = depositUsed > 0 ? `\n*Potongan Deposit:* -${money(depositUsed)}` : '';

  const templates: Record<string, string> = {
    BILLING:
      billingModel === 'DP'
        ? `📚🌱 *INVOICE WORTHTOBUY* (DP)\n\nHalo kak ${customerName},\nTerima kasih sudah memesan di WORTHTOBUY! Pesanan kakak (${eventLabel}) sudah kami catat.\n\nNo. Invoice: ${invoice?.invoiceNumber}\nTotal pesanan: ${money(invoice?.totalBill)}${depositLine}\n*Dibayar sekarang (DP): ${money(dpTarget)}* (${invoice?.dpPercent || 50}%)\nSisa ${money(remainingAfterDp)} dilunasi ${settlementNote}.\n\n💳 Pembayaran transfer bank.\nSetelah transfer DP, mohon kirimkan buktinya ya kak. Nanti kami kabari lagi saat pesanan siap untuk pelunasan 🌱`
        : `📚🌱 *INVOICE WORTHTOBUY*\n\nHalo kak ${customerName},\nTerima kasih sudah memesan di WORTHTOBUY! Pesanan kakak (${eventLabel}) sudah kami catat.\n\nNo. Invoice: ${invoice?.invoiceNumber}\nTotal tagihan: *${money(invoice?.totalBill)}*${depositLine}\n*Sisa yang harus dibayar:* *${money(invoice?.outstandingAmount)}*\nJatuh tempo: ${dueDateLabel}\n\n💳 Pembayaran transfer bank.\nMohon lakukan pembayaran agar pesanan dapat segera kami proses saat event belanja. Setelah transfer, silakan kirimkan bukti pembayarannya ya kak. Terima kasih! 🙏`,
    DP: `📚🌱 *INVOICE WORTHTOBUY* (DP)\n\nHalo kak ${customerName},\nTerima kasih sudah memesan di WORTHTOBUY! Pesanan kakak (${eventLabel}) sudah kami catat.\n\nNo. Invoice: ${invoice?.invoiceNumber}\nTotal pesanan: ${money(invoice?.totalBill)}${depositLine}\n*Dibayar sekarang (DP): ${money(dpTarget)}* (${invoice?.dpPercent || 50}%)\nSisa ${money(remainingAfterDp)} dilunasi ${settlementNote}.\n\n💳 Pembayaran transfer bank.\nSetelah transfer DP, mohon kirimkan buktinya ya kak. Nanti kami kabari lagi saat pesanan siap untuk pelunasan 🌱`,
    SETTLEMENT: `📚🌱 *PELUNASAN — WORTHTOBUY*\n\nHalo kak ${customerName},\nKabar baik! Pesanan kakak (${eventLabel}) sudah siap, tinggal pelunasan ya.\n\nNo. Invoice: ${invoice?.invoiceNumber}\nTotal pesanan: ${money(invoice?.totalBill)}${depositLine}\nSudah dibayar (DP): ${money(invoice?.paidAmount)}\n*Sisa yang perlu dilunasi: ${money(invoice?.outstandingAmount)}*\n\n💳 Pembayaran transfer bank.\nSetelah transfer, mohon kirimkan bukti pelunasannya ya kak agar paket segera kami kirimkan. Terima kasih sudah menunggu ya kak 🌱`,
    FULL_PAYMENT: `📚🌱 *INVOICE LUNAS — WORTHTOBUY*\n\nHalo kak ${customerName},\nPembayaran untuk invoice *${invoice?.invoiceNumber}* sebesar *${money(invoice?.totalBill)}*${depositLine} telah kami terima dan dinyatakan *LUNAS*.\n\nTerima kasih banyak sudah mempercayakan pesanan kakak di WORTHTOBUY! 🙏`,
    OVERDUE: `${base}${amount}${depositLine}\n\nInvoice kakak sudah melewati batas jatuh tempo (${dueDateLabel}). Mohon konfirmasi atau lakukan pelunasan agar pesanan dapat kami proses lebih lanjut. Terima kasih! 🙏`,
    PAYMENT_CONFIRMATION: `${base}\n\nPembayaran sebesar *${money(invoice?.paidAmount)}* telah kami terima dan diverifikasi.${depositLine} Sisa tagihan saat ini: *${money(invoice?.outstandingAmount)}*. Terima kasih!`,
    UNAVAILABLE_ITEM: `${base}\n\nMohon maaf, kami ingin menginformasikan bahwa item berikut tidak tersedia saat belanja di event:${itemLines(unavailable)}\n\nTim concierge kami siap membantu opsi barang pengganti atau pengembalian dana (refund) penuh.`,
    READY_TO_SHIP: `${base}\n\nItem pesanan kakak sudah selesai dipacking dan siap dikirimkan:${itemLines(ready)}\n\nMohon pastikan alamat penerima sudah sesuai. Terima kasih!`,
    TRACKING: `${base}\n\nPesanan kakak telah diserahkan ke kurir${shipment?.courier ? ` (${shipment.courier})` : ''}.${shipment?.trackingNumber ? `\nNo. Resi: *${shipment.trackingNumber}*` : '\nNomor resi akan segera diperbarui setelah diberikan pihak ekspedisi.'}${shipment?.orderNumber ? `\nPesanan: ${shipment.orderNumber}` : ''}`,
  };

  return `${templates[templateType] || templates.BILLING}\n\nSalam hangat,\nTim WORTHTOBUY`;
}
