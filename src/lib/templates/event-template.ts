import XLSX from 'xlsx-js-style';
import { applyRowStyles, styleSheetHeaderBanner, styleTutorialSheet } from './template-styles';

export function buildEventsWorkbook(wb: any) {
  const headers = [
    '* Event Name',
    '* Event Type (LOCAL / INTERNATIONAL)',
    '* Destination City / Country',
    'Event Code (Optional)',
    '* Event Status',
    '* Departure Date (YYYY-MM-DD)',
    '* Return Date (YYYY-MM-DD)',
    '* Order Open Date (YYYY-MM-DD)',
    '* Order Close Date (YYYY-MM-DD)',
    'Est. Shipping Date (YYYY-MM-DD)',
    'Max Items Quota',
    'Baggage Capacity (Kg)',
    'Event Notes',
  ];

  const samples = [
    [
      'Bangkok Summer Mega Shopping Trip',
      'INTERNATIONAL',
      'Bangkok, Thailand',
      'EVT-BKK-JUN26',
      'OPEN',
      '2026-06-15 08:00',
      '2026-06-22 20:00',
      '2026-05-15',
      '2026-06-12',
      '2026-06-25',
      150,
      40,
      'Trip fokus Siam Square, Chatuchak, Big C Rajdamri',
    ],
    [
      'Tokyo Autumn Snacks & Cosmetics',
      'INTERNATIONAL',
      'Tokyo, Japan',
      'EVT-TYO-NOV26',
      'DRAFT',
      '2026-11-20',
      '2026-11-28',
      '2026-10-25',
      '2026-11-18',
      '2026-12-02',
      200,
      50,
      'Trip belanja Donki, Ginza, Akihabara',
    ],
  ];

  const wsData = XLSX.utils.aoa_to_sheet([
    ['EXCEL UPLOAD TEMPLATE - SHOPPING EVENT / TRIP', ...Array(headers.length - 1).fill(null)],
    [
      'Module: Master Data Events | Starts row 4 | DO NOT CHANGE ROW 3 HEADERS',
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
    { wch: 26 },
    { wch: 20 },
    { wch: 18 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 16 },
    { wch: 20 },
    { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(wb, wsData, 'Template Upload');

  const tutorialData: any[][] = [
    ['INSTRUCTIONS FOR FILLING EVENT DATA UPLOAD TEMPLATE'],
    ["Module: Events & Trips | Data sheet: 'Template Upload'"],
    ['1. HOW TO USE'],
    [
      1,
      "Fill data starting from row 4 (rows 1 & 2 titles, row 3 headers — DO NOT alter/delete).",
    ],
    [
      2,
      'DATE LOGIC: Return Date >= Departure Date. Close Date >= Open Date.',
    ],
    [
      3,
      'DATE FORMAT: YYYY-MM-DD (e.g. 2026-11-20) or YYYY-MM-DD HH:mm (e.g. 2026-11-20 08:00).',
    ],
    [4, 'EVENT CODE: Unique. Leave blank to auto-generate EVT-BLNTHN-XXXX.'],
    [
      5,
      'Check preview before saving. Please verify rows with INVALID status.',
    ],
    ['2. COLUMN EXPLANATIONS'],
    ['No', 'Column', 'Required?', 'Format', 'Description'],
    ['1', 'Event Name', 'Yes', 'Text', 'Shopping trip event name (min 3 chars).'],
    ['2', 'Event Type', 'Yes', 'Enum', 'Select LOCAL or INTERNATIONAL.'],
    ['3', 'City Tujuan', 'Yes', 'Text', 'Trip destination city/country.'],
    ['4', 'Event Code', 'No', 'Text Unik', 'Unique code. Blank = auto-generate.'],
    ['5', 'Event Status', 'Yes', 'Enum', 'DRAFT / OPEN / CLOSED / COMPLETED / CANCELLED.'],
    ['6', 'Trip Departure Date', 'Yes', 'Date', 'YYYY-MM-DD or YYYY-MM-DD HH:mm.'],
    ['7', 'Trip Return Date', 'Yes', 'Date', 'Must be >= Trip Departure Date.'],
    ['8', 'Order Open Date', 'Yes', 'Date', 'YYYY-MM-DD or YYYY-MM-DD HH:mm.'],
    ['9', 'Order Close Date', 'Yes', 'Date', 'Must be >= Order Open Date.'],
    ['10', 'Est. Delivery Date', 'No', 'Date', 'Estimated customer shipment date.'],
    ['11', 'Max Item Quota', 'No', 'Number', 'Quota for requested items.'],
    ['12', 'Baggage Capacity (Kg)', 'No', 'Number', 'Total baggage capacity in kg.'],
    ['13', 'Event Notes', 'No', 'Text', 'Internal notes for schedule/routes.'],
    ['3. FILLING EXAMPLES'],
    headers,
    ...samples,
    ['Note: examples above are illustrations.'],
    ['4. IMPORTANT NOTES'],
    [1, "Do not change titles (rows 1-2) or header names (row 3)."],
    [2, "Do not add new columns to the 'Template Upload' sheet."],
    [3, 'Ensure valid date order (Departure <= Return & Open <= Close).'],
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
    { s: { r: 23, c: 0 }, e: { r: 23, c: 5 } },
  ];

  styleTutorialSheet(wsTutorial, 24, headers.length);
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
