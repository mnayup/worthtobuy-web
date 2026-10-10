import type { MasterDataEntity } from '../master-data-templates';

export interface RowIssue {
  field: string;
  fieldLabel: string;
  error: string;
  fixHint: string;
  enteredValue?: any;
}

export interface ValidatedImportRow {
  rowNumber: number; // 1-indexed matching Excel row
  status: 'VALID' | 'INVALID';
  payload: Record<string, any>;
  rawValues: Record<string, any>;
  issues: RowIssue[];
  identifier: string;
}

export interface ValidationSummary {
  entity: MasterDataEntity;
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: ValidatedImportRow[];
  allIssues: Array<RowIssue & { rowNumber: number; identifier: string }>;
}
