import type { FieldConfig, TableFilterConfig } from '~/types';

export type SavedFilter = {
  name: string;
  search: string;
  filters?: Record<string, string>;
};

export type ImportPreviewRow = {
  line: number;
  payload: Record<string, any>;
  issues: string[];
};

export function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function isExcludedFilterKey(key: string, label: string): boolean {
  const lowerKey = key.toLowerCase();
  const lowerLabel = label.toLowerCase();
  const unique = [
    'id', 'sku', 'code', 'number', 'whatsapp', 'phone', 'email', 'tracking',
    'barcode', 'url', 'image', 'photo', 'proof'
  ];
  if (unique.some((k) => lowerKey === k || lowerKey.endsWith(k) || lowerLabel.includes(k))) {
    return true;
  }
  const financial = [
    'price', 'amount', 'bill', 'fee', 'cost', 'subtotal', 'discount', 'balance',
    'difference', 'tax', 'rate', 'revenue', 'omzet', 'weight', 'stock',
    'available', 'reserved', 'capacity', 'quota'
  ];
  if (financial.some((k) => lowerKey.includes(k) || lowerLabel.includes(k))) {
    return true;
  }
  const texts = [
    'date', 'time', 'created', 'updated', 'at', 'departure', 'return', 'notes',
    'address', 'description', 'remarks', 'reason', 'message', 'items', 'item',
    'fullname', 'name'
  ];
  if (texts.some((k) => lowerKey === k || lowerKey.endsWith(k) || lowerLabel.includes(k))) {
    return true;
  }
  return false;
}

export function resolveFilterOptions(
  fields: FieldConfig[],
  customFilters?: TableFilterConfig[]
): TableFilterConfig[] {
  if (customFilters && customFilters.length > 0) return customFilters;
  const list: TableFilterConfig[] = [];

  for (const f of fields) {
    if (isExcludedFilterKey(f.name, f.label)) continue;
    if (f.type === 'select' && f.options && f.options.length > 0) {
      list.push({
        key: f.name,
        label: f.label,
        options: f.options.map((opt) => ({ label: opt.label, value: opt.value })),
      });
    } else if (f.type === 'toggle') {
      list.push({
        key: f.name,
        label: f.label,
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
      });
    }
  }
  return list;
}
