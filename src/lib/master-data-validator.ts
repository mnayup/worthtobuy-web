import XLSX from 'xlsx-js-style';
import type { MasterDataEntity } from './master-data-templates';
import type { RowIssue, ValidatedImportRow, ValidationSummary } from './validator/validator-types';
import { buildHeaderMap } from './validator/validator-utils';
import { validateCustomerRow } from './validator/validate-customers';
import { validateProductRow } from './validator/validate-products';
import { validateEventRow } from './validator/validate-events';

export type { RowIssue, ValidatedImportRow, ValidationSummary };

/**
 * Validates an uploaded Excel file for Customers, Products, or Events.
 */
export async function validateMasterDataImport(
  entity: MasterDataEntity,
  file: File,
  extraContext?: {
    events?: Array<{ id: number; code: string; name: string }>;
  }
): Promise<ValidationSummary> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

  let targetSheetName = workbook.SheetNames[0];
  const uploadSheetMatch = workbook.SheetNames.find(
    (s) => s.toLowerCase().includes('upload') || s.toLowerCase().includes('template data')
  );
  if (uploadSheetMatch) targetSheetName = uploadSheetMatch;

  if (!targetSheetName) {
    throw new Error('File Excel tidak memiliki lembar kerja (worksheet).');
  }

  const worksheet = workbook.Sheets[targetSheetName];
  const rawAoa: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  if (rawAoa.length < 2) {
    throw new Error('File Excel harus memiliki minimal 1 baris header dan 1 baris data.');
  }

  let headerRowIdx = 0;
  let headerRow: string[] = [];
  let headerMap: Record<string, string> = {};

  for (let r = 0; r < Math.min(6, rawAoa.length); r++) {
    const candidateRow = rawAoa[r].map((h) => String(h || '').trim());
    const candidateMap = buildHeaderMap(entity, candidateRow);
    if (Object.keys(candidateMap).length > 0) {
      headerRowIdx = r;
      headerRow = candidateRow;
      headerMap = candidateMap;
      break;
    }
  }

  if (Object.keys(headerMap).length === 0) {
    headerRowIdx = 0;
    headerRow = rawAoa[0].map((h) => String(h || '').trim());
    headerMap = buildHeaderMap(entity, headerRow);
  }

  let dataRowsStartIdx = headerRowIdx + 1;
  if (dataRowsStartIdx < rawAoa.length) {
    const nextRowStr = rawAoa[dataRowsStartIdx].map((c) => String(c)).join(' ');
    if (
      nextRowStr.includes('[Wajib') ||
      nextRowStr.includes('[Opsional') ||
      nextRowStr.includes('[Format')
    ) {
      dataRowsStartIdx++;
    }
  }

  const seenKeys = new Map<string, number>();
  const rows: ValidatedImportRow[] = [];
  const allIssues: Array<RowIssue & { rowNumber: number; identifier: string }> = [];

  for (let i = dataRowsStartIdx; i < rawAoa.length; i++) {
    const lineCells = rawAoa[i] || [];
    const isCompletelyEmpty = lineCells.every(
      (cell) => cell === '' || cell === null || cell === undefined
    );
    if (isCompletelyEmpty) continue;

    const excelRowNumber = i + 1;
    const rawValues: Record<string, any> = {};

    headerRow.forEach((h, colIdx) => {
      const field = headerMap[h];
      if (field) {
        rawValues[field] = lineCells[colIdx] !== undefined ? lineCells[colIdx] : '';
      }
    });

    const issues: RowIssue[] = [];
    let payload: Record<string, any> = {};
    let identifier = '';

    if (entity === 'customers') {
      const res = validateCustomerRow(rawValues, excelRowNumber, seenKeys);
      payload = res.payload;
      issues.push(...res.issues);
      identifier = payload.fullName || `Customer Row ${excelRowNumber}`;
    } else if (entity === 'products') {
      const res = validateProductRow(
        rawValues,
        excelRowNumber,
        seenKeys,
        extraContext?.events || []
      );
      payload = res.payload;
      issues.push(...res.issues);
      identifier = payload.name || `Produk Row ${excelRowNumber}`;
    } else if (entity === 'events') {
      const res = validateEventRow(rawValues, excelRowNumber, seenKeys);
      payload = res.payload;
      issues.push(...res.issues);
      identifier = payload.name || `Event Row ${excelRowNumber}`;
    }

    const rowStatus: 'VALID' | 'INVALID' = issues.length === 0 ? 'VALID' : 'INVALID';

    issues.forEach((iss) => {
      allIssues.push({ ...iss, rowNumber: excelRowNumber, identifier });
    });

    rows.push({
      rowNumber: excelRowNumber,
      status: rowStatus,
      payload,
      rawValues,
      issues,
      identifier,
    });
  }

  const validRows = rows.filter((r) => r.status === 'VALID').length;
  const invalidRows = rows.filter((r) => r.status === 'INVALID').length;

  return {
    entity,
    fileName: file.name,
    totalRows: rows.length,
    validRows,
    invalidRows,
    rows,
    allIssues,
  };
}
