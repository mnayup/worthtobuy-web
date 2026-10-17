import type { ReactNode } from 'react';

export type User = {
  id: number;
  name: string;
  username?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  role: 'OWNER' | 'ADMIN' | 'SHOPPER' | 'FINANCE' | string;
  roleId?: number;
  canViewProfit: boolean;
  permissions?: string[];
  mfaEnabled?: boolean;
};
export type Paginated<T>={data:T[];total:number;page:number;limit:number};
export type Option={label:string;value:string|number;[key:string]:any};
export type FieldConfig={
  name:string;
  label:string;
  type?:
    | 'text'
    | 'number'
    | 'currency'
    | 'date'
    | 'datetime-local'
    | 'datetimerange'
    | 'textarea'
    | 'select'
    | 'email'
    | 'url'
    | 'file'
    | 'image'
    | 'images'
    | 'document'
    | 'toggle'
    | 'tel'
    | 'tags'
    | 'variant-quantities'
    | 'additional-fees';
  fileType?:'image'|'document'|'all';
  entityType?:string;
  accept?:string;
  required?:boolean;
  options?:Option[];
  placeholder?:string;
  colSpan?:2;
  defaultValue?:unknown | (() => unknown);
  searchable?:boolean;
  loadOptions?:(search:string, form?:Record<string,any>)=>Promise<Option[]>;
  dependsOn?:(form:Record<string,any>)=>boolean;
  max?:number | string | ((form:Record<string,any>)=>number | string | undefined);
  disabled?: boolean | ((form: any) => boolean);
  onChange?: (
    value: any,
    option: Option | undefined,
    set: (field: string, value: any) => void,
    form?: Record<string, any>
  ) => void;
};
export type ColumnConfig={
  key:string;
  label:string;
  render?:(row:any)=>ReactNode;
  sortable?:boolean;
  sortKey?:string;
  sortFn?:(a:any, b:any)=>number;
};
export type BulkStatusConfig={
  label:string;
  options:Option[];
  apply:(id:string,value:string|number)=>Promise<unknown>;
};
export type ExcelImportConfig = {
  sampleFileName?: string;
  entityType?: 'customers' | 'products' | 'events';
  transformRow?: (row: Record<string, string>) => Record<string, unknown>;
  getActiveEvents?: () => Promise<Array<{ id: number; code: string; name: string; city?: string }>>;
};
export type TableFilterOption = {
  label: string;
  value: string | number;
};

export type TableFilterConfig = {
  key: string;
  label: string;
  options: TableFilterOption[];
  placeholder?: string;
};
