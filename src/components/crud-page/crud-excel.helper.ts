import { exportToExcel, downloadExcelTemplate } from '~/lib/excel';
import {
  downloadMasterDataTemplate,
  type MasterDataEntity,
} from '~/lib/master-data-templates';
import type { ColumnConfig, FieldConfig } from '~/types';

export function handleExportExcel(
  title: string,
  columns: ColumnConfig[],
  data: any[]
) {
  const headers = columns.map((col) => col.label);
  const rows = data.map((row) =>
    columns.map((col) => {
      const val = row[col.key];
      return typeof val === 'object' && val !== null
        ? JSON.stringify(val)
        : (val ?? '');
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
