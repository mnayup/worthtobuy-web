export interface FeeRule {
  id: string;
  label: string;
  min: number;
  max: number | null;
  type: 'FIXED' | 'PERCENT';
  value: number;
  active?: boolean;
}

export const fallbackRules: FeeRule[] = [
  { id: '1', label: '≤ Rp10.000', min: 0, max: 10000, type: 'FIXED', value: 3000 },
  { id: '2', label: 'Rp10.001 – Rp49.000', min: 10001, max: 49000, type: 'FIXED', value: 6000 },
  { id: '3', label: 'Rp49.001 – Rp99.000', min: 49001, max: 99000, type: 'FIXED', value: 10000 },
  {
    id: '4',
    label: 'Rp99.001 – Rp199.000',
    min: 99001,
    max: 199000,
    type: 'FIXED',
    value: 15000,
  },
  {
    id: '5',
    label: 'Rp199.001 – Rp299.000',
    min: 199001,
    max: 299000,
    type: 'FIXED',
    value: 20000,
  },
  {
    id: '6',
    label: 'Rp299.001 – Rp399.000',
    min: 299001,
    max: 399000,
    type: 'FIXED',
    value: 25000,
  },
  {
    id: '7',
    label: 'Rp399.001 – Rp499.000',
    min: 399001,
    max: 499000,
    type: 'FIXED',
    value: 30000,
  },
  {
    id: '8',
    label: 'Rp499.001 – Rp599.000',
    min: 499001,
    max: 599000,
    type: 'FIXED',
    value: 35000,
  },
  {
    id: '9',
    label: 'Rp599.001 – Rp699.000',
    min: 599001,
    max: 699000,
    type: 'FIXED',
    value: 40000,
  },
  { id: '10', label: '> Rp699.000', min: 699001, max: null, type: 'PERCENT', value: 7 },
];
