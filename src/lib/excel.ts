import XLSX from 'xlsx-js-style';

/**
 * Exports data to an Excel (.xlsx) file with styled navy headers and auto column widths.
 */
export function exportToExcel(
  filename: string,
  sheetName: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) {
  const data = [headers, ...rows.map((row) => row.map((cell) => (cell === null || cell === undefined ? '' : cell)))];
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  const borderStyle = {
    top: { style: 'thin', color: { rgb: 'E2E8F0' } },
    bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
    left: { style: 'thin', color: { rgb: 'E2E8F0' } },
    right: { style: 'thin', color: { rgb: 'E2E8F0' } },
  };

  const headerBorderStyle = {
    top: { style: 'medium', color: { rgb: '1E293B' } },
    bottom: { style: 'medium', color: { rgb: '1E293B' } },
    left: { style: 'thin', color: { rgb: '334155' } },
    right: { style: 'thin', color: { rgb: '334155' } },
  };

  // Style Header Row (Row 0)
  headers.forEach((_, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = {
        fill: { fgColor: { rgb: '1E293B' } },
        font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
        alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
        border: headerBorderStyle,
      };
    }
  });

  // Style Data Rows
  rows.forEach((row, rowIndex) => {
    const r = rowIndex + 1;
    const isEven = rowIndex % 2 === 1;
    const rowBgColor = isEven ? 'F8FAFC' : 'FFFFFF';

    row.forEach((cellVal, colIndex) => {
      const cellRef = XLSX.utils.encode_cell({ r, c: colIndex });
      const cell = worksheet[cellRef];
      if (!cell) return;

      const isNumeric = typeof cellVal === 'number';
      const isDateString = typeof cellVal === 'string' && /^\d{4}-\d{2}-\d{2}/.test(cellVal);
      const isShortCode = typeof cellVal === 'string' && cellVal.length <= 15 && /^[A-Z0-9_\-#]+$/i.test(cellVal);

      const alignment = isNumeric
        ? { vertical: 'center', horizontal: 'right' }
        : isDateString || isShortCode
        ? { vertical: 'center', horizontal: 'center' }
        : { vertical: 'center', horizontal: 'left', wrapText: String(cellVal).includes('\n') };

      cell.s = {
        fill: { fgColor: { rgb: rowBgColor } },
        font: { name: 'Calibri', sz: 10, color: { rgb: '0F172A' } },
        alignment,
        border: borderStyle,
      };

      // Number formatting for currency-like or integer values
      if (isNumeric) {
        if (Number.isInteger(cellVal)) {
          cell.z = '#,##0';
        } else {
          cell.z = '#,##0.00';
        }
      }
    });
  });

  // Set Row Heights
  worksheet['!rows'] = [
    { hpt: 26 }, // Header row
    ...rows.map(() => ({ hpt: 20 })),
  ];

  // Auto-calculate column widths
  const colWidths = headers.map((header, colIndex) => {
    let maxLength = String(header).length;
    for (let r = 0; r < rows.length; r++) {
      const cellVal = rows[r]?.[colIndex];
      if (cellVal !== undefined && cellVal !== null) {
        const strVal = String(cellVal);
        // Handle multiline strings
        const lines = strVal.split('\n');
        for (const line of lines) {
          maxLength = Math.max(maxLength, line.length);
        }
      }
    }
    return { wch: Math.min(Math.max(maxLength + 4, 12), 65) };
  });
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || 'Data');

  const finalName = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  XLSX.writeFile(workbook, finalName);
}

/**
 * Reads an uploaded Excel (.xlsx, .xls) or CSV file and returns 2D array of strings.
 */
export async function readExcelFile(file: File): Promise<string[][]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error('File Excel tidak memiliki lembar kerja (worksheet).');
  }
  const worksheet = workbook.Sheets[sheetName];
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  // Filter out completely empty trailing rows
  return rawRows
    .map((row) => (Array.isArray(row) ? row.map((cell) => (cell === null || cell === undefined ? '' : String(cell).trim())) : []))
    .filter((row) => row.some((cell) => cell.length > 0));
}

/**
 * Downloads a sample template Excel (.xlsx) file.
 */
export function downloadExcelTemplate(
  filename: string,
  sheetName: string,
  headers: string[],
  sampleRows?: (string | number)[][]
) {
  exportToExcel(filename, sheetName, headers, sampleRows || []);
}
