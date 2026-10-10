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

  // Style Header Row (Row 1)
  headers.forEach((_, colIndex) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIndex });
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = {
        fill: { fgColor: { rgb: '1F3864' } },
        font: { name: 'Calibri', sz: 11, bold: true, color: { rgb: 'FFFFFF' } },
        alignment: { vertical: 'center', horizontal: 'center' },
      };
    }
  });

  // Auto-calculate column widths
  const colWidths = headers.map((header, colIndex) => {
    let maxLength = String(header).length;
    for (let r = 0; r < rows.length; r++) {
      const cellVal = rows[r]?.[colIndex];
      if (cellVal !== undefined && cellVal !== null) {
        maxLength = Math.max(maxLength, String(cellVal).length);
      }
    }
    return { wch: Math.min(Math.max(maxLength + 3, 12), 60) };
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
