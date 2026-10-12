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
  items: LabelItem[];
  notes?: string | null;
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
       body { margin: 0; padding: 4mm; width: 92mm;
         font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
       .label-sheet { width: 92mm; height: 142mm; page-break-after: always;
         box-sizing: border-box; overflow: hidden; display: flex; flex-direction: column; }`
    : `@page { size: A4 portrait; margin: 15mm; }
       body { margin: 0;
         font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
       .label-sheet { width: 100%; max-width: 180mm; margin: 0 auto 15mm auto;
         page-break-after: always; border: 2px dashed #333;
         padding: 8mm; box-sizing: border-box; }`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Shipping Labels - Worthtobuy</title>
        <style>
          ${pageCss}
          * { box-sizing: border-box; }
          .header { border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 6px;
            display: flex; justify-content: space-between; align-items: flex-end; }
          .brand { font-size: 16px; font-weight: 900; letter-spacing: -0.5px; }
          .badge { font-size: 11px; font-weight: bold; background: #000; color: #fff;
            padding: 2px 6px; border-radius: 4px; }
          .meta-row { display: flex; justify-content: space-between; font-size: 10px;
            margin-bottom: 6px; color: #333; }
          .box { border: 1.5px solid #000; border-radius: 4px; padding: 6px; margin-bottom: 6px; }
          .box-title { font-size: 9px; font-weight: bold; text-transform: uppercase;
            color: #666; margin-bottom: 2px; }
          .recipient-name { font-size: 13px; font-weight: 800; }
          .recipient-phone { font-size: 11px; font-weight: 700; color: #222; }
          .recipient-address { font-size: 10px; line-height: 1.3; margin-top: 3px; }
          .sender-info { font-size: 9px; line-height: 1.2; color: #444; }
          .items-title { font-size: 10px; font-weight: bold; margin-bottom: 4px;
            border-bottom: 1px solid #ccc; padding-bottom: 2px; }
          table { width: 100%; border-collapse: collapse; font-size: 9.5px; }
          th { text-align: left; border-bottom: 1px solid #000; padding: 2px 0;
            font-size: 8.5px; text-transform: uppercase; }
          td { padding: 3px 0; border-bottom: 1px dotted #ccc; vertical-align: top; }
          .qty-col { text-align: center; width: 35px; font-weight: bold; }
          .footer { margin-top: auto; border-top: 1px solid #000; padding-top: 4px;
            display: flex; justify-content: space-between; font-size: 9px; font-weight: bold; }
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

            <div class="box">
              <div class="box-title">Penerima / Recipient</div>
              <div class="recipient-name">${sheet.recipientName}</div>
              <div class="recipient-phone">${sheet.recipientPhone}</div>
              <div class="recipient-address">${sheet.recipientAddress}</div>
            </div>

            <div class="box" style="padding: 4px 6px;">
              <div class="box-title">Pengirim / Sender</div>
              <div class="sender-info">
                <strong>${sheet.senderName}</strong> • ${sheet.senderPhone} (Jakarta)
              </div>
            </div>

            <div style="flex: 1; overflow: hidden; margin-bottom: 4px;">
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
                ? `<div style="font-size: 8.5px; color: #555; margin-bottom: 4px;">` +
                  `<strong>Catatan:</strong> ${sheet.notes}</div>`
                : ''
            }

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
