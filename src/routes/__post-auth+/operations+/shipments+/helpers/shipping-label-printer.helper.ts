export interface LabelItem {
  name: string;
  variant?: string | null;
  size?: string | null;
  color?: string | null;
  quantity: number;
}

export interface ShippingLabelSheet {
  sheetIndex: number;
  totalSheets: number;
  orderNumber: string;
  shipmentId: number;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  senderName: string;
  senderPhone: string;
  courier?: string | null;
  serviceType?: string | null;
  items: LabelItem[];
  notes?: string | null;
  isShopee?: boolean;
}

export function printShippingLabels(
  sheets: ShippingLabelSheet[],
  format: '10x15' | 'A4'
) {
  const isThermal = format === '10x15';
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) return;

  const pageCss = isThermal
    ? `@page { size: 100mm 150mm; margin: 0; }
       html, body { margin: 0; padding: 0; width: 100mm; height: 150mm; max-height: 150mm;
         font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
         background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
       .label-sheet { width: 100mm; height: 150mm; max-height: 150mm; padding: 3.5mm 4mm;
         box-sizing: border-box; overflow: hidden; display: flex; flex-direction: column;
         page-break-after: always; page-break-inside: avoid; }`
    : `@page { size: A4 portrait; margin: 15mm; }
       html, body { margin: 0; padding: 0;
         font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
         -webkit-print-color-adjust: exact; print-color-adjust: exact; }
       .label-sheet { width: 100%; max-width: 180mm; margin: 0 auto 15mm auto;
         page-break-after: always; page-break-inside: avoid; border: 2px dashed #333;
         padding: 8mm; box-sizing: border-box; display: flex; flex-direction: column; }`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Shipping Labels - Worthtobuy</title>
        <style>
          ${pageCss}
          * { box-sizing: border-box; }
          .header { border-bottom: 2px solid #000; padding-bottom: 2px; margin-bottom: 4px;
            display: flex; justify-content: space-between; align-items: flex-end; }
          .brand { font-size: 14px; font-weight: 900; letter-spacing: -0.5px; }
          .badge { font-size: 9.5px; font-weight: bold; background: #000; color: #fff;
            padding: 1.5px 5px; border-radius: 3px; }
          .meta-row { display: flex; justify-content: space-between; font-size: 9px;
            margin-bottom: 4px; color: #333; }
          
          .courier-box {
            border: 1.5px solid #000; border-radius: 4px; padding: 2.5px 6px; margin-bottom: 4px;
            background: #f8fafc; display: flex; justify-content: space-between; align-items: center;
          }
          .courier-label { font-size: 8px; font-weight: 800; text-transform: uppercase; color: #475569; }
          .courier-name { font-size: 11px; font-weight: 900; color: #000; letter-spacing: 0.3px; }

          .box { border: 1.5px solid #000; border-radius: 4px; padding: 3.5px 5px; margin-bottom: 4px; }
          .box-title { font-size: 8px; font-weight: bold; text-transform: uppercase;
            color: #666; margin-bottom: 1px; }
          .recipient-name { font-size: 11px; font-weight: 800; }
          .recipient-phone { font-size: 10px; font-weight: 700; color: #222; }
          .recipient-address { font-size: 9px; line-height: 1.2; margin-top: 2px; }
          .sender-info { font-size: 8px; line-height: 1.2; color: #444; }
          .items-title { font-size: 9px; font-weight: bold; margin-bottom: 2px;
            border-bottom: 1px solid #ccc; padding-bottom: 1px; }
          table { width: 100%; border-collapse: collapse; font-size: 8.5px; }
          th { text-align: left; border-bottom: 1px solid #000; padding: 1.5px 0;
            font-size: 7.5px; text-transform: uppercase; }
          td { padding: 2px 0; border-bottom: 1px dotted #ccc; vertical-align: top; }
          .qty-col { text-align: center; width: 28px; font-weight: bold; }

          .unboxing-warning {
            border: 1.5px solid #000; border-radius: 4px; padding: 3.5px 4px;
            text-align: center; background: #fff; margin-top: auto; margin-bottom: 3px;
          }
          .unboxing-title {
            font-size: 7.5px; font-weight: 900; color: #000; margin-bottom: 1.5px; line-height: 1.2;
          }
          .unboxing-desc {
            font-size: 6.8px; font-weight: 600; color: #111; line-height: 1.25;
          }

          .footer { border-top: 1px solid #000; padding-top: 2px;
            display: flex; justify-content: space-between; font-size: 7.5px; font-weight: bold; }
        </style>
      </head>
      <body>
        ${sheets
          .map(
            (sheet) => `
          <div class="label-sheet">
            <div class="header">
              <div class="brand">WORTHTOBUY</div>
              <div class="badge">LABEL ${sheet.sheetIndex} / ${sheet.totalSheets}</div>
            </div>
            <div class="meta-row">
              <span>Order: <strong>${sheet.orderNumber}</strong></span>
              <span>Shipment: <strong>#${sheet.shipmentId}</strong></span>
            </div>

            ${
              sheet.isShopee
                ? `
            <div class="courier-box" style="background: #fff7ed; border-color: #ea580c;">
              <span class="courier-label" style="color: #c2410c;">METODE PENGIRIMAN:</span>
              <span class="courier-name" style="color: #ea580c;">CHECKOUT SHOPEE (PACKING LIST)</span>
            </div>
            `
                : `
            <div class="courier-box">
              <span class="courier-label">EKSPEDISI / KURIR:</span>
              <span class="courier-name">${sheet.courier || 'JNE'}${
                    sheet.serviceType ? ` • ${sheet.serviceType}` : ''
                  }</span>
            </div>

            <div class="box">
              <div class="box-title">Penerima / Recipient</div>
              <div class="recipient-name">${sheet.recipientName}</div>
              <div class="recipient-phone">${sheet.recipientPhone}</div>
              <div class="recipient-address">${sheet.recipientAddress}</div>
            </div>

            <div class="box" style="padding: 3px 6px;">
              <div class="box-title">Pengirim / Sender</div>
              <div class="sender-info">
                <strong>${sheet.senderName}</strong> • ${sheet.senderPhone} (Jakarta)
              </div>
            </div>
            `
            }

            <div style="flex: 1; overflow: hidden; margin-bottom: 3px;">
              <div class="items-title">
                Detail Barang (${sheet.items.reduce((s, i) => s + i.quantity, 0)} pcs)
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Varian / Size</th>
                    <th class="qty-col">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  ${sheet.items
                    .map((item) => {
                      const desc =
                        [item.variant, item.size, item.color].filter(Boolean).join(' • ') || '-';
                      return `
                    <tr>
                      <td><strong>${item.name}</strong></td>
                      <td>${desc}</td>
                      <td class="qty-col">${item.quantity}</td>
                    </tr>
                  `;
                    })
                    .join('')}
                </tbody>
              </table>
            </div>

            ${
              sheet.notes
                ? `<div style="font-size: 8px; color: #555; margin-bottom: 3px;">` +
                  `<strong>Catatan:</strong> ${sheet.notes}</div>`
                : ''
            }

            <!-- Wajib Video Unboxing Footer Warning -->
            <div class="unboxing-warning">
              <div class="unboxing-title"><u>WAJIB VIDEO UNBOXING. TIDAK TERIMA COMPLAIN TANPA VIDEO UNBOXING.</u></div>
              <div class="unboxing-desc">
                Rekam jelas proses sebelum membuka paket hingga kelihatan barang yang diterima. Video tidak putus-putus (no edit).<br/>
                Max complain 1x24 jam setelah barang diterima.<br/>
                Terimakasih atas ordernya. Ditunggu next ordernya yaa ❤️
              </div>
            </div>

            <div class="footer">
              <span>WORTH TO BUY JASTIP SERVICE</span>
              <span>${sheet.sheetIndex} OF ${sheet.totalSheets}</span>
            </div>
          </div>
        `
          )
          .join('')}
      </body>
    </html>
  `;

  doc.open();
  doc.write(htmlContent);
  doc.close();

  iframe.contentWindow?.focus();
  setTimeout(() => {
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 250);
}
