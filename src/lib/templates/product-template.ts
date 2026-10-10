import XLSX from 'xlsx-js-style';
import { applyRowStyles, styleSheetHeaderBanner, styleTutorialSheet } from './template-styles';

export function buildProductsWorkbook(
  wb: any,
  activeEvents: Array<{ code: string; name: string; city?: string }>
) {
  const sampleEventCode = activeEvents.length > 0 ? activeEvents[0].code : 'EVT-NOV26-1234';

  const headers = [
    '* Product Name',
    '* Product Type (EVENT / READY_STOCK)',
    'Event Code or Name (*If Type EVENT)',
    'Product SKU',
    'Category',
    'Brand',
    'Store Location / Tenant',
    'Warehouse Physical Stock (*If READY_STOCK)',
    'Buy Price (IDR)',
    'Sell Price (IDR)',
    'Low Stock Alert Minimum',
    'Product Web Link',
    'Product Photo URL',
    'Product Notes',
  ];

  const samples = [
    [
      'Gentle Woman Canvas Tote Bag Large',
      'EVENT',
      sampleEventCode,
      '',
      'Bags & Fashion',
      'Gentle Woman',
      'Siam Square One Bangkok',
      0,
      320000,
      480000,
      3,
      'https://gentlewomanonline.com',
      'https://images.unsplash.com/photo-1544816155-12df9643f363',
      'Warna Broken White, print hitam bold',
    ],
    [
      'Tokyo Banana Original Cream 8pcs',
      'READY_STOCK',
      '',
      'SKU-TB-08PC',
      'Snack & Food',
      'Tokyo Banana',
      'Tokyo Station Daimaru',
      30,
      140000,
      220000,
      5,
      '',
      '',
      'Batch impor terbaru, simpan di tempat sejuk',
    ],
    [
      'Biore UV Aqua Rich Watery Essence SPF50+ 50g',
      'READY_STOCK',
      '',
      '',
      'Beauty & Skincare',
      'Biore',
      'Don Quijote Shinjuku',
      50,
      75000,
      135000,
      10,
      '',
      '',
      'Produk jepang original, expiry 2028',
    ],
  ];

  const wsData = XLSX.utils.aoa_to_sheet([
    ['EXCEL UPLOAD TEMPLATE - PRODUCT CATALOG & STOCK', ...Array(headers.length - 1).fill(null)],
    [
      'Module: Master Data Products | Starts row 4 | DO NOT CHANGE ROW 3 HEADERS',
      ...Array(headers.length - 1).fill(null),
    ],
    headers,
    ...samples,
  ]);

  wsData['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: headers.length - 1 } },
  ];

  styleSheetHeaderBanner(wsData, headers.length);
  applyRowStyles(wsData, 4, 4 + samples.length - 1, headers.length);

  wsData['!cols'] = [
    { wch: 35 },
    { wch: 22 },
    { wch: 30 },
    { wch: 18 },
    { wch: 20 },
    { wch: 20 },
    { wch: 25 },
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 30 },
    { wch: 30 },
    { wch: 35 },
  ];
  XLSX.utils.book_append_sheet(wb, wsData, 'Template Upload');

  const tutorialData: any[][] = [
    ['INSTRUCTIONS FOR FILLING PRODUCT DATA UPLOAD TEMPLATE'],
    ["Module: Products & Catalog | Data sheet: 'Template Upload'"],
    ['1. HOW TO USE'],
    [
      1,
      "Fill data starting from row 4 (rows 1 & 2 titles, row 3 header — DO NOT alter/delete).",
    ],
    [
      2,
      "PRODUCT TYPE: 'EVENT' for scheduled trips, or 'READY_STOCK' for warehouse stock.",
    ],
    [
      3,
      "PRICE INPUT: Raw numbers without currency symbols (e.g., 150000, not 150,000).",
    ],
    [4, 'SKU: Can be blank. If blank, system auto-generates a unique SKU.'],
    [
      5,
      'The system will show a preview before saving. Please check INVALID rows.',
    ],
    ['2. COLUMN EXPLANATIONS'],
    ['No', 'Column', 'Required?', 'Format', 'Description'],
    ['1', 'Product Name', 'Yes', 'Text', 'Product name (minimum 2 characters).'],
    ['2', 'Product Type', 'Yes', 'Enum', 'Choose EVENT or READY_STOCK.'],
    [
      '3',
      'Kode atau Event Name',
      'Required if EVENT',
      'Text/Kode',
      `Required if Type = EVENT. Event Code (e.g. ${sampleEventCode}) or Name.`,
    ],
    ['4', 'Product SKU', 'No', 'Text Unik', 'Leave blank to auto-generate SKU.'],
    ['5', 'Category', 'No', 'Text', 'Fashion, Beauty, Snack, Food, Electronics, etc.'],
    ['6', 'Brand', 'No', 'Text', 'Brand name (e.g., Gentle Woman, Uniqlo).'],
    ['7', 'Store Location / Tenant', 'No', 'Text', 'Store/tenant location name.'],
    ['8', 'Stok Fisik Gudang', 'Required if READY_STOCK', 'Number', 'Physical warehouse stock.'],
    ['9', 'Buy Price (IDR)', 'No', 'Number IDR', 'Buy price in IDR without Rp/commas.'],
    ['10', 'Sell Price (IDR)', 'No', 'Number IDR', 'Sell price in IDR without Rp/commas.'],
    ['11', 'Low Stock Alert Minimum', 'No', 'Number', 'Low stock alert threshold (default 3).'],
    ['12', 'Product Web Link', 'No', 'URL', 'Official web link (https://...).'],
    ['13', 'Product Photo URL', 'No', 'Image URL', 'Direct photo link (https://...).'],
    ['14', 'Product Notes', 'No', 'Text', 'Variant, size, shade, or expiration date notes.'],
    ['3. FILLING EXAMPLES'],
    headers,
    ...samples,
    ['Note: examples are illustrations. Event Codes must match registered events.'],
  ];

  if (activeEvents.length > 0) {
    tutorialData.push(['CURRENT ACTIVE EVENT CODES (CAN BE COPIED/PASTED):']);
    tutorialData.push(['Event Code', 'Event Name', 'City Tujuan', '', '']);
    activeEvents.forEach((ev) => {
      tutorialData.push([ev.code, ev.name, ev.city || '-', '', '']);
    });
  }

  tutorialData.push(['4. IMPORTANT NOTES']);
  tutorialData.push([1, "Do not change titles (rows 1-2) or header names (row 3)."]);
  tutorialData.push([2, "Do not add new columns to the 'Template Upload' sheet."]);
  tutorialData.push([3, "Products with Type 'EVENT' MUST have a valid matching Event Code."]);
  tutorialData.push([4, 'If any rows are INVALID, correct data in Excel and re-upload.']);

  const wsTutorial = XLSX.utils.aoa_to_sheet(tutorialData);

  wsTutorial['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
    { s: { r: 3, c: 1 }, e: { r: 3, c: 5 } },
    { s: { r: 4, c: 1 }, e: { r: 4, c: 5 } },
    { s: { r: 5, c: 1 }, e: { r: 5, c: 5 } },
    { s: { r: 6, c: 1 }, e: { r: 6, c: 5 } },
    { s: { r: 7, c: 1 }, e: { r: 7, c: 5 } },
    { s: { r: 8, c: 0 }, e: { r: 8, c: 5 } },
    { s: { r: 24, c: 0 }, e: { r: 24, c: 5 } },
  ];

  styleTutorialSheet(wsTutorial, 25, headers.length);
  wsTutorial['!cols'] = [
    { wch: 18 },
    { wch: 30 },
    { wch: 20 },
    { wch: 22 },
    { wch: 55 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsTutorial, 'Instructions');
}
