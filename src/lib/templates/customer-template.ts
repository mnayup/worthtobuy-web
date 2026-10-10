import XLSX from 'xlsx-js-style';
import { applyRowStyles, styleSheetHeaderBanner, styleTutorialSheet } from './template-styles';

export function buildCustomersWorkbook(wb: any) {
  const headers = [
    '* Full Name',
    '* WhatsApp Number',
    'Email',
    'Social Media Username',
    'City',
    'Full Delivery Address',
    'Postal Code',
    'Customer Segment',
    'Active Status',
    'Special Notes',
  ];

  const samples = [
    [
      'Clarissa Angelina',
      '081288992211',
      'clarissa.angel@gmail.com',
      '@clarissangela',
      'Jakarta Selatan',
      'Jl. Senopati Raya No. 45, Kebayoran Baru',
      '12190',
      'PRIORITY',
      'AKTIF',
      'VIP customer, suka titip kosmetik Jepang & Gentle Woman',
    ],
    [
      'Budi Santoso',
      '085712345678',
      'budi.santoso@yahoo.com',
      '@budi_s',
      'Makassar',
      'Jl. AP Pettarani Blok B-12',
      '90222',
      'REGULAR',
      'AKTIF',
      'Titip sneaker dan streetwear',
    ],
    [
      'Nadia Putri Utami',
      '6281900112233',
      '',
      '@nadiaputri',
      'Bandung',
      'Jl. Riau No. 88, Citarum',
      '40115',
      'REGULAR',
      'AKTIF',
      'Pelanggan via Instagram',
    ],
  ];

  // Sheet 1: Template Upload
  const wsData = XLSX.utils.aoa_to_sheet([
    ['EXCEL UPLOAD TEMPLATE - CUSTOMER DATA', ...Array(headers.length - 1).fill(null)],
    [
      'Module: Master Data Customers | Starts row 4 | DO NOT CHANGE ROW 3 HEADERS',
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
    { wch: 28 }, // Full Name
    { wch: 22 }, // WhatsApp Number
    { wch: 26 }, // Email
    { wch: 20 }, // Medsos
    { wch: 20 }, // City
    { wch: 45 }, // Alamat
    { wch: 14 }, // Postal Code
    { wch: 18 }, // Segmen
    { wch: 14 }, // Status
    { wch: 45 }, // Catatan
  ];
  XLSX.utils.book_append_sheet(wb, wsData, 'Template Upload');

  // Sheet 2: Instructions
  const tutorialData: any[][] = [
    ['INSTRUCTIONS FOR FILLING CUSTOMER DATA UPLOAD TEMPLATE'],
    ["Module: Customers | Data sheet: 'Template Upload'"],
    ['1. HOW TO USE'],
    [
      1,
      "Fill data starting from row 4 (rows 1 & 2 titles, row 3 headers — DO NOT alter/delete).",
    ],
    [2, 'One row = one customer data.'],
    [3, 'Columns with an asterisk (*) are REQUIRED FIELDS.'],
    [4, 'WhatsApp number must start with 08 or 62 (e.g. 081234567890 or 6281234567890).'],
    [
      5,
      'Check preview before saving. Resolve rows with INVALID status before continuing.',
    ],
    ['2. COLUMN EXPLANATIONS'],
    ['No', 'Column', 'Required?', 'Format', 'Description'],
    ['1', 'Full Name', 'Yes', 'Text', "Customer's full name or nickname (min 2 chars)."],
    [
      '2',
      'WhatsApp Number',
      'Yes',
      'Nomor/Text',
      'Active WA number for invoices. Format: 08xxx or 628xxx (9-15 digits).',
    ],
    ['3', 'Email', 'No', 'Email', 'Valid email format (e.g. name@domain.com).'],
    ['4', 'Social Media Username', 'No', 'Text', "Instagram/TikTok username (e.g. @sitirahma)."],
    ['5', 'City', 'No', 'Text', 'Customer domicile city for shipping calculation.'],
    ['6', 'Full Delivery Address', 'No', 'Text', 'Full courier delivery address.'],
    ['7', 'Postal Code', 'No', 'Number', '5-digit postal code.'],
    ['8', 'Customer Segment', 'No', 'Enum', 'REGULAR / PRIORITY / PROBLEM / INACTIVE.'],
    ['9', 'Active Status', 'No', 'Enum', 'ACTIVE / INACTIVE (Default: ACTIVE).'],
    ['10', 'Special Notes', 'No', 'Text', 'Internal notes regarding preferences.'],
    ['3. FILLING EXAMPLES'],
    headers,
    ...samples,
    ['Note: examples above are illustrations. WA numbers must be unique.'],
    ['4. IMPORTANT NOTES'],
    [1, "Do not change titles (rows 1-2) or header names (row 3)."],
    [2, "Do not add new columns to the 'Template Upload' sheet."],
    [3, 'WhatsApp numbers must be numeric without spaces or hyphens.'],
    [4, 'If any rows are INVALID during preview, correct Excel file and re-upload.'],
  ];

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
    { s: { r: 20, c: 0 }, e: { r: 20, c: 5 } },
    { s: { r: 25, c: 0 }, e: { r: 25, c: 5 } },
    { s: { r: 26, c: 1 }, e: { r: 26, c: 5 } },
    { s: { r: 27, c: 1 }, e: { r: 27, c: 5 } },
    { s: { r: 28, c: 1 }, e: { r: 28, c: 5 } },
    { s: { r: 29, c: 1 }, e: { r: 29, c: 5 } },
  ];

  styleTutorialSheet(wsTutorial, 21, headers.length);
  wsTutorial['!cols'] = [
    { wch: 8 },
    { wch: 28 },
    { wch: 14 },
    { wch: 22 },
    { wch: 55 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsTutorial, 'Instructions');
}
