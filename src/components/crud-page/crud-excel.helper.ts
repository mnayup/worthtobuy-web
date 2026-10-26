import { exportToExcel, downloadExcelTemplate } from '~/lib/excel';
import {
  downloadMasterDataTemplate,
  type MasterDataEntity,
} from '~/lib/master-data-templates';
import type { ColumnConfig, FieldConfig } from '~/types';

function formatExportValue(val: any, row: any, col: ColumnConfig): string | number | boolean | null | undefined {
  if (col.exportValue) {
    return col.exportValue(row);
  }

  if (val === null || val === undefined) {
    return '';
  }

  if (typeof val === 'number' || typeof val === 'boolean') {
    return val;
  }

  // Handle Date objects or ISO strings for dates
  if (val instanceof Date) {
    return val.toISOString().slice(0, 10);
  }

  if (typeof val === 'object') {
    // If it's an array of items/objects
    if (Array.isArray(val)) {
      if (val.length === 0) return '-';
      return val
        .map((item) => {
          if (typeof item === 'object' && item !== null) {
            return (
              item.fullName ||
              item.full_name ||
              item.name ||
              item.code ||
              item.title ||
              JSON.stringify(item)
            );
          }
          return String(item);
        })
        .join(', ');
    }

    // Common entity relations (Customer, Period/Event, User, ShippingCounter, WhatsAppGroup)
    return (
      val.fullName ||
      val.full_name ||
      val.name ||
      val.code ||
      val.username ||
      val.title ||
      val.label ||
      '-'
    );
  }

  return val;
}

export function handleExportExcel(
  title: string,
  columns: ColumnConfig[],
  data: any[]
) {
  const headers = columns.map((col) => col.label);
  const rows = data.map((row) =>
    columns.map((col) => {
      // Direct property or nested path if key contains dot (e.g. "customer.name")
      let val = row[col.key];
      if (val === undefined && col.key.includes('.')) {
        val = col.key.split('.').reduce((acc, part) => acc?.[part], row);
      }
      return formatExportValue(val, row, col);
    })
  );
  const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;
  exportToExcel(filename, title.slice(0, 30), headers, rows);
}

export function handleDownloadSampleExcel(
  title: string,
  fields: FieldConfig[],
  resolvedEntityType?: MasterDataEntity,
  activeEvents: any[] = []
) {
  if (resolvedEntityType) {
    downloadMasterDataTemplate(resolvedEntityType, { activeEvents });
    return;
  }

  const headers = fields.map((f) => f.name);
  const sampleRow = fields.map((f) => {
    if (f.type === 'number') return 0;
    if (f.type === 'date') return new Date().toISOString().slice(0, 10);
    if (f.type === 'datetime-local') return new Date().toISOString().slice(0, 16);
    if (f.options?.length) return String(f.options[0].value);
    return `Sample ${f.label}`;
  });
  const filename = `template-${title.toLowerCase().replace(/\s+/g, '-')}.xlsx`;
  downloadExcelTemplate(filename, 'Template', headers, [sampleRow]);
}
