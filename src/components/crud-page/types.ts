import type { ReactNode } from 'react';
import type {
  BulkStatusConfig,
  ColumnConfig,
  ExcelImportConfig,
  FieldConfig,
  TableFilterConfig,
} from '~/types';

export type CrudPageProps = {
  title: string;
  description: string;
  endpoint: string;
  columns: ColumnConfig[];
  fields: FieldConfig[];
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canEditRow?: (row: any) => boolean;
  canDeleteRow?: (row: any) => boolean;
  canSelectRow?: (row: any, selectedRows?: any[]) => boolean;
  getSelectDisabledReason?: (row: any, selectedRows?: any[]) => string | undefined;
  prepareInitial?: (row: any) => Record<string, any>;
  prepareSubmit?: (form: Record<string, any>) => Record<string, any>;
  renderActions?: (row: any) => ReactNode;
  bulkStatus?: BulkStatusConfig;
  importConfig?: ExcelImportConfig;
  topContent?: ReactNode;
  entityName?: string;
  extraQuery?: Record<string, string | number | undefined>;
  filters?: TableFilterConfig[];
  searchPlaceholder?: string;
  selectable?: boolean;
  canBulkDelete?: boolean;
  renderBulkActions?: (params: {
    selectedIds: string[];
    selectedRows: any[];
    clearSelection: () => void;
    reload: () => void;
  }) => ReactNode;
};
